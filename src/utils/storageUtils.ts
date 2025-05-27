import { DailyCheckIn, JournalEntry, Message, UserProgress, TriggerLog, Task, EmotionalInsight, MemoryEntry, ConversationSummary } from '../types';

const STORAGE_KEYS = {
  CHECKINS: 'myboo_checkins',
  JOURNAL: 'myboo_journal',
  MESSAGES: 'myboo_messages',
  PROGRESS: 'myboo_progress',
  TRIGGERS: 'myboo_triggers',
  TASKS: 'myboo_tasks',
  INSIGHTS: 'myboo_insights',
  MEMORY: 'myboo_memory',
  SUMMARIES: 'myboo_conversation_summaries',
};

// Daily Check-ins
export const saveCheckIn = (checkIn: DailyCheckIn): void => {
  const existingCheckIns = getCheckIns();
  const updatedCheckIns = [
    ...existingCheckIns.filter(c => c.date !== checkIn.date),
    checkIn
  ];
  localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(updatedCheckIns));
};

export const getCheckIns = (): DailyCheckIn[] => {
  const checkInsJson = localStorage.getItem(STORAGE_KEYS.CHECKINS);
  return checkInsJson ? JSON.parse(checkInsJson) : [];
};

export const getCheckInByDate = (date: string): DailyCheckIn | undefined => {
  const checkIns = getCheckIns();
  return checkIns.find(c => c.date === date);
};

// Journal Entries
export const saveJournalEntry = (entry: JournalEntry): void => {
  const existingEntries = getJournalEntries();
  const updatedEntries = [...existingEntries.filter(e => e.id !== entry.id), entry];
  localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(updatedEntries));
};

export const getJournalEntries = (): JournalEntry[] => {
  const entriesJson = localStorage.getItem(STORAGE_KEYS.JOURNAL);
  return entriesJson ? JSON.parse(entriesJson) : [];
};

export const deleteJournalEntry = (id: string): void => {
  const entries = getJournalEntries();
  const updatedEntries = entries.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(updatedEntries));
};

// Trigger Logs
export const saveTriggerLog = (trigger: TriggerLog): void => {
  const existingTriggers = getTriggerLogs();
  const updatedTriggers = [...existingTriggers.filter(t => t.id !== trigger.id), trigger];
  localStorage.setItem(STORAGE_KEYS.TRIGGERS, JSON.stringify(updatedTriggers));
};

export const getTriggerLogs = (): TriggerLog[] => {
  const triggersJson = localStorage.getItem(STORAGE_KEYS.TRIGGERS);
  return triggersJson ? JSON.parse(triggersJson) : [];
};

export const deleteTriggerLog = (id: string): void => {
  const triggers = getTriggerLogs();
  const updatedTriggers = triggers.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TRIGGERS, JSON.stringify(updatedTriggers));
};

// Tasks
export const saveTask = (task: Task): void => {
  const existingTasks = getTasks();
  const updatedTasks = [...existingTasks.filter(t => t.id !== task.id), task];
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
};

export const getTasks = (): Task[] => {
  const tasksJson = localStorage.getItem(STORAGE_KEYS.TASKS);
  return tasksJson ? JSON.parse(tasksJson) : [];
};

export const getTasksByDate = (date: string): Task[] => {
  const tasks = getTasks();
  return tasks.filter(t => t.date === date);
};

export const deleteTask = (id: string): void => {
  const tasks = getTasks();
  const updatedTasks = tasks.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
};

export const completeTask = (id: string): void => {
  const tasks = getTasks();
  const updatedTasks = tasks.map(task => 
    task.id === id 
      ? { ...task, completed: true, completedAt: new Date().toISOString() } 
      : task
  );
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
};

// Emotional Insights
export const saveInsight = (insight: EmotionalInsight): void => {
  const existingInsights = getInsights();
  const updatedInsights = [...existingInsights.filter(i => i.id !== insight.id), insight];
  localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(updatedInsights));
};

export const getInsights = (): EmotionalInsight[] => {
  const insightsJson = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
  return insightsJson ? JSON.parse(insightsJson) : [];
};

export const markInsightAsShown = (id: string): void => {
  const insights = getInsights();
  const updatedInsights = insights.map(insight => 
    insight.id === id ? { ...insight, shown: true } : insight
  );
  localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(updatedInsights));
};

// Chat Messages
export const saveMessage = (message: Message): void => {
  const messages = getMessages();
  const updatedMessages = [...messages, message];
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));
};

export const getMessages = (): Message[] => {
  const messagesJson = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  return messagesJson ? JSON.parse(messagesJson) : [];
};

export const clearMessages = (): void => {
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
};

// Memory entries
export const saveMemoryEntry = (memory: MemoryEntry): void => {
  const existingMemories = getMemoryEntries();
  const updatedMemories = [...existingMemories.filter(m => m.id !== memory.id), memory];
  localStorage.setItem(STORAGE_KEYS.MEMORY, JSON.stringify(updatedMemories));
};

export const getMemoryEntries = (): MemoryEntry[] => {
  const memoriesJson = localStorage.getItem(STORAGE_KEYS.MEMORY);
  return memoriesJson ? JSON.parse(memoriesJson) : [];
};

export const deleteMemoryEntry = (id: string): void => {
  const memories = getMemoryEntries();
  const updatedMemories = memories.filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEYS.MEMORY, JSON.stringify(updatedMemories));
};

// Conversation summaries
export const saveConversationSummary = (summary: ConversationSummary): void => {
  const existingSummaries = getConversationSummaries();
  const updatedSummaries = [...existingSummaries.filter(s => s.id !== summary.id), summary];
  localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(updatedSummaries));
};

export const getConversationSummaries = (): ConversationSummary[] => {
  const summariesJson = localStorage.getItem(STORAGE_KEYS.SUMMARIES);
  return summariesJson ? JSON.parse(summariesJson) : [];
};

export const deleteConversationSummary = (id: string): void => {
  const summaries = getConversationSummaries();
  const updatedSummaries = summaries.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(updatedSummaries));
};

// User Progress
export const getProgress = (): UserProgress => {
  const progressJson = localStorage.getItem(STORAGE_KEYS.PROGRESS);
  if (progressJson) {
    return JSON.parse(progressJson);
  }
  return {
    currentStreak: 0,
    longestStreak: 0,
    startDate: null,
    lastCheckInDate: null,
    totalDaysClean: 0,
    relapseCount: 0,
    milestones: []
  };
};

export const updateProgress = (progress: Partial<UserProgress>): UserProgress => {
  const currentProgress = getProgress();
  const updatedProgress = { ...currentProgress, ...progress };
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(updatedProgress));
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