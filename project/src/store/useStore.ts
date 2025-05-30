import { create } from 'zustand';
import { v4 as uuidv4_global } from 'uuid'; // Renaming to avoid conflict if uuidv4 is destructured later
import { DailyCheckIn, JournalEntry, Message, UserProgress, MoodType, CravingLevel, TriggerLog, Task, TaskCategory, TaskPriority, EmotionalInsight, MemoryEntry, ConversationSummary, Milestone } from '../types'; // Milestone moved to end for consistency if it matters
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
} from '../utils/storageUtils';
import { getCurrentDateString, calculateCurrentStreakFromCheckIns } from '../utils/dateUtils';
import { v4 as uuidv4, getRecoveryTask } from '../utils/mockUtils';
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
import { getOpenAIEmbedding } from '../utils/embeddingUtils';
import { encryptData } from '../utils/cryptoUtils';
import { useAuth } from '../auth/AuthContext'; // Ensure useAuth is imported if not already

// Helper function to get or create a unique user ID
const getOrCreateUserId = (): string => {
  let userId: string | null = localStorage.getItem('Soberi_userId');
  if (userId === null) { // Explicitly check for null
    userId = uuidv4_global();
    localStorage.setItem('Soberi_userId', userId); // userId is now definitely a string
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
  submitCheckIn: (mood: MoodType, cravingLevel: CravingLevel, notes: string) => void;

  // Journal Actions
  addJournalEntry: (content: string, tags: string[]) => void;
  removeJournalEntry: (id: string) => void;

  // Chat Actions
  sendMessage: (content: string, supabaseUserId: string) => Promise<void>;

  // Progress Actions
  resetProgress: () => void;
  markRelapse: () => void;

  // Trigger Logs Actions
  addTriggerLog: (trigger: string, intensity: number, strategy: string, successful: boolean, notes: string) => void;
  removeTriggerLog: (id: string) => void;

  // Task Actions
  addTask: (title: string, description: string, date: string, priority: TaskPriority, category: TaskCategory, timeEstimate?: number) => void;
  removeTask: (id: string) => void;
  markTaskComplete: (id: string) => void;
  suggestTasks: () => void;

  // Insight Actions
  addInsight: (content: string, type: 'insight' | 'encouragement' | 'reminder', source: 'system' | 'ai' | 'user') => void;
  markInsightSeen: (id: string) => void;
  updateInsightNote: (id: string, userNote: string) => void;

  // Memory System Actions
  addMemory: (memory: MemoryEntry) => void;
  removeMemory: (id: string) => void;
  addConversationSummary: (summary: ConversationSummary) => void;
  getRelevantMemoriesForContext: (currentMessage: string, count?: number) => Promise<MemoryEntry[]>;
  generateContextFromMemories: (currentMessage: string) => Promise<string>;

  // Init
  initializeStore: () => void;
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
      summary += `- On ${new Date(c.date).toLocaleDateString()}: Mood - ${c.mood}, Cravings - ${c.cravingLevel}${c.notes ? `, Notes: ${c.notes.substring(0, 50)}...` : ''}\n`;
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
          totalDaysClean: 0,
          relapseCount: 0,
          milestones: [],
        },

        setActiveTab: (tab) => {
          analytics.trackEvent('page_view', { tab });
          set({ activeTab: tab });
        },
        setIsLoading: (loading) => set({ isLoading: loading }),

        submitCheckIn: async (mood, cravingLevel, notes) => {
          const userId = getOrCreateUserId();
          const today = getCurrentDateString();
          const newCheckIn: DailyCheckIn = {
            id: uuidv4(),
            date: today,
            mood,
            cravingLevel,
            notes,
          };

          saveCheckIn(newCheckIn, userId);

          // Add to memory system
          const memoryContent = `User's mood: ${mood}, cravings: ${cravingLevel}${notes ? `, notes: ${notes}` : ''}`;
          const memory: MemoryEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            content: memoryContent,
            type: 'personal_detail',
            importance: cravingLevel === 'extreme' || cravingLevel === 'severe' ? 9 : 7,
            tags: ['mood', 'craving', mood, cravingLevel],
            accessCount: 0
          };
          await get().addMemory(memory);

          // Update progress using all check-ins
          const allCheckIns = getCheckIns(userId);
          const checkInDates = allCheckIns.map(c => c.date);
          const uniqueDays = Array.from(new Set(checkInDates.map(d => d.slice(0, 10))));
          const streak = calculateCurrentStreakFromCheckIns(checkInDates);
          const progress = getProgress(userId);
          const isFirstCheckIn = !progress.startDate;
          const updatedProgress = {
            ...progress,
            lastCheckInDate: today,
            startDate: progress.startDate || today,
            currentStreak: streak,
            longestStreak: Math.max(streak, progress.longestStreak),
            totalDaysClean: uniqueDays.length,
          };
          updateProgress(updatedProgress, userId);

          // Track check-in completed
          analytics.trackEvent('check_in_completed', {
            mood,
            cravingLevel,
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

            updateProgress({
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

          // Generate daily tasks based on mood and recovery stage
          get().suggestTasks();

          set({
            checkIns: getCheckIns(userId),
            userProgress: getProgress(userId),
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

          saveJournalEntry(newEntry, userId);

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

          set({ journalEntries: getJournalEntries(userId) });
        },

        removeJournalEntry: (id) => {
          const userId = getOrCreateUserId();
          deleteJournalEntry(id, userId);
          set({ journalEntries: getJournalEntries(userId) });
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

          saveTriggerLog(newTrigger, userId);

          // Add to memory
          const memoryContent = `Trigger: ${trigger} (intensity: ${intensity}/10). Strategy used: ${strategy}. ${successful ? 'Strategy was successful' : 'Strategy was not successful'}.${notes ? ` Notes: ${notes}` : ''}`;
          const memory: MemoryEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            content: memoryContent,
            type: 'trigger',
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

          set({ triggerLogs: getTriggerLogs(userId) });
        },

        removeTriggerLog: (id) => {
          const userId = getOrCreateUserId();
          deleteTriggerLog(id, userId);
          set({ triggerLogs: getTriggerLogs(userId) });
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

          saveTask(newTask, userId);

          // Add goal to memory
          const memory: MemoryEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            content: `User set a goal: ${title}${description ? ` - ${description}` : ''}`,
            type: 'goal',
            importance: priority === 'high' || category === 'recovery' ? 7 : 5,
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

          set({ tasks: getTasks(userId) });
        },

        removeTask: (id) => {
          const userId = getOrCreateUserId();
          deleteTask(id, userId);
          set({ tasks: getTasks(userId) });
        },

        markTaskComplete: async (id) => {
          const userId = getOrCreateUserId();
          completeTask(id, userId);

          // Find the task to add to memory
          const task = getTasks(userId).find(t => t.id === id);
          if (task) {
            const memory: MemoryEntry = {
              id: uuidv4(),
              date: new Date().toISOString(),
              content: `User completed the task: ${task.title}`,
              type: 'breakthrough',
              importance: task.priority === 'high' || task.category === 'recovery' ? 7 : 5,
              tags: ['achievement', 'completed_task'],
              accessCount: 0
            };
            await get().addMemory(memory);
          }

          // Track task completed
          analytics.trackEvent('task_completed', { taskId: id });

          set({ tasks: getTasks(userId) });
        },

        suggestTasks: () => {
          const userId = getOrCreateUserId();
          const today = getCurrentDateString();
          const progress = getProgress(userId);
          const recoveryDays = progress.currentStreak;
          const existingTasks = getTasks(userId).filter(t => t.date === today);

          // Only suggest tasks if we don't have enough for today
          if (existingTasks.length < 3) {
            // Generate 3-5 tasks based on recovery stage
            const taskCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 tasks
            const categories: TaskCategory[] = ['self-care', 'physical', 'social', 'productive', 'recovery'];
            const priorities: TaskPriority[] = ['high', 'medium', 'low'];

            for (let i = 0; i < taskCount; i++) {
              const category = categories[Math.floor(Math.random() * categories.length)];
              const priority = priorities[Math.floor(Math.random() * priorities.length)];

              const { title, description, timeEstimate } = getRecoveryTask(category, recoveryDays);

              const newTask: Task = {
                id: uuidv4(),
                title,
                description,
                completed: false,
                date: today,
                priority,
                category,
                timeEstimate
              };

              saveTask(newTask, userId);
            }

            set({ tasks: getTasks(userId) });
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

          saveInsight(newInsight, userId);

          // Add to memory if it's a significant insight
          if (type === 'insight') {
            const memory: MemoryEntry = {
              id: uuidv4(),
              date: new Date().toISOString(),
              content: `Recovery insight: ${content}`,
              type: 'breakthrough',
              importance: 7,
              tags: ['insight', 'recovery_knowledge'],
              accessCount: 0
            };
            await get().addMemory(memory);
          }

          set({ insights: getInsights(userId) });
        },

        markInsightSeen: (id) => {
          const userId = getOrCreateUserId();
          markInsightAsShown(id, userId);
          set({ insights: getInsights(userId) });
        },

        // Memory system actions
        addMemory: async (memory) => {
          const userId = getOrCreateUserId();
          // Only generate embedding if not already present
          if (!memory.embedding) {
            try {
              memory.embedding = await getOpenAIEmbedding(memory.content);
              // Validate the embedding
              if (!memory.embedding || memory.embedding.length !== 1536) {
                console.warn('Invalid embedding received, using fallback');
                // Use the fallback embedding generator
                const { generateFallbackEmbedding } = await import('../utils/embeddingUtils');
                memory.embedding = generateFallbackEmbedding(memory.content);
              }
            } catch (error) {
              console.error('Failed to generate embedding:', error);
              // Use fallback embedding on error
              const { generateFallbackEmbedding } = await import('../utils/embeddingUtils');
              memory.embedding = generateFallbackEmbedding(memory.content);
            }
          }
          saveMemoryEntry(memory, userId);
          set({ memories: getMemoryEntries(userId) });
        },

        removeMemory: (id) => {
          const userId = getOrCreateUserId();
          deleteMemoryEntry(id, userId);
          set({ memories: getMemoryEntries(userId) });
        },

        addConversationSummary: (summary) => {
          const userId = getOrCreateUserId();
          saveConversationSummary(summary, userId);
          set({ conversationSummaries: getConversationSummaries(userId) });
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
          const encryptionKey = getOrCreateUserId(); // This is Soberi_userId, for encryption
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

          // Check if content mentions relapse
          if (content.toLowerCase().includes('relapse') ||
            content.toLowerCase().includes('slip') ||
            content.toLowerCase().includes('used again')) {
            const memory: MemoryEntry = {
              id: uuidv4(),
              date: new Date().toISOString(),
              content: `User mentioned potential relapse: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
              type: 'relapse',
              importance: 10,
              tags: ['relapse', 'setback'],
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
                userProgress: currentUserProgress // Include user progress
              };
              const summaryResponse = await fetch(`${backendUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
                body: JSON.stringify(summaryPayload),
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
            userProgress: currentUserProgress,
            recentActivitySummary: recentActivitySummary
          };

          const encryptedPayload = encryptData(payloadForBackend, encryptionKey); // Encrypt with Soberi_userId (encryptionKey)

          try {
            const response = await fetch(`${backendUrl}/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
              body: JSON.stringify({ encryptedPayload, userId: encryptionKey }), // Send Soberi_userId (encryptionKey) as decryption key hint
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `API chat request failed with status ${response.status}`);
            }
            const data = await response.json();
            const aiResponseText = data.response;
            const insightMatch = aiResponseText.match(/<SOBERI_INSIGHT>(.*?)<\/SOBERI_INSIGHT>/s);
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

        resetProgress: () => {
          const userId = getOrCreateUserId();
          // Confirm with the user before resetting everything
          const confirmed = window.confirm(
            "Are you sure you want to reset all your progress data? This will erase your streaks, check-ins, and messages. Journal entries will be preserved."
          );

          if (confirmed) {
            // Reset everything except journal entries
            localStorage.removeItem('Soberi_checkins');
            localStorage.removeItem('Soberi_messages');
            localStorage.removeItem('Soberi_progress');

            set({
              checkIns: [],
              messages: [],
              userProgress: {
                currentStreak: 0,
                longestStreak: 0,
                startDate: null,
                lastCheckInDate: null,
                totalDaysClean: 0,
                relapseCount: 0,
                milestones: [],
              },
            });
          }
        },

        markRelapse: async () => {
          const userId = getOrCreateUserId();
          const progress = getProgress(userId);
          // Reset streak only on relapse
          const updatedProgress = {
            ...progress,
            currentStreak: 0,
            relapseCount: progress.relapseCount + 1,
          };
          updateProgress(updatedProgress, userId);

          // Add a relapse milestone to track progress
          const milestone: Milestone = {
            id: uuidv4(),
            date: new Date().toISOString(),
            type: 'relapse',
            value: progress.relapseCount + 1,
            description: `Relapse recorded - Starting fresh`
          };

          const updatedMilestones = [...(progress.milestones || []), milestone];

          updateProgress({
            ...getProgress(userId),
            milestones: updatedMilestones
          }, userId);

          // Add relapse to memory
          const memory: MemoryEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            content: `User experienced a relapse after ${progress.currentStreak} days clean`,
            type: 'relapse',
            importance: 10,
            tags: ['relapse', 'setback'],
            accessCount: 0
          };
          await get().addMemory(memory);

          // Track relapse recorded
          analytics.trackEvent('relapse_recorded', {
            previousStreak: progress.currentStreak,
            totalRelapses: progress.relapseCount + 1,
          });

          // Add an emotional insight about recovery being a process
          get().addInsight(
            "Recovery isn't linear. Every relapse is a chance to learn more about your triggers and strengthen your coping strategies. The fact that you're honest about this moment shows your commitment to long-term healing.",
            'encouragement',
            'system'
          );

          set({ userProgress: getProgress(userId) });
        },

        initializeStore: () => {
          const userId = getOrCreateUserId();
          set({
            checkIns: getCheckIns(userId),
            journalEntries: getJournalEntries(userId),
            messages: getMessages(userId),
            userProgress: getProgress(userId),
            triggerLogs: getTriggerLogs(userId),
            tasks: getTasks(userId),
            insights: getInsights(userId),
            memories: getMemoryEntries(userId),
            conversationSummaries: getConversationSummaries(userId),
          });
        },

        updateInsightNote: (id, userNote) => {
          const userId = getOrCreateUserId();
          updateInsightUserNote(id, userNote, userId);
          set({ insights: getInsights(userId) });
          // Also add/update a memory entry for this user note/reflection
          const insight = getInsights(userId).find(i => i.id === id);
          if (insight && userNote && userNote.trim().length > 0) {
            const memory: MemoryEntry = {
              id: `insight-note-${id}`,
              date: new Date().toISOString(),
              content: `User reflection on insight: ${insight.content}\nReflection: ${userNote}`,
              type: 'breakthrough',
              importance: 7,
              tags: ['insight', 'reflection', 'user_note'],
              accessCount: 0
            };
            saveMemoryEntry(memory, userId);
            set({ memories: getMemoryEntries(userId) });
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
          getItem: (name) => {
            const userId = localStorage.getItem('Soberi_userId');
            if (!userId) return null;
            const value = getAppState(userId);
            return value ? value : null;
          },
          setItem: (name, value) => {
            const userId = localStorage.getItem('Soberi_userId');
            if (!userId) return;
            saveAppState(value, userId);
          },
          removeItem: (name) => {
            localStorage.removeItem('Soberiai-storage');
          },
        },
      }
    )
  )
);

// Import the getMockResponse function from mockUtils for AI responses
// import { getMockResponse } from '../utils/mockUtils'; // This seems to be unused now as direct mock responses are replaced by backend calls

// Enhanced response function that incorporates memory context
// function getMockResponseWithMemory(content: string, memoryContext: string): string { // Unused function
//   // Get the standard response
//   const standardResponse = getMockResponse(content);
//
//   // If there's memory context available, try to personalize the response
//   if (memoryContext.trim().length > 0) {
//     // Simple personalization by adding references to previous conversations or user details
//     const personalizedIntros = [
//       `Based on what you've shared before, `,
//       `Considering what I know about your journey, `,
//       `Given what we've discussed previously, `,
//       `Taking into account your past experiences, `,
//       `Building on our previous conversations, `
//     ];
//
//     // Select a random personalized intro
//     const intro = personalizedIntros[Math.floor(Math.random() * personalizedIntros.length)];
//
//     // Approximately 50% of the time, add a reference to memory
//     if (Math.random() > 0.5) {
//       return intro + standardResponse.charAt(0).toLowerCase() + standardResponse.slice(1);
//     }
//   }
//
//   return standardResponse;
// }
