import { v4 as uuidv4 } from './mockUtils';
import { MemoryEntry, MemoryType, Message, ConversationSummary } from '../types';
import { getMemoryEntries, getInsights } from './storageUtils';
import { getOpenAIEmbedding } from './embeddingUtils';

// Constants
const MAX_MEMORIES_TO_RETRIEVE = 5; // Maximum number of memories to retrieve for context
const MEMORY_RECENCY_WEIGHT = 0.4; // Weight for recency in memory scoring
const MEMORY_IMPORTANCE_WEIGHT = 0.2; // Weight for importance in memory scoring (reduced to balance with other factors)
const MEMORY_ACCESS_WEIGHT = 0.2; // Weight for access count in memory scoring

// Helper function to extract important information from user messages
export const extractImportantInformation = (message: string): string[] => {
  const importantPatterns = [
    // Personal feelings and state
    /I (?:feel|am feeling) (.*?)(?:\.|\?|!|$)/i,
    /I'm (?:feeling) (.*?)(?:\.|\?|!|$)/i,

    // Desires and needs
    /I (?:want|need|wish) (.*?)(?:\.|\?|!|$)/i,
    /I'm (?:trying to|attempting to) (.*?)(?:\.|\?|!|$)/i,

    // Personal history
    /I (?:used to|would) (.*?)(?:\.|\?|!|$)/i,
    /I've (?:been|had|experienced) (.*?)(?:\.|\?|!|$)/i,

    // Personal details and relationships
    /[Mm]y (?:family|friend|partner|spouse|boyfriend|girlfriend|wife|husband|father|mother|dad|mom|brother|sister|child|son|daughter) (.*?)(?:\.|\?|!|$)/i,

    // Preferences
    /I (?:like|love|enjoy|prefer) (.*?)(?:\.|\?|!|$)/i,
    /I (?:hate|dislike|can't stand|don't like) (.*?)(?:\.|\?|!|$)/i,

    // Recovery-specific
    /I (?:relapsed|slipped|used|took) (.*?)(?:\.|\?|!|$)/i,
    /I've been (?:sober|clean|in recovery) (.*?)(?:\.|\?|!|$)/i,

    // Triggers and coping mechanisms
    /(?:triggers|makes me want to use|makes me crave) (.*?)(?:\.|\?|!|$)/i,
    /(?:helps me|works for me|coping strategy) (.*?)(?:\.|\?|!|$)/i,
  ];

  const insights: string[] = [];

  // Check each pattern and extract matches
  for (const pattern of importantPatterns) {
    const matches = message.match(pattern);
    if (matches && matches.length > 0) {
      insights.push(matches[0]);
    }
  }

  return insights;
};

// Detect the topics in a message
export const detectMessageTopic = (message: string): string[] => {
  const topicKeywords = {
    'relapse': ['relapse', 'slip', 'used again', 'fell off', 'back to square one', 'using again', 'took', 'drank'],
    'craving': ['craving', 'urge', 'want to use', 'tempted', 'thinking about using', 'desire', 'need'],
    'triggers': ['trigger', 'makes me want', 'when I see', 'around people who', 'reminded', 'places', 'situations'],
    'emotions': ['feel', 'emotion', 'sad', 'angry', 'happy', 'anxious', 'depressed', 'joy', 'shame', 'guilt'],
    'recovery': ['sober', 'clean', 'recovery', 'journey', 'path', 'healing', 'sobriety', 'abstinence', 'program'],
    'relationships': ['friend', 'family', 'partner', 'spouse', 'relationship', 'people', 'support', 'social'],
    'health': ['sleep', 'eat', 'exercise', 'health', 'physical', 'doctor', 'medication', 'energy', 'fatigue'],
    'goals': ['goal', 'plan', 'future', 'aim', 'want to', 'trying to', 'hope', 'aspire', 'dream'],
    'coping': ['cope', 'strategy', 'technique', 'method', 'way to handle', 'deal with', 'manage', 'tool'],
    'celebration': ['proud', 'achievement', 'milestone', 'celebrate', 'success', 'victory', 'accomplishment'],
    'challenge': ['difficult', 'hard', 'challenge', 'struggle', 'tough', 'obstacle', 'hurdle', 'problem']
  };

  const detectedTopics: string[] = [];

  // Check each topic's keywords
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
      detectedTopics.push(topic);
    }
  }

  return detectedTopics;
};

// Detect the emotional state from a message
export const detectEmotionalState = (message: string): string => {
  const emotionKeywords = {
    'joyful': ['happy', 'joy', 'excited', 'thrilled', 'great', 'wonderful', 'fantastic', 'ecstatic', 'pleased'],
    'sad': ['sad', 'down', 'depressed', 'unhappy', 'miserable', 'blue', 'melancholy', 'heartbroken'],
    'angry': ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'rage', 'resent'],
    'anxious': ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'panic', 'stress', 'tense', 'fear'],
    'hopeful': ['hope', 'hopeful', 'optimistic', 'looking forward', 'positive', 'encouraged', 'bright'],
    'ashamed': ['shame', 'ashamed', 'embarrassed', 'guilty', 'regret', 'remorse', 'sorry'],
    'grateful': ['grateful', 'thankful', 'appreciate', 'blessed', 'fortunate', 'lucky'],
    'proud': ['proud', 'accomplished', 'satisfied', 'achievement', 'fulfilled'],
    'neutral': ['okay', 'fine', 'alright', 'neutral', 'so-so', 'meh', 'average']
  };

  let dominantEmotion = 'neutral';
  let highestCount = 0;

  // Find the emotion with the most keyword matches
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const count = keywords.filter(keyword =>
      message.toLowerCase().includes(keyword)
    ).length;

    if (count > highestCount) {
      highestCount = count;
      dominantEmotion = emotion;
    }
  }

  return dominantEmotion;
};

// Create a conversation summary from a set of messages
export const createConversationSummary = (messages: Message[]): ConversationSummary => {
  // Extract all user messages
  const userMessages = messages.filter(m => m.sender === 'user');

  // Join user messages to analyze them together
  const combinedUserContent = userMessages.map(m => m.content).join(' ');

  // Detect topics, emotional state, and extract insights
  const topics = detectMessageTopic(combinedUserContent);
  const emotionalState = detectEmotionalState(combinedUserContent);
  const insights = extractImportantInformation(combinedUserContent);

  // Create a summary
  const messageCount = userMessages.length;
  const firstTimestamp = Math.min(...messages.map(m => m.timestamp));
  const lastTimestamp = Math.max(...messages.map(m => m.timestamp));

  const summary = `Conversation with ${messageCount} user messages. 
    User emotional state: ${emotionalState}. 
    Main topics discussed: ${topics.length > 0 ? topics.join(', ') : 'general conversation'}. 
    Duration: ${Math.round((lastTimestamp - firstTimestamp) / 60000)} minutes.`;

  return {
    id: uuidv4(),
    date: new Date().toISOString(),
    summary,
    messageIds: messages.map(m => m.id),
    topics,
    emotionalState,
    keyInsights: insights
  };
};

// Determine if a summary should be created based on message patterns
export const shouldCreateSummary = (messages: Message[]): boolean => {
  // Create a summary every 10 user messages
  const userMessageCount = messages.filter(m => m.sender === 'user').length;
  if (userMessageCount > 0 && userMessageCount % 10 === 0) {
    return true;
  }

  // Create a summary if there are emotion or topic shifts
  if (userMessageCount >= 5) {
    const recentUserMessages = messages.filter(m => m.sender === 'user').slice(-5);

    // Check if there's a significant emotional shift
    const emotions = new Set(recentUserMessages.map(m => detectEmotionalState(m.content)));

    // Check if there's a topic shift
    const topics = recentUserMessages.map(m => detectMessageTopic(m.content));
    const uniqueTopics = new Set(topics.flat());

    // If there are multiple emotions or topics, it might be good to summarize
    return emotions.size > 2 || uniqueTopics.size > 3;
  }

  return false;
};

// Add a validation function for embeddings
function validateAndRepairEmbedding(embedding: number[] | undefined): number[] | undefined {
  if (!embedding || !Array.isArray(embedding)) return undefined;
  
  // Check if embedding has correct length (OpenAI ada-002 should be 1536 dimensions)
  if (embedding.length !== 1536) {
    console.warn(`Invalid embedding length: ${embedding.length}, expected 1536`);
    return undefined;
  }
  
  // Ensure all values are valid numbers
  const repaired = embedding.map(val => {
    const num = Number(val);
    if (isNaN(num) || !isFinite(num)) {
      console.warn('Invalid number in embedding, replacing with 0');
      return 0;
    }
    return num;
  });
  
  // Check if too many values were invalid
  const invalidCount = repaired.filter(val => val === 0).length;
  if (invalidCount > embedding.length * 0.1) { // More than 10% invalid
    console.warn(`Too many invalid values in embedding: ${invalidCount}/${embedding.length}`);
    return undefined;
  }
  
  return repaired;
}

// Add a simple cosine similarity function
function cosineSimilarity(a: number[], b: number[]): number {
  // Validate inputs
  if (!a || !b || a.length !== b.length) {
    console.warn('Invalid inputs for cosine similarity');
    return 0;
  }
  
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  // Prevent division by zero
  if (normA === 0 || normB === 0) return 0;
  
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Get relevant memories for the current message (vector search first, fallback to topic-based)
export const getRelevantMemories = async (
  currentMessage: string,
  count: number = MAX_MEMORIES_TO_RETRIEVE,
  userId: string
): Promise<MemoryEntry[]> => {
  const memories = getMemoryEntries(userId);
  if (memories.length === 0) return [];

  // Validate and repair embeddings for all memories
  const memoriesWithValidEmbeddings = memories.map(m => ({
    ...m,
    embedding: validateAndRepairEmbedding(m.embedding)
  }));
  
  // Check if we have enough valid embeddings for vector search
  const validEmbeddingsCount = memoriesWithValidEmbeddings.filter(m => m.embedding !== undefined).length;
  const useVectorSearch = validEmbeddingsCount >= memories.length * 0.8; // At least 80% have valid embeddings
  
  let queryEmbedding: number[] | undefined = undefined;

  if (useVectorSearch) {
    try {
      const rawEmbedding = await getOpenAIEmbedding(currentMessage);
      queryEmbedding = validateAndRepairEmbedding(rawEmbedding);
    } catch (e) {
      console.error('Failed to get query embedding:', e);
      queryEmbedding = undefined;
    }
  }

  if (useVectorSearch && queryEmbedding) {
    // Use cosine similarity for vector search
    const scored = memoriesWithValidEmbeddings
      .filter(m => m.embedding !== undefined) // Only include memories with valid embeddings
      .map(m => ({
        memory: m,
        score: cosineSimilarity(queryEmbedding!, m.embedding!)
      }))
      .filter(item => item.score > 0); // Filter out zero scores
      
    scored.sort((a, b) => b.score - a.score);
    
    // If we have enough results from vector search, return them
    if (scored.length >= count) {
      return scored.slice(0, count).map(item => {
        // Update access count and last accessed
        const memory = item.memory;
        memory.lastAccessed = Date.now();
        memory.accessCount = (memory.accessCount || 0) + 1;
        return memory;
      });
    }
  }

  // Fallback: topic/emotion/recency-based scoring
  const currentTopics = detectMessageTopic(currentMessage);
  const currentEmotionalState = detectEmotionalState(currentMessage);
  const scoredMemories = memoriesWithValidEmbeddings.map(memory => {
    let score = 0;
    const memoryTopics = detectMessageTopic(memory.content);
    const topicIntersection = memoryTopics.filter(topic => currentTopics.includes(topic));
    score += (topicIntersection.length / Math.max(memoryTopics.length, 1)) * 10;
    const memoryEmotionalState = detectEmotionalState(memory.content);
    if (memoryEmotionalState === currentEmotionalState) {
      score += 5;
    }
    score += memory.importance;
    const ageInDays = (Date.now() - new Date(memory.date).getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 10 - Math.min(ageInDays, 10));
    const finalScore =
      (score * 0.4) +
      (recencyScore * MEMORY_RECENCY_WEIGHT) +
      (memory.importance * MEMORY_IMPORTANCE_WEIGHT) +
      (memory.accessCount * MEMORY_ACCESS_WEIGHT);
    return { memory, score: finalScore };
  });
  scoredMemories.sort((a, b) => b.score - a.score);
  return scoredMemories.slice(0, count).map(item => item.memory);
};

// Generate a context prompt from relevant memories
export const generateMemoryContextPrompt = async (currentMessage: string, userId: string): Promise<string> => {
  // Get relevant memories for the current message
  const relevantMemories = await getRelevantMemories(currentMessage, undefined, userId);

  // Get the most recent AI-generated insight (from EmotionalInsight)
  const insights = getInsights(userId);
  const recentAiInsight = insights
    .filter(i => i.type === 'insight' && i.source === 'ai')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  // If the most recent AI insight is not already in the relevant memories, add it
  let contextMemories = [...relevantMemories];
  if (recentAiInsight) {
    const alreadyIncluded = relevantMemories.some(m => m.content.includes(recentAiInsight.content));
    if (!alreadyIncluded) {
      // Add as a pseudo-memory entry
      contextMemories.unshift({
        id: `ai-insight-${recentAiInsight.id}`,
        date: recentAiInsight.date,
        content: recentAiInsight.content,
        type: 'breakthrough',
        importance: 8,
        tags: ['insight', 'ai'],
        accessCount: 0
      });
    }
  }

  // If no relevant memories, return empty string
  if (contextMemories.length === 0) {
    return '';
  }

  // Format relevant memories into a clear context string for the AI
  let contextString = "--- User's Relevant Personal Memories ---\n";

  contextMemories.forEach(memory => {
    contextString += `Type: ${memory.type}\n`;
    contextString += `Date: ${new Date(memory.date).toLocaleString()}\n`;
    contextString += `Content: ${memory.content}\n`;
    if (memory.tags && memory.tags.length > 0) {
      contextString += `Tags: ${memory.tags.join(', ')}\n`;
    }
    contextString += `---\n`; // Separator between memories
  });

  contextString += "--------------------------------------";

  return contextString;
};

// Extract memories from a conversation
export const createMemoryFromMessage = (
  message: Message,
  type: MemoryType,
  importance: number,
  tags: string[] = []
): MemoryEntry => {
  return {
    id: uuidv4(),
    date: new Date(message.timestamp).toISOString(),
    content: message.content,
    type,
    importance,
    tags,
    accessCount: 0
  };
};