import { create } from 'zustand';
import { v4 as uuidv4_global } from 'uuid'; // Renaming to avoid conflict if uuidv4 is destructured later
import { DailyCheckIn, JournalEntry, Message, UserProgress, MoodType, UrgeLevel, TriggerLog, Task, TaskCategory, TaskPriority, EmotionalInsight, MemoryEntry, ConversationSummary, Milestone } from '../types'; // CravingLevel to UrgeLevel
import {
  saveCheckIn,
  getCheckIns,
  saveJournalEntry,
  getJournalEntries,
  deleteJournalEntry,
  getMessages,
  saveMessage,
  // clearMessages, // Unused import
  getProgress,
  updateProgress,
  resetStreak,
  incrementStreak,
  saveTriggerLog,
  getTriggerLogs,
  deleteTriggerLog,
  saveTask,
  getTasks,
  deleteTask,
  completeTask,
  saveInsight,
  getInsights,
  markInsightAsShown,
  saveMemoryEntry,
  getMemoryEntries,
  deleteMemoryEntry,
  saveConversationSummary,
  getConversationSummaries,
  updateInsightUserNote,
  saveAppState,
  getAppState
} from '../utils/indexedDBUtils';
import { getCurrentDateString, calculateCurrentStreakFromCheckIns } from '../utils/dateUtils';
import { v4 as uuidv4 } from 'uuid'; // Ensure uuidv4 is imported if still needed elsewhere, or manage uuidv4_global
import analytics from '../utils/analytics';
import { devtools, persist } from 'zustand/middleware';
import {
  // createMemoryFromMessage, // Unused import
  extractImportantInformation,
  detectMessageTopic,
  detectEmotionalState,
  // createConversationSummary, // Replaced by AI summarization logic
  // shouldCreateSummary, // Replaced by AI summarization logic
  getRelevantMemories,
  generateMemoryContextPrompt
} from '../utils/memoryUtils';
import { getOpenAIEmbedding, generateFallbackEmbedding, validateEmbedding } from '../utils/embeddingUtils'; // Added generateFallbackEmbedding and validateEmbedding
import { encryptData } from '../utils/cryptoUtils';
import { useAuth } from '../auth/AuthContext'; // Ensure useAuth is imported if not already

// Helper function to get or create a unique user ID
const getOrCreateUserId = (): string => {
  let userId: string | null = localStorage.getItem('Soberi_userId');
  if (userId === null) { // Explicitly check for null
    userId = uuidv4_global();
    localStorage.setItem('Soberi_userId', userId);
  }
  return userId; // userId is guaranteed to be a string here
};

interface AppState {
  // UI State
  activeTab: 'chat' | 'checkin' | 'journal' | 'progress' | 'resources' | 'tasks' | 'insights';
  isLoading: boolean;

  // Data
  checkIns: DailyCheckIn[];
  journalEntries: JournalEntry[];
  messages: Message[];
  userProgress: UserProgress;
  triggerLogs: TriggerLog[];
  tasks: Task[];
  insights: EmotionalInsight[];
  memories: MemoryEntry[];
  conversationSummaries: ConversationSummary[];

  // Actions
  setActiveTab: (tab: 'chat' | 'checkin' | 'journal' | 'progress' | 'resources' | 'tasks' | 'insights') => void;
  setIsLoading: (loading: boolean) => void;

  // Check-in Actions
  submitCheckIn: (mood: MoodType, urgeLevel: UrgeLevel, notes: string) => Promise<void>; // cravingLevel to urgeLevel

  // Journal Actions
  addJournalEntry: (content: string, tags: string[]) => Promise<void>;
  removeJournalEntry: (id: string) => Promise<void>;

  // Chat Actions
  sendMessage: (content: string, supabaseUserId: string) => Promise<void>;

  // Progress Actions
  resetProgress: () => Promise<void>;
  markSetback: () => Promise<void>;

  // Trigger Logs Actions
  addTriggerLog: (trigger: string, intensity: number, strategy: string, successful: boolean, notes: string) => Promise<void>;
  removeTriggerLog: (id: string) => Promise<void>;

  // Task Actions
  addTask: (title: string, description: string, date: string, priority: TaskPriority, category: TaskCategory, timeEstimate?: number) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  markTaskComplete: (id: string) => Promise<void>;
  suggestTasks: () => Promise<void>;

  // Insight Actions
  addInsight: (content: string, type: 'insight' | 'encouragement' | 'reminder', source: 'system' | 'ai' | 'user') => Promise<void>;
  markInsightSeen: (id: string) => Promise<void>;
  updateInsightNote: (id: string, userNote: string) => Promise<void>;

  // Memory System Actions
  addMemory: (memory: MemoryEntry) => Promise<void>;
  removeMemory: (id: string) => Promise<void>;
  addConversationSummary: (summary: ConversationSummary) => Promise<void>;
  getRelevantMemoriesForContext: (currentMessage: string, count?: number) => Promise<MemoryEntry[]>;
  generateContextFromMemories: (currentMessage: string) => Promise<string>;

  // Init
  initializeStore: () => Promise<void>;
}

// Helper to format recent activities into a summary string
const formatRecentActivitiesSummary = (state: AppState): string => {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  // Limit the number of recent entries shown per category
  const maxEntriesPerCategory = 2; // Show only the last 2 of each

  const recentCheckIns = state.checkIns.filter(c => new Date(c.date).getTime() >= sevenDaysAgo).slice(-maxEntriesPerCategory);
  const recentJournalEntries = state.journalEntries.filter(j => new Date(j.date).getTime() >= sevenDaysAgo).slice(-maxEntriesPerCategory);
  const recentTriggerLogs = state.triggerLogs.filter(t => new Date(t.date).getTime() >= sevenDaysAgo).slice(-maxEntriesPerCategory);
  const recentTasks = state.tasks.filter(t => t.date && new Date(t.date).getTime() >= sevenDaysAgo).slice(-maxEntriesPerCategory);
  const recentInsights = state.insights.filter(i => new Date(i.date).getTime() >= sevenDaysAgo).slice(-maxEntriesPerCategory);

  let summary = "--- User's Recent Activity Summary (Last 7 Days) ---\n";

  if (recentCheckIns.length > 0) {
    summary += `\nRecent Check-ins (${recentCheckIns.length}):\n`;
    recentCheckIns.forEach(c => {
      summary += `- On ${new Date(c.date).toLocaleDateString()}: Mood - ${c.mood}, Urges - ${c.urgeLevel}${c.notes ? `, Notes: ${c.notes.substring(0, 50)}...` : ''}\n`; // Changed Cravings to Urges and c.cravingLevel to c.urgeLevel
    });
  }

  if (recentJournalEntries.length > 0) {
    summary += `\nRecent Journal Entries (${recentJournalEntries.length}):\n`;
    recentJournalEntries.forEach(j => {
      summary += `- On ${new Date(j.date).toLocaleDateString()}: ${j.content.substring(0, 100)}...\n`; // Truncate journal content for summary
    });
  }

  if (recentTriggerLogs.length > 0) {
    summary += `\nRecent Trigger Logs (${recentTriggerLogs.length}):\n`;
    recentTriggerLogs.forEach(t => {
      summary += `- On ${new Date(t.date).toLocaleDateString()}: Trigger - ${t.trigger}, Intensity - ${t.intensity}${t.successful ? ', Strategy Successful' : ', Strategy Failed'}${t.notes ? `, Notes: ${t.notes.substring(0, 50)}...` : ''}\n`;
    });
  }

  const completedRecentTasks = recentTasks.filter(task => task.completed);
  const pendingRecentTasks = recentTasks.filter(task => !task.completed);

  if (recentTasks.length > 0) {
    summary += `\nRecent Tasks (${recentTasks.length}):\n`;
    if (pendingRecentTasks.length > 0) {
      summary += `Pending (${pendingRecentTasks.length}):\n`;
      pendingRecentTasks.slice(-maxEntriesPerCategory).forEach(t => {
        summary += `- ${t.title}${t.date ? ` (Due ${new Date(t.date).toLocaleDateString()})` : ''}\n`;
      });
    }
    if (completedRecentTasks.length > 0) {
      summary += `Completed (${completedRecentTasks.length}):\n`;
      completedRecentTasks.slice(-maxEntriesPerCategory).forEach(t => {
        summary += `- ${t.title} (Completed)\n`;
      });
    }
  }

  if (recentInsights.length > 0) {
    summary += `\nRecent Insights (${recentInsights.length}):\n`;
    recentInsights.forEach(i => {
      summary += `- ${i.content.substring(0, 100)}...\n`; // Truncate insight content for summary
    });
  }

  summary += "--------------------------------------------";

  return summary;
};

// Create the store with middleware for dev tools and persistence
export const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        activeTab: 'chat',
        isLoading: false,
        checkIns: [],
        journalEntries: [],
        messages: [],
        triggerLogs: [],
        tasks: [],
        insights: [],
        memories: [],
        conversationSummaries: [],
        userProgress: {
          currentStreak: 0,
          longestStreak: 0,
          startDate: null,
          lastCheckInDate: null,
          totalDaysClean: 0, // Renamed from totalDaysSober
          setbackCount: 0,
          milestones: [],
        },

        setActiveTab: (tab) => {
          analytics.trackEvent('page_view', { tab });
          set({ activeTab: tab });
        },
        setIsLoading: (loading) => set({ isLoading: loading }),

        submitCheckIn: async (mood, urgeLevel, notes) => { // cravingLevel to urgeLevel
          const userId = getOrCreateUserId();
          const today = getCurrentDateString();

          // Check if already submitted today
          const existingCheckIn = await getCheckIns(userId).then(checkIns =>
            checkIns.find(c => c.date === today)
          );
          if (existingCheckIn) {
            console.warn('Check-in already submitted for today');
            return;
          }

          const newCheckIn: DailyCheckIn = {
            id: uuidv4(),
            date: today,
            mood,
            urgeLevel, // cravingLevel to urgeLevel
            notes,
          };
          await saveCheckIn(newCheckIn, userId);

          // Add to memory system
          const memoryContent = `Check-in: Mood was ${mood}, urge level was ${urgeLevel}.${notes ? ` Notes: ${notes}` : ''}`; // craving to urge
          const memory: MemoryEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            content: memoryContent,
            type: 'personal_detail',
            importance: urgeLevel === 'extreme' || urgeLevel === 'severe' ? 9 : 7, // cravingLevel to urgeLevel
            tags: ['mood', 'urge', mood, urgeLevel], // craving to urge, cravingLevel to urgeLevel
            accessCount: 0
          };
          await get().addMemory(memory);

          // Update progress using all check-ins
          const allCheckIns = await getCheckIns(userId);
          const checkInDates = allCheckIns.map(c => c.date);
          const uniqueDays = Array.from(new Set(checkInDates.map(d => d.slice(0, 10))));
          const streak = calculateCurrentStreakFromCheckIns(checkInDates);
          const progress = await getProgress(userId);
          const isFirstCheckIn = !progress.startDate;
          const updatedProgress = {
            ...progress,
            lastCheckInDate: today,
            startDate: progress.startDate || today,
            currentStreak: streak,
            longestStreak: Math.max(streak, progress.longestStreak),
            totalDaysClean: uniqueDays.length, // Renamed from totalDaysSober
          };
          await updateProgress(updatedProgress, userId);

          // Track check-in completed
          analytics.trackEvent('check_in_completed', {
            mood,
            urgeLevel, // cravingLevel to urgeLevel
            hasNotes: notes.length > 0,
            isFirstCheckIn,
          });

          // Check for streak milestones
          if (streak > 0 && streak % 7 === 0) {
            // Add milestone achievement
            const milestone: Milestone = {
              id: uuidv4(),
              date: new Date().toISOString(),
              type: 'streak',
              value: streak,
              description: `${streak} day streak achieved!`
            };

            const updatedMilestones = [...(progress.milestones || []), milestone];

            await updateProgress({
              ...updatedProgress,
              milestones: updatedMilestones
            }, userId);

            // Add to memory
            const streakMemory: MemoryEntry = {
              id: uuidv4(),
              date: new Date().toISOString(),
              content: `User reached a ${streak} day streak milestone`,
              type: 'breakthrough',
              importance: 8,
              tags: ['streak', 'milestone', 'achievement'],
              accessCount: 0
            };
            await get().addMemory(streakMemory);

            analytics.trackEvent('streak_milestone', {
              days: streak,
              isLongestStreak: streak >= progress.longestStreak,
            });
          }

          // Generate daily tasks based on mood and current progress
          await get().suggestTasks();

          set({
            checkIns: await getCheckIns(userId),
            userProgress: await getProgress(userId),
          });
        },

        addJournalEntry: async (content, tags) => {
          const userId = getOrCreateUserId();
          const newEntry: JournalEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            content,
            tags,
          };

          await saveJournalEntry(newEntry, userId);

          // Add to memory system with appropriate importance based on content
          const importantInfo = extractImportantInformation(content);
          const memoryImportance = importantInfo.length > 0 ? 8 : 6;

          const memory: MemoryEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            content: content,
            type: 'personal_detail',
            importance: memoryImportance,
            tags: [...tags, 'journal'],
            accessCount: 0
          };
          await get().addMemory(memory);

          // Track journal entry created
          analytics.trackEvent('journal_entry_created', {
            wordCount: content.split(/\s+/).length,
            tagCount: tags.length,
            hasTags: tags.length > 0,
          });

          set({ journalEntries: await getJournalEntries(userId) });
        },

        removeJournalEntry: async (id) => {
          const userId = getOrCreateUserId();
          await deleteJournalEntry(id, userId);
          set({ journalEntries: await getJournalEntries(userId) });
        },

        addTriggerLog: async (trigger, intensity, strategy, successful, notes) => {
          const userId = getOrCreateUserId();
          const newTrigger: TriggerLog = {
            id: uuidv4(),
            date: new Date().toISOString(),
            trigger,
            intensity,
            strategy,
            successful,
            notes
          };

          await saveTriggerLog(newTrigger, userId);

          // Add to memory
          const memoryContent = `Trigger: ${trigger} (intensity: ${intensity}/10). Strategy used: ${strategy}. ${successful ? 'Strategy was successful' : 'Strategy was not successful'}.${notes ? ` Notes: ${notes}` : ''}`;
          const memory: MemoryEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            content: memoryContent,
            type: 'trigger', // This type seems fine
            importance: intensity >= 7 ? 9 : 7,
            tags: ['trigger', successful ? 'successful_strategy' : 'unsuccessful_strategy'],
            accessCount: 0
          };
          await get().addMemory(memory);

          // If strategy was successful, also add as a coping strategy
          if (successful) {
            const strategyMemory: MemoryEntry = {
              id: uuidv4(),
              date: new Date().toISOString(),
              content: `Effective coping strategy: ${strategy} for trigger: ${trigger}`,
              type: 'coping_strategy',
              importance: 8,
              tags: ['strategy', 'effective'],
              accessCount: 0
            };
            await get().addMemory(strategyMemory);
          }

          // Track trigger log created
          analytics.trackEvent('trigger_log_created', {
            intensity,
            successful,
            hasNotes: notes.length > 0
          });

          set({ triggerLogs: await getTriggerLogs(userId) });
        },

        removeTriggerLog: async (id) => {
          const userId = getOrCreateUserId();
          await deleteTriggerLog(id, userId);
          set({ triggerLogs: await getTriggerLogs(userId) });
        },

        addTask: async (title, description, date, priority, category, timeEstimate) => {
          const userId = getOrCreateUserId();
          const newTask: Task = {
            id: uuidv4(),
            title,
            description,
            completed: false,
            date,
            priority,
            category,
            timeEstimate
          };

          await saveTask(newTask, userId);

          // Add goal to memory
          const memory: MemoryEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            content: `User set a goal: ${title}${description ? ` - ${description}` : ''}`,
            type: 'goal',
            importance: priority === 'high' ? 7 : 5, // Simplified importance
            tags: ['goal', category],
            accessCount: 0
          };
          await get().addMemory(memory);

          // Track task created
          analytics.trackEvent('task_created', {
            priority,
            category,
            hasTimeEstimate: !!timeEstimate
          });

          set({ tasks: await getTasks(userId) });
        },

        removeTask: async (id) => {
          const userId = getOrCreateUserId();
          await deleteTask(id, userId);
          set({ tasks: await getTasks(userId) });
        },

        markTaskComplete: async (id) => {
          const userId = getOrCreateUserId();
          await completeTask(id, userId);

          // Find the task to add to memory
          const tasks = await getTasks(userId);
          const task = tasks.find(t => t.id === id);
          if (task) {
            const memory: MemoryEntry = {
              id: uuidv4(),
              date: new Date().toISOString(),
              content: `User completed the task: ${task.title}`,
              type: 'breakthrough', // Or 'achievement'
              importance: task.priority === 'high' ? 7 : 5, // Simplified importance
              tags: ['achievement', 'completed_task'],
              accessCount: 0
            };
            await get().addMemory(memory);
          }

          // Track task completed
          analytics.trackEvent('task_completed', { taskId: id });

          set({ tasks: await getTasks(userId) });
        },

        suggestTasks: async () => {
          const userId = getOrCreateUserId();
          const today = getCurrentDateString();
          const progress = await getProgress(userId);
          const currentProgressDays = progress.currentStreak; // Using currentStreak as a proxy for "progress days"
          const existingTasks = (await getTasks(userId)).filter(t => t.date === today);

          // Only suggest tasks if we don't have enough for today
          if (existingTasks.length < 3) {
            // const taskCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 tasks
            // // Removed 'recovery' category
            // const categories: TaskCategory[] = ['self-care', 'physical', 'social', 'productive'];
            // const priorities: TaskPriority[] = ['high', 'medium', 'low'];

            // for (let i = 0; i < taskCount; i++) {
            //   const category = categories[Math.floor(Math.random() * categories.length)];
            //   const priority = priorities[Math.floor(Math.random() * priorities.length)];

            //   // Using renamed getTaskSuggestion
            //   // const { title, description, timeEstimate } = getTaskSuggestion(category, currentProgressDays);

            //   // const newTask: Task = {
            //   //   id: uuidv4(),
            //   //   title,
            //   //   description,
            //   //   completed: false,
            //   //   date: today,
            //   //   priority,
            //   //   category,
            //   //   timeEstimate
            //   // };

            //   // await saveTask(newTask, userId);
            // }

            // set({ tasks: await getTasks(userId) });
            console.log("Task suggestion logic has been temporarily disabled due to mockUtils removal.");
          }
        },

        addInsight: async (content, type, source) => {
          const userId = getOrCreateUserId();
          const newInsight: EmotionalInsight = {
            id: uuidv4(),
            date: new Date().toISOString(),
            content,
            type,
            source,
            shown: false
          };

          await saveInsight(newInsight, userId);

          // Add to memory if it's a significant insight
          if (type === 'insight') {
            const memory: MemoryEntry = {
              id: uuidv4(),
              date: new Date().toISOString(),
              content: `Insight: ${content}`, // Generic insight content
              type: 'breakthrough',
              importance: 7,
              tags: ['insight', 'knowledge'], // Generic tags
              accessCount: 0
            };
            await get().addMemory(memory);
          }

          set({ insights: await getInsights(userId) });
        },

        markInsightSeen: async (id) => {
          const userId = getOrCreateUserId();
          await markInsightAsShown(id, userId);
          set({ insights: await getInsights(userId) });
        },

        updateInsightNote: async (id, userNote) => {
          const userId = getOrCreateUserId();
          await updateInsightUserNote(id, userNote, userId);
          set({ insights: await getInsights(userId) });
        },

        // Memory system actions
        addMemory: async (memory) => {
          const userId = getOrCreateUserId();
          // Only generate embedding if not already present
          if (!memory.embedding) {
            try {
              const fetchedEmbedding = await getOpenAIEmbedding(memory.content);
              if (validateEmbedding(fetchedEmbedding)) {
                memory.embedding = fetchedEmbedding;
              } else {
                console.warn('Invalid embedding received from backend, using fallback in store.');
                memory.embedding = generateFallbackEmbedding(memory.content);
              }
            } catch (error) {
              console.error('Failed to generate embedding in store:', error);
              memory.embedding = generateFallbackEmbedding(memory.content);
            }
          }
          await saveMemoryEntry(memory, userId);
          set({ memories: await getMemoryEntries(userId) });
        },

        removeMemory: async (id) => {
          const userId = getOrCreateUserId();
          await deleteMemoryEntry(id, userId);
          set({ memories: await getMemoryEntries(userId) });
        },

        addConversationSummary: async (summary) => {
          const userId = getOrCreateUserId();
          await saveConversationSummary(summary, userId);
          set({ conversationSummaries: await getConversationSummaries(userId) });
        },

        getRelevantMemoriesForContext: async (currentMessage: string, count = 5): Promise<MemoryEntry[]> => {
          const userId = getOrCreateUserId();
          return await getRelevantMemories(currentMessage, count, userId);
        },

        generateContextFromMemories: async (currentMessage: string): Promise<string> => {
          const userId = getOrCreateUserId();
          return await generateMemoryContextPrompt(currentMessage, userId);
        },

        sendMessage: async (content, supabaseUserId) => {
          const encryptionKey = getOrCreateUserId(); // This is CompanionApp_userId, for encryption
          set({ isLoading: true });

          if (!supabaseUserId) {
            console.error('sendMessage called without supabaseUserId. Aborting.');
            set({ isLoading: false });
            // Optionally, show an error to the user or add a fallback message
            const errorMsg: Message = {
              id: uuidv4(),
              content: 'Error: Could not send message. User identification failed.',
              sender: 'ai',
              timestamp: Date.now(),
            };
            saveMessage(errorMsg, encryptionKey);
            set(state => ({ messages: [...state.messages, errorMsg], isLoading: false }));
            return;
          }

          const userMessage: Message = {
            id: uuidv4(),
            content,
            sender: 'user',
            timestamp: Date.now(),
          };
          saveMessage(userMessage, encryptionKey); // Use encryptionKey for local storage

          // Process the message for memory system
          const topics = detectMessageTopic(content);
          const emotionalState = detectEmotionalState(content);
          const importantInfo = extractImportantInformation(content);

          // If we extracted important information, add it to memory
          if (importantInfo.length > 0) {
            for (const info of importantInfo) {
              const memory: MemoryEntry = {
                id: uuidv4(),
                date: new Date().toISOString(),
                content: info,
                type: 'personal_detail',
                importance: 8,
                tags: [...topics, emotionalState],
                accessCount: 0
              };
              await get().addMemory(memory);
            }
          }

          // Check if content mentions setback (previously relapse)
          if (content.toLowerCase().includes('setback') ||
            content.toLowerCase().includes('slip') ||
            content.toLowerCase().includes('struggled')) { // More generic terms
            const memory: MemoryEntry = {
              id: uuidv4(),
              date: new Date().toISOString(),
              content: `User mentioned potential setback: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
              type: 'setback', // Changed from 'relapse'
              importance: 10,
              tags: ['setback', 'challenge'], // Generic tags
              accessCount: 0
            };
            await get().addMemory(memory);
          }

          // Track message sent
          analytics.trackEvent('chat_message_sent', {
            messageLength: content.length,
            wordCount: content.split(/\s+/).length,
            messageType: 'user',
          });

          // Update messages immediately to show user message
          set(state => ({
            messages: [...state.messages, userMessage]
          }));

          // New summarization and context logic
          const SUMMARY_INTERVAL = 4;
          const allMessages = get().messages; // Includes current user message
          const numMessagesInStore = allMessages.length;

          // Calculate based on messages *before* the current user's message was added
          const numCompletedMessagesInHistory = numMessagesInStore - 1;

          const isFirstSummaryPoint = numCompletedMessagesInHistory === SUMMARY_INTERVAL;
          const isRollingSummaryPoint = numCompletedMessagesInHistory > SUMMARY_INTERVAL && (numCompletedMessagesInHistory % SUMMARY_INTERVAL === 0);

          let newAiSummaryToStore: ConversationSummary | null = null;
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://soberi-backend-service-280233666207.europe-west1.run.app';
          const apiKey = import.meta.env.VITE_BACKEND_API_KEY || 'sk-proj-sssssdffsdfwerwrwerdhhjmnvdfd2133443';

          if (!apiKey) {
            console.error('Backend API key is not configured');
            const errorMsg: Message = {
              id: uuidv4(),
              content: 'Error: Backend API key is not configured. Please contact support.',
              sender: 'ai',
              timestamp: Date.now(),
            };
            saveMessage(errorMsg, encryptionKey);
            set(state => ({ messages: [...state.messages, errorMsg], isLoading: false }));
            return;
          }

          if (isFirstSummaryPoint || isRollingSummaryPoint) {
            set({ isLoading: true }); // Indicate loading for summary generation
            // Messages to summarize are the block of completed messages *before* the current user's message
            const messagesForThisSummary = allMessages.slice(numCompletedMessagesInHistory - SUMMARY_INTERVAL, numCompletedMessagesInHistory);

            let promptForSummarization = "Summarize the following conversation concisely, capturing key points, decisions, and emotional tone. Focus on creating a brief that can inform future interactions:\n";
            messagesForThisSummary.forEach(m => { promptForSummarization += `${m.sender === 'user' ? 'User' : 'AI'}: ${m.content}\n`; });

            if (isRollingSummaryPoint) {
              const aiSummaries = get().conversationSummaries.filter(s => s.summaryType === 'ai_generated');
              if (aiSummaries.length > 0) {
                const latestPrevAiSummary = aiSummaries[aiSummaries.length - 1];
                // For rolling summary, the prompt includes previous summary and the NEW messages that led to this summary point
                promptForSummarization = `Previous summary: "${latestPrevAiSummary.summary}"\n\nBased on this previous summary and the following new messages, provide an updated and comprehensive summary of the entire conversation so far. The summary should be concise and highlight key developments:\n${messagesForThisSummary.map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')}`;
              }
            }

            try {
              // console.log("Client: Requesting AI summary with prompt:", promptForSummarization);
              const currentUserProgress = get().userProgress; // Get current user progress
              const summaryPayload = {
                message: promptForSummarization,
                recentMessages: [], // Explicitly empty for summary task
                userId: supabaseUserId, // Add userId for context if backend needs it
                contextBriefing: "This is a request to summarize the conversation provided in the main message. Please focus on that task. you are to generate a summary that can inform future interactions and make the user feel more connected to you", // Hint for the backend's system prompt
                userProgress: { // Ensure relapseCount is sent for summary payload too
                  ...currentUserProgress,
                  relapseCount: currentUserProgress.setbackCount,
                }
              };
              const encryptedSummaryPayload = encryptData(summaryPayload, encryptionKey);
              const summaryResponse = await fetch(`${backendUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
                body: JSON.stringify({ encryptedPayload: encryptedSummaryPayload, userId: encryptionKey }), // Send encrypted payload
              });

              if (!summaryResponse.ok) {
                const errorData = await summaryResponse.json();
                throw new Error(errorData.error || `AI Summary request failed with status ${summaryResponse.status}`);
              }
              const summaryData = await summaryResponse.json();
              const aiGeneratedSummaryText = summaryData.response;

              newAiSummaryToStore = {
                id: uuidv4(),
                date: new Date().toISOString(),
                summary: aiGeneratedSummaryText,
                messageIds: messagesForThisSummary.map(m => m.id), // Use corrected slice
                topics: detectMessageTopic(aiGeneratedSummaryText), // Basic topic detection on summary
                emotionalState: detectEmotionalState(aiGeneratedSummaryText), // Basic emotion detection
                keyInsights: extractImportantInformation(aiGeneratedSummaryText), // Basic insights
                summaryType: 'ai_generated'
              };
              get().addConversationSummary(newAiSummaryToStore);
              // console.log("Client: AI Summary generated and stored:", newAiSummaryToStore.summary);
            } catch (error) {
              console.error('Error generating AI summary:', error);
              // Decide if we should proceed without summary or show error
            }
            // isLoading will be set to false after the main chat response
          }

          // Prepare payload for the main chat response
          const recentActivitySummary = formatRecentActivitiesSummary(get());
          const currentUserProgress = get().userProgress;
          const clientContextBriefing = await get().generateContextFromMemories(content);
          const recentMessagesForChatPayload = allMessages.slice(-SUMMARY_INTERVAL).map(msg => ({
            sender: msg.sender,
            content: msg.content,
          }));
          const aiSummaries = get().conversationSummaries.filter(s => s.summaryType === 'ai_generated');
          const latestAiSummaryForChat = newAiSummaryToStore || (aiSummaries.length > 0 ? aiSummaries[aiSummaries.length - 1] : null);
          const payloadForBackend = {
            userId: supabaseUserId, // Use the PASSED IN supabaseUserId INSIDE payload
            message: content,
            chatSummary: latestAiSummaryForChat?.summary || '',
            recentMessages: recentMessagesForChatPayload,
            clientMemoryContext: clientContextBriefing,
            userProgress: {
              ...currentUserProgress,
              relapseCount: currentUserProgress.setbackCount, // Map setbackCount to relapseCount for backend
            },
            recentActivitySummary: recentActivitySummary
          };

          const encryptedPayload = encryptData(payloadForBackend, encryptionKey); // Encrypt with CompanionApp_userId (encryptionKey)

          try {
            const response = await fetch(`${backendUrl}/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
              body: JSON.stringify({ encryptedPayload, userId: encryptionKey }), // Send CompanionApp_userId (encryptionKey) as decryption key hint
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `API chat request failed with status ${response.status}`);
            }
            const data = await response.json();
            const aiResponseText = data.response;
            const insightMatch = aiResponseText.match(/<SOBERI_INSIGHT>(.*?)<\/SOBERI_INSIGHT>/s); // Reverted to SOBERI_INSIGHT
            let chatResponse = aiResponseText;
            let generatedInsight = null;

            if (insightMatch && insightMatch[1]) {
              generatedInsight = insightMatch[1].trim();
              // Remove insight from the main chat response
              chatResponse = aiResponseText.replace(insightMatch[0], '').trim();
            }

            const aiMessage: Message = {
              id: uuidv4(),
              content: chatResponse,
              sender: 'ai',
              timestamp: Date.now(),
            };
            saveMessage(aiMessage, encryptionKey); // Use encryptionKey for local storage

            // Add generated insight to the store if found
            if (generatedInsight) {
              get().addInsight(generatedInsight, 'insight', 'ai'); // Add with source 'ai'
            }

            set(state => ({
              messages: [...state.messages, aiMessage],
              isLoading: false,
            }));
          } catch (error: unknown) {
            console.error('Error connecting to AI backend or processing response:', error);
            let errorMessageText = 'An unknown error occurred with the AI backend.';
            if (error instanceof Error) errorMessageText = error.message;
            else if (typeof error === 'string') errorMessageText = error;

            const aiErrorMessage: Message = {
              id: uuidv4(),
              content: `Error: ${errorMessageText}`,
              sender: 'ai',
              timestamp: Date.now(),
            };
            saveMessage(aiErrorMessage, encryptionKey); // Use encryptionKey for local storage
            set(state => ({
              messages: [...state.messages, aiErrorMessage],
              isLoading: false,
            }));
          }
        },

        resetProgress: async () => {
          const userId = getOrCreateUserId();
          await resetStreak(userId);

          // Add setback to memory
          const memory: MemoryEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            content: 'User reset their progress counter',
            type: 'setback',
            importance: 10,
            tags: ['setback', 'reset'],
            accessCount: 0
          };
          await get().addMemory(memory);

          set({ userProgress: await getProgress(userId) });
        },

        markSetback: async () => {
          const userId = getOrCreateUserId();
          const progress = await getProgress(userId);
          const updatedProgress = {
            ...progress,
            currentStreak: 0,
            setbackCount: progress.setbackCount + 1,
          };
          await updateProgress(updatedProgress, userId);

          // Add setback to memory with high importance
          const memory: MemoryEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            content: `User experienced a setback after ${progress.currentStreak} days`,
            type: 'setback', // Changed from 'relapse'
            importance: 10,
            tags: ['setback', 'challenge'], // Generic tags
            accessCount: 0
          };
          await get().addMemory(memory);

          set({ userProgress: updatedProgress });
        },

        initializeStore: async () => {
          const userId = getOrCreateUserId();
          if (!userId) return;

          try {
            // Load all data asynchronously
            const [
              checkIns,
              journalEntries,
              messages,
              userProgress,
              triggerLogs,
              tasks,
              insights,
              memories,
              conversationSummaries
            ] = await Promise.all([
              getCheckIns(userId),
              getJournalEntries(userId),
              getMessages(userId),
              getProgress(userId),
              getTriggerLogs(userId),
              getTasks(userId),
              getInsights(userId),
              getMemoryEntries(userId),
              getConversationSummaries(userId)
            ]);

            set({
              checkIns,
              journalEntries,
              messages,
              userProgress,
              triggerLogs,
              tasks,
              insights,
              memories,
              conversationSummaries
            });

            // Check if tasks need to be suggested
            const today = getCurrentDateString();
            const todaysTasks = tasks.filter(t => t.date === today);
            if (todaysTasks.length === 0) {
              await get().suggestTasks();
            }
          } catch (error) {
            console.error('Failed to initialize store:', error);
          }
        },
      }),
      {
        name: 'Soberiai-storage',
        partialize: (state) => ({
          checkIns: state.checkIns,
          journalEntries: state.journalEntries,
          messages: state.messages,
          userProgress: state.userProgress,
          triggerLogs: state.triggerLogs,
          tasks: state.tasks,
          insights: state.insights,
          memories: state.memories,
          conversationSummaries: state.conversationSummaries,
        }),
        storage: {
          getItem: async (name) => {
            const userId = localStorage.getItem('Soberi_userId');
            if (!userId) return null;
            const value = await getAppState(userId);
            return value ? value : null;
          },
          setItem: async (name, value) => {
            const userId = localStorage.getItem('Soberi_userId');
            if (!userId) return;
            await saveAppState(value, userId);
          },
          removeItem: async (name) => {
            // For now, we'll just clear the app state for the current user
            const userId = localStorage.getItem('Soberi_userId');
            if (!userId) return;
            await saveAppState(null, userId);
          },
        },
      }
    )
  )
);
