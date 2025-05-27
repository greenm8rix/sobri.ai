const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Load environment variables into constants immediately after dotenv.config()
const CUSTOM_API_KEY = process.env.API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const SERVER_PORT = process.env.PORT || 4000;

// Critical API Key Checks
if (!OPENAI_KEY) {
    console.error("FATAL ERROR: OPENAI_API_KEY is not defined in backend/.env file. The application cannot proceed.");
    process.exit(1); // Exit if OpenAI key is missing
}

if (!CUSTOM_API_KEY) {
    // If CUSTOM_API_KEY is essential for all operations, consider making this a fatal error too.
    // For now, a warning, as the primary function (OpenAI chat) depends more on OPENAI_KEY.
    console.warn("WARNING: API_KEY (for custom auth) is not defined in backend/.env file. API authentication will fail.");
}

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { ChromaClient } = require('chromadb');
const { OpenAIEmbeddings } = require("@langchain/openai"); // Corrected import
const { MemoryVectorStore } = require("langchain/vectorstores/memory");

const app = express();
const port = SERVER_PORT;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: OPENAI_KEY,
});

// Initialize Chroma client
// Note: ChromaClient typically requires a path or URL.
// For a simple in-memory setup for now, we might not use client directly with MemoryVectorStore
// or we might need to adjust if a persistent ChromaDB instance is intended.
// const client = new ChromaClient(); // This might need configuration if not using a default local server

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
    apiKey: OPENAI_KEY, // Ensure this is correctly loaded by dotenv
});

// Initialize vector store (using MemoryVectorStore as per the plan for simplicity)
let vectorStore;
async function initializeVectorStore() {
    vectorStore = await MemoryVectorStore.fromTexts(
        ["Initial document for store creation"], // MemoryVectorStore needs initial documents
        [{ id: 0 }], // Corresponding metadata
        embeddings
    );
    console.log("MemoryVectorStore initialized.");
}
initializeVectorStore().catch(console.error);


// Function to retrieve relevant memories
async function getRelevantMemories(message) {
    if (!vectorStore) {
        console.error("Vector store not initialized yet.");
        return [];
    }
    try {
        const results = await vectorStore.similaritySearch(message, 5);
        return results.map(result => result.pageContent);
    } catch (error) {
        console.error("Error during similarity search:", error);
        return [];
    }
}

// Function to inject memories into the prompt
function injectMemoriesIntoPrompt(message, memories) {
    let context = '';
    if (memories && memories.length > 0) {
        context = `Relevant past interactions for context:\n${memories.join('\n')}\n\n`;
    }
    return `${context}User: ${message}`;
}

const MAX_MEMORY_SIZE = 100; // Maximum number of memories to store

async function trimMemoryStore() {
    if (!vectorStore) {
        console.error("Vector store not initialized yet for trimming.");
        return;
    }
    // MemoryVectorStore doesn't have a direct way to get count or delete old vectors easily.
    // This is a placeholder as in the plan. For a real scenario, a more robust vector store
    // with proper document management (like ChromaDB with a persistent client) would be needed.
    // For MemoryVectorStore, managing size typically involves recreating the store or careful additions.
    // const numVectors = await vectorStore.getNumVectors(); // This method doesn't exist on MemoryVectorStore
    // For now, we'll log a message, as the plan's trimMemoryStore was also a placeholder.
    console.log('Memory store trimming logic would be implemented here if using a persistent vector store.');
}

// API Key Authentication Middleware
// const apiKey = process.env.API_KEY; // Now using CUSTOM_API_KEY

app.use((req, res, next) => {
    const authHeader = req.headers['x-api-key'];
    // Correctly use CUSTOM_API_KEY which holds the value from process.env.API_KEY
    if (!CUSTOM_API_KEY) { // If no API_KEY is set in .env, all authenticated requests will fail.
        console.error('CRITICAL: API_KEY for client authentication is not set in backend/.env. All requests requiring authentication will be denied.');
        return res.status(500).json({ error: 'Server configuration error: Missing API authentication key.' });
    }
    if (!authHeader || authHeader !== CUSTOM_API_KEY) {
        console.log('Unauthorized API access attempt: Header or key mismatch. Ensure X-API-KEY header is sent and matches API_KEY in .env');
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, contextBriefing } = req.body; // Added contextBriefing

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        if (!vectorStore) {
            return res.status(503).json({ error: 'Vector store not ready. Please try again shortly.' });
        }

        // Retrieve relevant memories
        const memories = await getRelevantMemories(message);

        // Inject memories into the prompt
        const prompt = injectMemoriesIntoPrompt(message, memories);

        const systemPrompt = `You are MyBoo, a compassionate and understanding AI recovery companion. Your primary goal is to support users on their journey to overcome addiction. Speak like a caring friend, not a therapist. Be empathetic, match the user's energy (whether chaotic, calm, or broken), and offer practical, small steps when they're struggling. Avoid clinical jargon. If past interactions or memories are provided below, use them to make the user feel seen and remembered. Reference specific past statements or events when it feels natural and supportive. Your tone should be human-first, honest, and sometimes even call the user out gently if needed, but always from a place of care. You are swear-friendly if the user uses such language. Help the user celebrate micro-wins and acknowledge their efforts.

Here's some context from past interactions (retrieved by backend RAG from chat history):
${memories.join('\n')}
(End of RAG context)

Additionally, here's a briefing from the client based on its local memory (e.g., recent check-ins, journal themes):
${contextBriefing || "No additional client context provided."} 
(End of client context briefing)

Now, respond to the user's current message, considering all available context.`;

        const messagesForAPI = [
            { role: "system", content: systemPrompt },
            { role: "user", content: message } // Note: 'prompt' here was user_message + context. We only send user_message now as context is in system.
        ];

        // If memories were injected into the user prompt before, we need to adjust.
        // The 'prompt' variable currently is: `${context}User: ${message}`
        // We should only send the raw 'message' from the user to the API under 'user' role.
        // The context (memories) is now part of the system prompt.

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messagesForAPI,
        });

        const response = completion.choices[0].message.content;

        // Store the message and AI response as a new memory
        // Note: The plan stores "User: message\nAI: response".
        // Consider if just the user message or key insights from it should be stored,
        // or if the AI response itself is also valuable memory.
        // For now, following the plan.
        try {
            await vectorStore.addDocuments([{ pageContent: `User: ${message}\nAI: ${response}` }]);
        } catch (error) {
            console.error("Error adding document to vector store:", error);
            // Decide if this should be a fatal error for the request or just logged
        }


        // Trim memory store if it exceeds the maximum size
        await trimMemoryStore();

        res.json({ response: response });
    } catch (error) {
        console.error('OpenAI API Error or RAG error:', error);
        res.status(500).json({ error: 'Failed to generate response from AI or process memory' });
    }
});

app.listen(port, () => {
    console.log(`Backend server is running on port ${port}`);
});
