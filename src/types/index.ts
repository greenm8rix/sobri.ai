export type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
export type UrgeLevel = 'none' | 'mild' | 'moderate' | 'severe' | 'extreme'; // Renamed CravingLevel
export type TaskPriority = 'high' | 'medium' | 'low';
// Removed 'recovery' from TaskCategory
export type TaskCategory = 'self-care' | 'physical' | 'social' | 'productive';

export interface DailyCheckIn {
  id: string;
  date: string;
  mood: MoodType;
  urgeLevel: UrgeLevel; // Renamed cravingLevel
  notes: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  tags: string[];
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export interface Milestone {
  id: string;
  date: string;
  type: 'streak' | 'setback' | 'achievement'; // Changed 'relapse' to 'setback'
  value: number;
  description: string;
}

export interface TriggerLog {
  id: string;
  date: string;
  trigger: string;
  intensity: number; // 1-10 scale
  strategy: string;
  successful: boolean;
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  date: string;
  priority: TaskPriority;
  category: TaskCategory;
  timeEstimate?: number; // in minutes
  completedAt?: string;
}

export interface UserProgress {
  currentStreak: number;
  longestStreak: number;
  startDate: string | null;
  lastCheckInDate: string | null;
  totalDaysClean: number; // Represents general progress days
  setbackCount: number;
  milestones?: Milestone[];
}

export interface EmotionalInsight {
  id: string;
  date: string;
  content: string;
  type: 'insight' | 'encouragement' | 'reminder';
  source: 'system' | 'ai' | 'user';
  shown: boolean;
  userNote?: string; // Optional user note/reflection
}

// Memory system types
export interface MemoryEntry {
  id: string;
  date: string;
  content: string;
  type: MemoryType;
  importance: number; // 1-10 scale
  tags: string[];
  lastAccessed?: number;
  accessCount: number;
  embedding?: number[]; // Optional: vector embedding for semantic search
}

export type MemoryType =
  | 'personal_detail' // Personal information shared by the user
  | 'preference' // User preferences and likes/dislikes
  | 'breakthrough' // Important realizations or progress
  | 'trigger' // Identified triggers
  | 'coping_strategy' // Strategies that work for the user
  | 'goal' // User goals
  | 'setback' // Information about setbacks (renamed from 'relapse')
  | 'conversation_summary'; // Summaries of important conversations

export interface ConversationSummary {
  id: string;
  date: string;
  summary: string;
  messageIds: string[]; // References to the original messages
  topics: string[];
  emotionalState: string;
  keyInsights: string[];
  summaryType?: 'client_generated' | 'ai_generated'; // To distinguish summary origins
}
