import { DailyCheckIn, JournalEntry, Message, UserProgress, TriggerLog, Task, EmotionalInsight, MemoryEntry, ConversationSummary } from '../types';
import { encryptData, decryptData } from './cryptoUtils';

const STORAGE_KEYS = {
  CHECKINS: 'Soberi_checkins',
  JOURNAL: 'Soberi_journal',
  MESSAGES: 'Soberi_messages',
  PROGRESS: 'Soberi_progress',
  TRIGGERS: 'Soberi_triggers',
  TASKS: 'Soberi_tasks',
  INSIGHTS: 'Soberi_insights',
  MEMORY: 'Soberi_memory',
  SUMMARIES: 'Soberi_conversation_summaries',
};

// Daily Check-ins
export const saveCheckIn = (checkIn: DailyCheckIn, userId: string): void => {
  const checkIns = getCheckIns(userId);
  const updatedCheckIns = [
    ...checkIns.filter(c => c.date !== checkIn.date),
    checkIn
  ];
  const encrypted = encryptData(updatedCheckIns, userId);
  localStorage.setItem(STORAGE_KEYS.CHECKINS, encrypted);
};

export const getCheckIns = (userId: string): DailyCheckIn[] => {
  const encrypted = localStorage.getItem(STORAGE_KEYS.CHECKINS);
  if (!encrypted) return [];
  try {
    return decryptData(encrypted, userId);
  } catch (error) {
    console.error('Failed to decrypt check-ins for user:', userId, error.message);
    return [];
  }
};

export const getCheckInByDate = (date: string): DailyCheckIn | undefined => {
  const checkIns = getCheckIns();
  return checkIns.find(c => c.date === date);
};

// Journal Entries
export const saveJournalEntry = (entry: JournalEntry, userId: string): void => {
  const entries = getJournalEntries(userId);
  const updatedEntries = [...entries.filter(e => e.id !== entry.id), entry];
  const encrypted = encryptData(updatedEntries, userId);
  localStorage.setItem(STORAGE_KEYS.JOURNAL, encrypted);
};

export const getJournalEntries = (userId: string): JournalEntry[] => {
  const encrypted = localStorage.getItem(STORAGE_KEYS.JOURNAL);
  if (!encrypted) return [];
  try {
    return decryptData(encrypted, userId);
  } catch (error) {
    console.error('Failed to decrypt journal entries for user:', userId, error.message);
    return [];
  }
};

export const deleteJournalEntry = (id: string, userId: string): void => {
  const entries = getJournalEntries(userId);
  const updatedEntries = entries.filter(e => e.id !== id);
  const encrypted = encryptData(updatedEntries, userId);
  localStorage.setItem(STORAGE_KEYS.JOURNAL, encrypted);
};

// Trigger Logs
export const saveTriggerLog = (trigger: TriggerLog, userId: string): void => {
  const triggers = getTriggerLogs(userId);
  const updatedTriggers = [...triggers.filter(t => t.id !== trigger.id), trigger];
  const encrypted = encryptData(updatedTriggers, userId);
  localStorage.setItem(STORAGE_KEYS.TRIGGERS, encrypted);
};

export const getTriggerLogs = (userId: string): TriggerLog[] => {
  const encrypted = localStorage.getItem(STORAGE_KEYS.TRIGGERS);
  if (!encrypted) return [];
  try {
    return decryptData(encrypted, userId);
  } catch (error) {
    console.error('Failed to decrypt trigger logs for user:', userId, error.message);
    return [];
  }
};

export const deleteTriggerLog = (id: string, userId: string): void => {
  const triggers = getTriggerLogs(userId);
  const updatedTriggers = triggers.filter(t => t.id !== id);
  const encrypted = encryptData(updatedTriggers, userId);
  localStorage.setItem(STORAGE_KEYS.TRIGGERS, encrypted);
};

// Tasks
export const saveTask = (task: Task, userId: string): void => {
  const tasks = getTasks(userId);
  const updatedTasks = [...tasks.filter(t => t.id !== task.id), task];
  const encrypted = encryptData(updatedTasks, userId);
  localStorage.setItem(STORAGE_KEYS.TASKS, encrypted);
};

export const getTasks = (userId: string): Task[] => {
  const encrypted = localStorage.getItem(STORAGE_KEYS.TASKS);
  if (!encrypted) return [];
  try {
    return decryptData(encrypted, userId);
  } catch (error) {
    console.error('Failed to decrypt tasks for user:', userId, error.message);
    return [];
  }
};

export const getTasksByDate = (date: string): Task[] => {
  const tasks = getTasks();
  return tasks.filter(t => t.date === date);
};

export const deleteTask = (id: string, userId: string): void => {
  const tasks = getTasks(userId);
  const updatedTasks = tasks.filter(t => t.id !== id);
  const encrypted = encryptData(updatedTasks, userId);
  localStorage.setItem(STORAGE_KEYS.TASKS, encrypted);
};

export const completeTask = (id: string, userId: string): void => {
  const tasks = getTasks(userId);
  const updatedTasks = tasks.map(task =>
    task.id === id
      ? { ...task, completed: true, completedAt: new Date().toISOString() }
      : task
  );
  const encrypted = encryptData(updatedTasks, userId);
  localStorage.setItem(STORAGE_KEYS.TASKS, encrypted);
};

// Emotional Insights
export const saveInsight = (insight: EmotionalInsight, userId: string): void => {
  const insights = getInsights(userId);
  const updatedInsights = [...insights.filter(i => i.id !== insight.id), insight];
  const encrypted = encryptData(updatedInsights, userId);
  localStorage.setItem(STORAGE_KEYS.INSIGHTS, encrypted);
};

export const getInsights = (userId: string): EmotionalInsight[] => {
  const encrypted = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
  if (!encrypted) return [];
  try {
    return decryptData(encrypted, userId);
  } catch (error) {
    console.error('Failed to decrypt insights for user:', userId, error.message);
    return [];
  }
};

export const markInsightAsShown = (id: string, userId: string): void => {
  const insights = getInsights(userId);
  const updatedInsights = insights.map(insight =>
    insight.id === id ? { ...insight, shown: true } : insight
  );
  const encrypted = encryptData(updatedInsights, userId);
  localStorage.setItem(STORAGE_KEYS.INSIGHTS, encrypted);
};

export const updateInsightUserNote = (id: string, userNote: string, userId: string): void => {
  const insights = getInsights(userId);
  const updatedInsights = insights.map(insight =>
    insight.id === id ? { ...insight, userNote } : insight
  );
  const encrypted = encryptData(updatedInsights, userId);
  localStorage.setItem(STORAGE_KEYS.INSIGHTS, encrypted);
};

// Chat Messages
export const saveMessage = (message: Message, userId: string): void => {
  const messages = getMessages(userId);
  const updatedMessages = [...messages, message];
  const encrypted = encryptData(updatedMessages, userId);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, encrypted);
};

export const getMessages = (userId: string): Message[] => {
  const encrypted = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  if (!encrypted) return [];
  try {
    return decryptData(encrypted, userId);
  } catch (error) {
    console.error('Failed to decrypt messages for user:', userId, error.message);
    return [];
  }
};

export const clearMessages = (): void => {
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
};

// Memory entries
export const saveMemoryEntry = (memory: MemoryEntry, userId: string): void => {
  const memories = getMemoryEntries(userId);
  const updatedMemories = [...memories.filter(m => m.id !== memory.id), memory];
  const encrypted = encryptData(updatedMemories, userId);
  localStorage.setItem(STORAGE_KEYS.MEMORY, encrypted);
};

export const getMemoryEntries = (userId: string): MemoryEntry[] => {
  const encrypted = localStorage.getItem(STORAGE_KEYS.MEMORY);
  if (!encrypted) return [];
  try {
    return decryptData(encrypted, userId);
  } catch (error) {
    console.error('Failed to decrypt memory entries for user:', userId, error.message);
    return [];
  }
};

export const deleteMemoryEntry = (id: string, userId: string): void => {
  const memories = getMemoryEntries(userId);
  const updatedMemories = memories.filter(m => m.id !== id);
  const encrypted = encryptData(updatedMemories, userId);
  localStorage.setItem(STORAGE_KEYS.MEMORY, encrypted);
};

// Conversation summaries
export const saveConversationSummary = (summary: ConversationSummary, userId: string): void => {
  const summaries = getConversationSummaries(userId);
  const updatedSummaries = [...summaries.filter(s => s.id !== summary.id), summary];
  const encrypted = encryptData(updatedSummaries, userId);
  localStorage.setItem(STORAGE_KEYS.SUMMARIES, encrypted);
};

export const getConversationSummaries = (userId: string): ConversationSummary[] => {
  const encrypted = localStorage.getItem(STORAGE_KEYS.SUMMARIES);
  if (!encrypted) return [];
  try {
    return decryptData(encrypted, userId);
  } catch (error) {
    console.error('Failed to decrypt conversation summaries for user:', userId, error.message);
    return [];
  }
};

export const deleteConversationSummary = (id: string): void => {
  const summaries = getConversationSummaries();
  const updatedSummaries = summaries.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(updatedSummaries));
};

// User Progress
export const getProgress = (userId: string): UserProgress => {
  const encrypted = localStorage.getItem(STORAGE_KEYS.PROGRESS);
  if (!encrypted) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      startDate: null,
      lastCheckInDate: null,
      totalDaysClean: 0,
      relapseCount: 0,
      milestones: []
    };
  }
  try {
    return decryptData(encrypted, userId);
  } catch (error) {
    console.error('Failed to decrypt progress for user:', userId, error.message);
  return {
    currentStreak: 0,
    longestStreak: 0,
    startDate: null,
    lastCheckInDate: null,
    totalDaysClean: 0,
    relapseCount: 0,
    milestones: []
  };
  }
};

export const updateProgress = (progress: Partial<UserProgress>, userId: string): UserProgress => {
  const currentProgress = getProgress(userId);
  const updatedProgress = { ...currentProgress, ...progress };
  const encrypted = encryptData(updatedProgress, userId);
  localStorage.setItem(STORAGE_KEYS.PROGRESS, encrypted);
  return updatedProgress;
};

export const resetStreak = (): UserProgress => {
  const progress = getProgress();
  const updatedProgress = {
    ...progress,
    currentStreak: 0,
    relapseCount: progress.relapseCount + 1,
  };
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(updatedProgress));
  return updatedProgress;
};

export const incrementStreak = (): UserProgress => {
  const progress = getProgress();
  const newStreak = progress.currentStreak + 1;
  const updatedProgress = {
    ...progress,
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, progress.longestStreak),
    totalDaysClean: progress.totalDaysClean + 1,
  };
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(updatedProgress));
  return updatedProgress;
};

// Utility for encrypting/decrypting the entire app state for Soberiai-storage
export const saveAppState = (state: any, userId: string): void => {
  const encrypted = encryptData(state, userId);
  localStorage.setItem('Soberiai-storage', encrypted);
};

export const getAppState = (userId: string): any => {
  const encrypted = localStorage.getItem('Soberiai-storage');
  if (!encrypted) return null;
  try {
    return decryptData(encrypted, userId);
  } catch (error) {
    console.error('Failed to decrypt app state for user:', userId, error.message);
    return null;
  }
};