import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { 
  DailyCheckIn, 
  JournalEntry, 
  Message, 
  UserProgress, 
  TriggerLog, 
  Task, 
  EmotionalInsight, 
  MemoryEntry, 
  ConversationSummary 
} from '../types';
import { encryptData, decryptData } from './cryptoUtils';

// Define the database schema
interface SobriDB extends DBSchema {
  checkIns: {
    key: string;
    value: string; // Encrypted data
  };
  journal: {
    key: string;
    value: string;
  };
  messages: {
    key: string;
    value: string;
  };
  progress: {
    key: string;
    value: string;
  };
  triggers: {
    key: string;
    value: string;
  };
  tasks: {
    key: string;
    value: string;
  };
  insights: {
    key: string;
    value: string;
  };
  memory: {
    key: string;
    value: string;
  };
  summaries: {
    key: string;
    value: string;
  };
  appState: {
    key: string;
    value: string;
  };
}

const DB_NAME = 'SobriDB';
const DB_VERSION = 1;

// Storage limits and thresholds
const MAX_MESSAGES = 300; // Keep only recent messages
const MAX_INSIGHTS = 100;
const MAX_JOURNAL_ENTRIES = 200;
const STORAGE_WARNING_THRESHOLD = 0.8; // Warn at 80% usage

class IndexedDBStorage {
  private db: IDBPDatabase<SobriDB> | null = null;

  async init(): Promise<void> {
    try {
      this.db = await openDB<SobriDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create object stores
          if (!db.objectStoreNames.contains('checkIns')) {
            db.createObjectStore('checkIns');
          }
          if (!db.objectStoreNames.contains('journal')) {
            db.createObjectStore('journal');
          }
          if (!db.objectStoreNames.contains('messages')) {
            db.createObjectStore('messages');
          }
          if (!db.objectStoreNames.contains('progress')) {
            db.createObjectStore('progress');
          }
          if (!db.objectStoreNames.contains('triggers')) {
            db.createObjectStore('triggers');
          }
          if (!db.objectStoreNames.contains('tasks')) {
            db.createObjectStore('tasks');
          }
          if (!db.objectStoreNames.contains('insights')) {
            db.createObjectStore('insights');
          }
          if (!db.objectStoreNames.contains('memory')) {
            db.createObjectStore('memory');
          }
          if (!db.objectStoreNames.contains('summaries')) {
            db.createObjectStore('summaries');
          }
          if (!db.objectStoreNames.contains('appState')) {
            db.createObjectStore('appState');
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  private async ensureDB(): Promise<IDBPDatabase<SobriDB>> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // Storage usage monitoring
  async getStorageUsage(): Promise<{ usage: number; quota: number; percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;
      
      if (percentage > STORAGE_WARNING_THRESHOLD * 100) {
        console.warn(`Storage usage at ${percentage.toFixed(2)}% - consider cleaning up old data`);
      }
      
      return { usage, quota, percentage };
    }
    return { usage: 0, quota: 0, percentage: 0 };
  }

  // Generic storage operations with error handling
  private async safeStore<K extends keyof SobriDB>(
    storeName: K,
    key: string,
    value: string
  ): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.put(storeName, value, key);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded!');
        // Trigger cleanup based on store type
        await this.handleQuotaExceeded(storeName);
        // Retry once after cleanup
        try {
          const db = await this.ensureDB();
          await db.put(storeName, value, key);
        } catch (retryError) {
          throw new Error('Failed to store data even after cleanup: ' + retryError.message);
        }
      } else {
        throw error;
      }
    }
  }

  private async handleQuotaExceeded(storeName: keyof SobriDB): Promise<void> {
    console.log(`Handling quota exceeded for store: ${storeName}`);
    
    switch (storeName) {
      case 'messages':
        await this.evictOldMessages();
        break;
      case 'insights':
        await this.evictOldInsights();
        break;
      case 'journal':
        await this.evictOldJournalEntries();
        break;
      default:
        console.warn(`No eviction strategy for store: ${storeName}`);
    }
  }

  // Message eviction - keep only recent messages
  private async evictOldMessages(): Promise<void> {
    const db = await this.ensureDB();
    const tx = db.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');
    
    const allKeys = await store.getAllKeys();
    const userId = await this.getCurrentUserId();
    
    if (!userId || allKeys.length === 0) return;
    
    // Get all messages and sort by timestamp
    const messages: Message[] = [];
    for (const key of allKeys) {
      const encrypted = await store.get(key);
      if (encrypted) {
        try {
          const decrypted = decryptData(encrypted, userId) as Message[];
          messages.push(...decrypted);
        } catch (error) {
          console.error('Failed to decrypt messages for eviction');
        }
      }
    }
    
    // Sort by timestamp and keep only recent
    messages.sort((a, b) => b.timestamp - a.timestamp);
    const recentMessages = messages.slice(0, MAX_MESSAGES);
    
    // Clear and restore only recent messages
    await store.clear();
    const encrypted = encryptData(recentMessages, userId);
    await store.put(encrypted, userId);
    
    console.log(`Evicted ${messages.length - recentMessages.length} old messages`);
  }

  private async evictOldInsights(): Promise<void> {
    const db = await this.ensureDB();
    const userId = await this.getCurrentUserId();
    if (!userId) return;
    
    const encrypted = await db.get('insights', userId);
    if (!encrypted) return;
    
    try {
      const insights = decryptData(encrypted, userId) as EmotionalInsight[];
      // Keep only recent insights, prioritize unshown ones
      const sortedInsights = insights.sort((a, b) => {
        if (a.shown !== b.shown) return a.shown ? 1 : -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      const recentInsights = sortedInsights.slice(0, MAX_INSIGHTS);
      const newEncrypted = encryptData(recentInsights, userId);
      await db.put('insights', newEncrypted, userId);
      
      console.log(`Evicted ${insights.length - recentInsights.length} old insights`);
    } catch (error) {
      console.error('Failed to evict old insights:', error);
    }
  }

  private async evictOldJournalEntries(): Promise<void> {
    const db = await this.ensureDB();
    const userId = await this.getCurrentUserId();
    if (!userId) return;
    
    const encrypted = await db.get('journal', userId);
    if (!encrypted) return;
    
    try {
      const entries = decryptData(encrypted, userId) as JournalEntry[];
      // Keep only recent entries
      const sortedEntries = entries.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const recentEntries = sortedEntries.slice(0, MAX_JOURNAL_ENTRIES);
      const newEncrypted = encryptData(recentEntries, userId);
      await db.put('journal', newEncrypted, userId);
      
      console.log(`Evicted ${entries.length - recentEntries.length} old journal entries`);
    } catch (error) {
      console.error('Failed to evict old journal entries:', error);
    }
  }

  private async getCurrentUserId(): Promise<string | null> {
    // First try IndexedDB
    try {
      const db = await this.ensureDB();
      const userId = await db.get('appState', 'userId');
      if (userId) return userId;
    } catch (error) {
      console.error('Failed to get userId from IndexedDB:', error);
    }
    
    // Fallback to localStorage during migration
    return localStorage.getItem('Soberi_userId');
  }

  // Public methods matching the original storage interface
  async saveCheckIn(checkIn: DailyCheckIn, userId: string): Promise<void> {
    const checkIns = await this.getCheckIns(userId);
    const updatedCheckIns = [
      ...checkIns.filter(c => c.date !== checkIn.date),
      checkIn
    ];
    const encrypted = encryptData(updatedCheckIns, userId);
    await this.safeStore('checkIns', userId, encrypted);
  }

  async getCheckIns(userId: string): Promise<DailyCheckIn[]> {
    try {
      const db = await this.ensureDB();
      const encrypted = await db.get('checkIns', userId);
      if (!encrypted) return [];
      return decryptData(encrypted, userId);
    } catch (error) {
      console.error('Failed to get check-ins:', error);
      return [];
    }
  }

  async saveJournalEntry(entry: JournalEntry, userId: string): Promise<void> {
    const entries = await this.getJournalEntries(userId);
    const updatedEntries = [...entries.filter(e => e.id !== entry.id), entry];
    const encrypted = encryptData(updatedEntries, userId);
    await this.safeStore('journal', userId, encrypted);
  }

  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    try {
      const db = await this.ensureDB();
      const encrypted = await db.get('journal', userId);
      if (!encrypted) return [];
      return decryptData(encrypted, userId);
    } catch (error) {
      console.error('Failed to get journal entries:', error);
      return [];
    }
  }

  async deleteJournalEntry(id: string, userId: string): Promise<void> {
    const entries = await this.getJournalEntries(userId);
    const updatedEntries = entries.filter(e => e.id !== id);
    const encrypted = encryptData(updatedEntries, userId);
    await this.safeStore('journal', userId, encrypted);
  }

  async saveMessage(message: Message, userId: string): Promise<void> {
    const messages = await this.getMessages(userId);
    const updatedMessages = [...messages, message];
    const encrypted = encryptData(updatedMessages, userId);
    await this.safeStore('messages', userId, encrypted);
  }

  async getMessages(userId: string): Promise<Message[]> {
    try {
      const db = await this.ensureDB();
      const encrypted = await db.get('messages', userId);
      if (!encrypted) return [];
      return decryptData(encrypted, userId);
    } catch (error) {
      console.error('Failed to get messages:', error);
      return [];
    }
  }

  async clearMessages(userId: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete('messages', userId);
  }

  async getProgress(userId: string): Promise<UserProgress> {
    try {
      const db = await this.ensureDB();
      const encrypted = await db.get('progress', userId);
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
      return decryptData(encrypted, userId);
    } catch (error) {
      console.error('Failed to get progress:', error);
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
  }

  async updateProgress(progress: Partial<UserProgress>, userId: string): Promise<UserProgress> {
    const currentProgress = await this.getProgress(userId);
    const updatedProgress = { ...currentProgress, ...progress };
    const encrypted = encryptData(updatedProgress, userId);
    await this.safeStore('progress', userId, encrypted);
    return updatedProgress;
  }

  async saveTriggerLog(trigger: TriggerLog, userId: string): Promise<void> {
    const triggers = await this.getTriggerLogs(userId);
    const updatedTriggers = [...triggers.filter(t => t.id !== trigger.id), trigger];
    const encrypted = encryptData(updatedTriggers, userId);
    await this.safeStore('triggers', userId, encrypted);
  }

  async getTriggerLogs(userId: string): Promise<TriggerLog[]> {
    try {
      const db = await this.ensureDB();
      const encrypted = await db.get('triggers', userId);
      if (!encrypted) return [];
      return decryptData(encrypted, userId);
    } catch (error) {
      console.error('Failed to get trigger logs:', error);
      return [];
    }
  }

  async deleteTriggerLog(id: string, userId: string): Promise<void> {
    const triggers = await this.getTriggerLogs(userId);
    const updatedTriggers = triggers.filter(t => t.id !== id);
    const encrypted = encryptData(updatedTriggers, userId);
    await this.safeStore('triggers', userId, encrypted);
  }

  async saveTask(task: Task, userId: string): Promise<void> {
    const tasks = await this.getTasks(userId);
    const updatedTasks = [...tasks.filter(t => t.id !== task.id), task];
    const encrypted = encryptData(updatedTasks, userId);
    await this.safeStore('tasks', userId, encrypted);
  }

  async getTasks(userId: string): Promise<Task[]> {
    try {
      const db = await this.ensureDB();
      const encrypted = await db.get('tasks', userId);
      if (!encrypted) return [];
      return decryptData(encrypted, userId);
    } catch (error) {
      console.error('Failed to get tasks:', error);
      return [];
    }
  }

  async deleteTask(id: string, userId: string): Promise<void> {
    const tasks = await this.getTasks(userId);
    const updatedTasks = tasks.filter(t => t.id !== id);
    const encrypted = encryptData(updatedTasks, userId);
    await this.safeStore('tasks', userId, encrypted);
  }

  async completeTask(id: string, userId: string): Promise<void> {
    const tasks = await this.getTasks(userId);
    const updatedTasks = tasks.map(task =>
      task.id === id
        ? { ...task, completed: true, completedAt: new Date().toISOString() }
        : task
    );
    const encrypted = encryptData(updatedTasks, userId);
    await this.safeStore('tasks', userId, encrypted);
  }

  async saveInsight(insight: EmotionalInsight, userId: string): Promise<void> {
    const insights = await this.getInsights(userId);
    const updatedInsights = [...insights.filter(i => i.id !== insight.id), insight];
    const encrypted = encryptData(updatedInsights, userId);
    await this.safeStore('insights', userId, encrypted);
  }

  async getInsights(userId: string): Promise<EmotionalInsight[]> {
    try {
      const db = await this.ensureDB();
      const encrypted = await db.get('insights', userId);
      if (!encrypted) return [];
      return decryptData(encrypted, userId);
    } catch (error) {
      console.error('Failed to get insights:', error);
      return [];
    }
  }

  async markInsightAsShown(id: string, userId: string): Promise<void> {
    const insights = await this.getInsights(userId);
    const updatedInsights = insights.map(insight =>
      insight.id === id ? { ...insight, shown: true } : insight
    );
    const encrypted = encryptData(updatedInsights, userId);
    await this.safeStore('insights', userId, encrypted);
  }

  async saveMemoryEntry(memory: MemoryEntry, userId: string): Promise<void> {
    const memories = await this.getMemoryEntries(userId);
    const updatedMemories = [...memories.filter(m => m.id !== memory.id), memory];
    const encrypted = encryptData(updatedMemories, userId);
    await this.safeStore('memory', userId, encrypted);
  }

  async getMemoryEntries(userId: string): Promise<MemoryEntry[]> {
    try {
      const db = await this.ensureDB();
      const encrypted = await db.get('memory', userId);
      if (!encrypted) return [];
      return decryptData(encrypted, userId);
    } catch (error) {
      console.error('Failed to get memory entries:', error);
      return [];
    }
  }

  async deleteMemoryEntry(id: string, userId: string): Promise<void> {
    const memories = await this.getMemoryEntries(userId);
    const updatedMemories = memories.filter(m => m.id !== id);
    const encrypted = encryptData(updatedMemories, userId);
    await this.safeStore('memory', userId, encrypted);
  }

  async saveConversationSummary(summary: ConversationSummary, userId: string): Promise<void> {
    const summaries = await this.getConversationSummaries(userId);
    const updatedSummaries = [...summaries.filter(s => s.id !== summary.id), summary];
    const encrypted = encryptData(updatedSummaries, userId);
    await this.safeStore('summaries', userId, encrypted);
  }

  async getConversationSummaries(userId: string): Promise<ConversationSummary[]> {
    try {
      const db = await this.ensureDB();
      const encrypted = await db.get('summaries', userId);
      if (!encrypted) return [];
      return decryptData(encrypted, userId);
    } catch (error) {
      console.error('Failed to get conversation summaries:', error);
      return [];
    }
  }

  async deleteConversationSummary(id: string, userId: string): Promise<void> {
    const summaries = await this.getConversationSummaries(userId);
    const updatedSummaries = summaries.filter(s => s.id !== id);
    const encrypted = encryptData(updatedSummaries, userId);
    await this.safeStore('summaries', userId, encrypted);
  }

  // App state methods for Zustand
  async saveAppState(state: any, userId: string): Promise<void> {
    const encrypted = encryptData(state, userId);
    await this.safeStore('appState', userId, encrypted);
    // Also store userId for future reference
    await this.safeStore('appState', 'userId', userId);
  }

  async getAppState(userId: string): Promise<any> {
    try {
      const db = await this.ensureDB();
      const encrypted = await db.get('appState', userId);
      if (!encrypted) return null;
      return decryptData(encrypted, userId);
    } catch (error) {
      console.error('Failed to get app state:', error);
      return null;
    }
  }

  // Migration helper
  async migrateFromLocalStorage(userId: string): Promise<void> {
    console.log('Starting migration from localStorage to IndexedDB...');
    
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
      APP_STATE: 'Soberiai-storage'
    };

    try {
      // Migrate each data type
      for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
        const data = localStorage.getItem(storageKey);
        if (data) {
          const storeName = key.toLowerCase() as keyof SobriDB;
          await this.safeStore(storeName === 'app_state' ? 'appState' : storeName, userId, data);
          console.log(`Migrated ${key} to IndexedDB`);
        }
      }
      
      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  // Clean up method
  async cleanup(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Export singleton instance
export const indexedDBStorage = new IndexedDBStorage();

// Export individual functions matching the original interface
export const saveCheckIn = (checkIn: DailyCheckIn, userId: string) => 
  indexedDBStorage.saveCheckIn(checkIn, userId);

export const getCheckIns = (userId: string) => 
  indexedDBStorage.getCheckIns(userId);

export const saveJournalEntry = (entry: JournalEntry, userId: string) => 
  indexedDBStorage.saveJournalEntry(entry, userId);

export const getJournalEntries = (userId: string) => 
  indexedDBStorage.getJournalEntries(userId);

export const deleteJournalEntry = (id: string, userId: string) => 
  indexedDBStorage.deleteJournalEntry(id, userId);

export const saveMessage = (message: Message, userId: string) => 
  indexedDBStorage.saveMessage(message, userId);

export const getMessages = (userId: string) => 
  indexedDBStorage.getMessages(userId);

export const clearMessages = (userId: string) => 
  indexedDBStorage.clearMessages(userId);

export const getProgress = (userId: string) => 
  indexedDBStorage.getProgress(userId);

export const updateProgress = (progress: Partial<UserProgress>, userId: string) => 
  indexedDBStorage.updateProgress(progress, userId);

export const saveTriggerLog = (trigger: TriggerLog, userId: string) => 
  indexedDBStorage.saveTriggerLog(trigger, userId);

export const getTriggerLogs = (userId: string) => 
  indexedDBStorage.getTriggerLogs(userId);

export const deleteTriggerLog = (id: string, userId: string) => 
  indexedDBStorage.deleteTriggerLog(id, userId);

export const saveTask = (task: Task, userId: string) => 
  indexedDBStorage.saveTask(task, userId);

export const getTasks = (userId: string) => 
  indexedDBStorage.getTasks(userId);

export const deleteTask = (id: string, userId: string) => 
  indexedDBStorage.deleteTask(id, userId);

export const completeTask = (id: string, userId: string) => 
  indexedDBStorage.completeTask(id, userId);

export const saveInsight = (insight: EmotionalInsight, userId: string) => 
  indexedDBStorage.saveInsight(insight, userId);

export const getInsights = (userId: string) => 
  indexedDBStorage.getInsights(userId);

export const markInsightAsShown = (id: string, userId: string) => 
  indexedDBStorage.markInsightAsShown(id, userId);

export const saveMemoryEntry = (memory: MemoryEntry, userId: string) => 
  indexedDBStorage.saveMemoryEntry(memory, userId);

export const getMemoryEntries = (userId: string) => 
  indexedDBStorage.getMemoryEntries(userId);

export const deleteMemoryEntry = (id: string, userId: string) => 
  indexedDBStorage.deleteMemoryEntry(id, userId);

export const saveConversationSummary = (summary: ConversationSummary, userId: string) => 
  indexedDBStorage.saveConversationSummary(summary, userId);

export const getConversationSummaries = (userId: string) => 
  indexedDBStorage.getConversationSummaries(userId);

export const deleteConversationSummary = (id: string, userId: string) => 
  indexedDBStorage.deleteConversationSummary(id, userId);

export const saveAppState = (state: any, userId: string) => 
  indexedDBStorage.saveAppState(state, userId);

export const getAppState = (userId: string) => 
  indexedDBStorage.getAppState(userId);

export const migrateFromLocalStorage = (userId: string) => 
  indexedDBStorage.migrateFromLocalStorage(userId);

export const getStorageUsage = () => 
  indexedDBStorage.getStorageUsage();

export const resetStreak = async (userId: string): Promise<UserProgress> => {
  const progress = await indexedDBStorage.getProgress(userId);
  const updatedProgress = {
    ...progress,
    currentStreak: 0,
    relapseCount: progress.relapseCount + 1,
  };
  return await indexedDBStorage.updateProgress(updatedProgress, userId);
};

export const incrementStreak = async (userId: string): Promise<UserProgress> => {
  const progress = await indexedDBStorage.getProgress(userId);
  const newStreak = progress.currentStreak + 1;
  const updatedProgress = {
    ...progress,
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, progress.longestStreak),
    totalDaysClean: progress.totalDaysClean + 1,
  };
  return await indexedDBStorage.updateProgress(updatedProgress, userId);
};

export const updateInsightUserNote = async (id: string, userNote: string, userId: string): Promise<void> => {
  const insights = await indexedDBStorage.getInsights(userId);
  const updatedInsights = insights.map(insight =>
    insight.id === id ? { ...insight, userNote } : insight
  );
  // Save all insights back (the saveInsight method handles updates)
  for (const insight of updatedInsights) {
    if (insight.id === id) {
      await indexedDBStorage.saveInsight(insight, userId);
      break;
    }
  }
}; 