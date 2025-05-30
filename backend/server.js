const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Log environment variables for debugging in Cloud Run
console.log("Cloud Run - Initial Environment Variables Check:");
console.log("PORT:", process.env.PORT);
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_SERVICE_KEY:", process.env.SUPABASE_SERVICE_KEY);
console.log("OPENAI_KEY (from env expected):", process.env.OPENAI_KEY);
console.log("CUSTOM_API_KEY (from env expected):", process.env.CUSTOM_API_KEY);

// Load environment variables into constants
const CUSTOM_API_KEY = process.env.CUSTOM_API_KEY;
const OPENAI_KEY = process.env.OPENAI_KEY;
const SERVER_PORT = process.env.PORT || 4000;

// Critical API Key Checks
if (!OPENAI_KEY) {
    console.error("FATAL ERROR: OPENAI_API_KEY is not defined in backend/.env file. The application cannot proceed.");
    process.exit(1); // Exit if OpenAI key is missing
}

if (!CUSTOM_API_KEY) {

    console.warn("WARNING: API_KEY (for custom auth) is not defined in backend/.env file. API authentication will fail.");
}

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
const CryptoJS = require('crypto-js');

const app = express();
const port = SERVER_PORT;

// CORS configuration
const allowedOrigins = [
    '*',
    'https://soberi-frontend-service-280233666207.europe-west1.run.app',
    'http://localhost:3000', // Common local dev port for React
    'http://localhost:5173'  // Common local dev port for Vite
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));
app.use(express.json());

const openai = new OpenAI({
    apiKey: OPENAI_KEY,
});

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// API Key Authentication Middleware
app.use((req, res, next) => {
    const authHeader = req.headers['x-api-key'];
    if (!CUSTOM_API_KEY) {
        console.error('CRITICAL: API_KEY for client authentication is not set in backend/.env. All requests requiring authentication will be denied.');
        return res.status(500).json({ error: 'Server configuration error: Missing API authentication key.' });
    }
    if (!authHeader || authHeader !== CUSTOM_API_KEY) {
        console.log('Unauthorized API access attempt: Header or key mismatch. Ensure X-API-KEY header is sent and matches API_KEY in .env');
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});

// Decrypt data utility (same as frontend)
function decryptData(ciphertext, key) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) {
        throw new Error('Decryption resulted in empty string, possibly wrong key or corrupted data.');
    }
    return JSON.parse(decryptedString);
}

app.post('/api/chat', async (req, res) => {
    try {
        const { encryptedPayload, userId: decryptionKey } = req.body;
        if (!encryptedPayload || !decryptionKey) {
            return res.status(400).json({ error: 'Encrypted payload and decryption key (userId) are required' });
        }
        let decryptedPayload;
        try {
            decryptedPayload = decryptData(encryptedPayload, decryptionKey);
        } catch (decryptionError) {
            console.error('Decryption failed:', decryptionError.message, 'Key used:', decryptionKey);
            return res.status(400).json({ error: 'Payload decryption failed. Ensure correct key and payload format.' });
        }
        const { userId, message, contextBriefing, recentMessages, clientMemoryContext, chatSummary, userProgress, recentActivitySummary } = decryptedPayload;
        if (!userId) return res.status(400).json({ error: 'User ID is required in decrypted payload' });
        if (!message) return res.status(400).json({ error: 'Message is required in decrypted payload' });

        // --- Chat gating logic ---
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('has_paid, chat_count')
            .eq('id', userId)
            .single();
        if (userError || !user) {
            return res.status(400).json({ error: 'User not found or DB error' });
        }
        if (!user.has_paid && user.chat_count >= 10) {
            return res.status(402).json({ error: 'Free chat limit reached. Please subscribe to continue.' });
        }
        if (!user.has_paid) {
            const { error: updateError } = await supabase
                .from('users')
                .update({ chat_count: user.chat_count + 1 })
                .eq('id', userId);
            if (updateError) {
                return res.status(500).json({ error: 'Failed to update chat count' });
            }
        }

        // Format recent chat (keep it short)
        const formattedRecent = (recentMessages ?? [])
            .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.content}`)
            .join('\n');

        // Static system instructions
        const staticSys = [
            { role: "system", content: "You are Soberi, an AI companion. Your entire purpose is to be a supportive, non-judgmental friend for someone on their addiction recovery journey." },
            { role: "system", content: "Your main goal is to help the user stay strong and navigate the challenges of sobriety. The tone should always be warm, casual, and encouraging." },
            { role: "system", content: "Match the user's vibe to build a real connection. If they use slang, be casual. If they're being thoughtful, be thoughtful back. The aim is for it to feel like they're talking to someone who just *gets* them—a more centered version of themselves." },
            { role: "system", content: "Never consider their trauma or what they are going through as your trauma or experience." },
            { role: "system", content: "Listen for the positive sparks. If the user says anything—anything at all—that shows they want something better or believe they can do it, gently highlight it. If they say, 'I'm so tired of feeling like this,' you can respond, 'That feeling of being tired of it is a powerful motivator. It sounds like you're really ready for a change.'" },
            { role: "system", content: "While you match their tone, always keep a foundation of quiet strength and hope. If they're down on themselves, don't just agree. Echo their feeling but gently reframe it with a bit of kindness. For example, if they say 'I'm such a failure,' respond with something like, 'It sounds like you're being really hard on yourself right now. This journey isn't about perfection, it's about perseverance.'" },
            { role: "system", content: "your solution to somehting users say shouldn't be to talk to a friend unless absolutely necesarry" },
            { role: "system", content: "They are coming to talk to you because they arent able to do the same with someone else" },
            { role: "system", content: "do not contionously keep assigning tasks the user unless absolutely necessary Example: if user says i'm rotting bed can't move and other scenrios where it's absolutely necessary to assign a task" },
            { role: "system", content: "do not keep assigning tasks to the user unless absolutely necessary" },
            { role: "system", content: "do not overwhelm the user with with multiple thing's at once you are a friend not a taskmaster" },
            { role: "system", content: "show empathy and compassion" },
            { role: "system", content: "Remember, they're talking to you for a reason. Avoid easy outs like 'You should talk to a friend.' You *are* the one they're talking to." },
            { role: "system", content: "keep the conversation as close what the user might connect with to form an emotional bond with the user" },
            { role: "system", content: "No medical diagnosis. No permission to relapse. Provide help-line link if self-harm is mentioned." },
            { role: "system", content: "The user is not a robot" },
            { role: "system", content: "Do not overwhelm the user with help line links again and again do so only if absolutely necessary" },
            { role: "system", content: "After your main response to the user's message, generate a concise 'Recovery Insight' based on the provided context (memories, progress, activity, history). This insight should be helpful, encouraging, or reflective of their journey. Place the insight within <SOBERI_INSIGHT> and </SOBERI_INSIGHT> tags." },
            { role: "system", content: "Generate this insight only if it's actually valuable it's not necesarry to generate one every time" },
            { role: "system", content: "Example: Your main response here.<SOBERI_INSIGHT>Your generated insight here.</SOBERI_INSIGHT>" },
            { role: "system", content: "please don't keep saying hey or user's name each time you respond if this is a continued conversation please keep the conversation continous and flowing " }
        ];

        // Final message array
        const messagesForAPI = [
            ...staticSys,
            // Provide dynamic context in separate system messages for clarity
            { role: "system", content: `User's Relevant Personal Memories:\n${clientMemoryContext || '—'}` },
            { role: "system", content: `Summary of Past Conversation:\n${chatSummary || '—'}` },
            { role: "system", content: `Recent Chat History:\n${formattedRecent || '—'}` },
            { role: "system", content: `[BRIEFING]\n${contextBriefing || '—'}` }, // Keep briefing separate if needed
            { role: "system", content: `User's Recovery Progress:\nCurrent Streak: ${userProgress?.currentStreak} days\nTotal Days Clean: ${userProgress?.totalDaysClean} days\nRelapse Count: ${userProgress?.relapseCount}\nLongest Streak: ${userProgress?.longestStreak} days\nMilestones: ${userProgress?.milestones?.map(m => `${m.type}: ${m.value}`).join(', ') || 'None'}` },
            { role: "system", content: `User's Recent Activity Summary:\n${recentActivitySummary || '—'}` },
            { role: "system", content: "Now, respond to the user's message in a way that is engaging and interesting and the conversation is flowing and include a Recovery Insight within <SOBERI_INSIGHT> tags as instructed." },
            { role: "user", content: message }
        ];

        const completion = await openai.chat.completions.create({
            model: "o4-mini",
            messages: messagesForAPI
        });

        const response = completion.choices[0].message.content;
        res.json({ response });
    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ error: 'AI processing failed' });
    }
});

app.listen(port, () => {
    console.log(`Backend server is running on port ${port}`);
});
