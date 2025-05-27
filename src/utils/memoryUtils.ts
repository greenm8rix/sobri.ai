import { v4 as uuidv4 } from './mockUtils';
import { MemoryEntry, MemoryType, Message, ConversationSummary } from '../types';
import { getMemoryEntries, deleteMemoryEntry } from './storageUtils';

// Constants
const MAX_MEMORIES_TO_RETRIEVE = 5; // Maximum number of memories to retrieve for context
const MEMORY_RECENCY_WEIGHT = 0.4; // Weight for recency in memory scoring
const MEMORY_IMPORTANCE_WEIGHT = 0.4; // Weight for importance in memory scoring
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

// Get relevant memories for the current message
export const getRelevantMemories = (
  currentMessage: string, 
  count: number = MAX_MEMORIES_TO_RETRIEVE
): MemoryEntry[] => {
  const memories = getMemoryEntries();
  
  // If no memories exist, return an empty array
  if (memories.length === 0) {
    return [];
  }
  
  // Detect topics in the current message
  const currentTopics = detectMessageTopic(currentMessage);
  const currentEmotionalState = detectEmotionalState(currentMessage);
  
  // Score each memory based on relevance to current message
  const scoredMemories = memories.map(memory => {
    let score = 0;
    
    // Topic relevance score (0-10)
    const memoryTopics = detectMessageTopic(memory.content);
    const topicIntersection = memoryTopics.filter(topic => currentTopics.includes(topic));
    score += (topicIntersection.length / Math.max(memoryTopics.length, 1)) * 10;
    
    // Emotional state match (0-5)
    const memoryEmotionalState = detectEmotionalState(memory.content);
    if (memoryEmotionalState === currentEmotionalState) {
      score += 5;
    }
    
    // Importance score (0-10)
    score += memory.importance;
    
    // Recency score (0-10)
    const ageInDays = (Date.now() - new Date(memory.date).getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 10 - Math.min(ageInDays, 10));
    
    // Calculate final weighted score
    const finalScore = 
      (score * 0.4) +  // Base relevance score (40%)
      (recencyScore * MEMORY_RECENCY_WEIGHT) +  // Recency (weighted)
      (memory.importance * MEMORY_IMPORTANCE_WEIGHT) +  // Importance (weighted)
      (memory.accessCount * MEMORY_ACCESS_WEIGHT);  // Access frequency (weighted)
    
    return { memory, score: finalScore };
  });
  
  // Sort by score (highest first) and return the top memories
  scoredMemories.sort((a, b) => b.score - a.score);
  return scoredMemories.slice(0, count).map(item => item.memory);
};

// Generate a context prompt from relevant memories
export const generateMemoryContextPrompt = (currentMessage: string): string => {
  // Get relevant memories for the current message
  const relevantMemories = getRelevantMemories(currentMessage);
  
  // If no relevant memories, return empty string
  if (relevantMemories.length === 0) {
    return '';
  }
  
  // Format memories into a context prompt
  let contextPrompt = '--- User Context Information ---\n';
  
  // Group memories by type
  const memoryGroups: Record<MemoryType, MemoryEntry[]> = {} as Record<MemoryType, MemoryEntry[]>;
  
  relevantMemories.forEach(memory => {
    if (!memoryGroups[memory.type]) {
      memoryGroups[memory.type] = [];
    }
    memoryGroups[memory.type].push(memory);
    
    // Mark this memory as accessed
    memory.accessCount = (memory.accessCount || 0) + 1;
    memory.lastAccessed = Date.now();
  });
  
  // Add personal details first
  if (memoryGroups.personal_detail) {
    contextPrompt += '\nPersonal Details:\n';
    memoryGroups.personal_detail.forEach(memory => {
      contextPrompt += `- ${memory.content}\n`;
    });
  }
  
  // Add preferences
  if (memoryGroups.preference) {
    contextPrompt += '\nPreferences:\n';
    memoryGroups.preference.forEach(memory => {
      contextPrompt += `- ${memory.content}\n`;
    });
  }
  
  // Add triggers
  if (memoryGroups.trigger) {
    contextPrompt += '\nTriggers:\n';
    memoryGroups.trigger.forEach(memory => {
      contextPrompt += `- ${memory.content}\n`;
    });
  }
  
  // Add coping strategies
  if (memoryGroups.coping_strategy) {
    contextPrompt += '\nEffective Coping Strategies:\n';
    memoryGroups.coping_strategy.forEach(memory => {
      contextPrompt += `- ${memory.content}\n`;
    });
  }
  
  // Add goals
  if (memoryGroups.goal) {
    contextPrompt += '\nGoals:\n';
    memoryGroups.goal.forEach(memory => {
      contextPrompt += `- ${memory.content}\n`;
    });
  }
  
  // Add breakthroughs
  if (memoryGroups.breakthrough) {
    contextPrompt += '\nBreakthroughs:\n';
    memoryGroups.breakthrough.forEach(memory => {
      contextPrompt += `- ${memory.content}\n`;
    });
  }
  
  // Add relapses
  if (memoryGroups.relapse) {
    contextPrompt += '\nRelapse Information:\n';
    memoryGroups.relapse.forEach(memory => {
      contextPrompt += `- ${memory.content}\n`;
    });
  }
  
  // Add conversation summaries
  if (memoryGroups.conversation_summary) {
    contextPrompt += '\nPrevious Conversations:\n';
    memoryGroups.conversation_summary.forEach(memory => {
      contextPrompt += `- ${memory.content}\n`;
    });
  }
  
  return contextPrompt;
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