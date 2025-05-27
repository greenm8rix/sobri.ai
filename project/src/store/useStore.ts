import { create } from 'zustand';
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
  getConversationSummaries
} from '../utils/storageUtils';
import { getCurrentDateString } from '../utils/dateUtils';
import { v4 as uuidv4, getRecoveryTask, getEmotionalInsight } from '../utils/mockUtils';
import analytics from '../utils/analytics';
import { devtools, persist } from 'zustand/middleware';
import {
  // createMemoryFromMessage, // Unused import
  extractImportantInformation,
  detectMessageTopic,
  detectEmotionalState,
  createConversationSummary,
  shouldCreateSummary,
  getRelevantMemories,
  generateMemoryContextPrompt
} from '../utils/memoryUtils';

interface AppState {
  // UI State
  activeTab: 'chat' | 'checkin' | 'journal' | 'progress' | 'resources' | 'tasks';
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
  setActiveTab: (tab: 'chat' | 'checkin' | 'journal' | 'progress' | 'resources' | 'tasks') => void;
  setIsLoading: (loading: boolean) => void;

  // Check-in Actions
  submitCheckIn: (mood: MoodType, cravingLevel: CravingLevel, notes: string) => void;

  // Journal Actions
  addJournalEntry: (content: string, tags: string[]) => void;
  removeJournalEntry: (id: string) => void;

  // Chat Actions
  sendMessage: (content: string) => Promise<void>;

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

  // Memory System Actions
  addMemory: (memory: MemoryEntry) => void;
  removeMemory: (id: string) => void;
  addConversationSummary: (summary: ConversationSummary) => void;
  getRelevantMemoriesForContext: (currentMessage: string, count?: number) => MemoryEntry[];
  generateContextFromMemories: (currentMessage: string) => string;

  // Init
  initializeStore: () => void;
}

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

        submitCheckIn: (mood, cravingLevel, notes) => {
          const today = getCurrentDateString();
          const newCheckIn: DailyCheckIn = {
            id: uuidv4(),
            date: today,
            mood,
            cravingLevel,
            notes,
          };

          saveCheckIn(newCheckIn);

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
          get().addMemory(memory);

          // Update progress
          const progress = getProgress();
          const isFirstCheckIn = !progress.startDate;
          const updatedProgress = {
            ...progress,
            lastCheckInDate: today,
            startDate: progress.startDate || today,
          };

          updateProgress(updatedProgress);
          incrementStreak();

          // Track check-in completed
          analytics.trackEvent('check_in_completed', {
            mood,
            cravingLevel,
            hasNotes: notes.length > 0,
            isFirstCheckIn,
          });

          // Check for streak milestones
          const newStreak = progress.currentStreak + 1;
          if (newStreak > 0 && newStreak % 7 === 0) {
            // Add milestone achievement
            const milestone: Milestone = { // Added Milestone type
              id: uuidv4(),
              date: new Date().toISOString(),
              type: 'streak',
              value: newStreak,
              description: `${newStreak} day streak achieved!`
            };

            const updatedMilestones = [...(progress.milestones || []), milestone];

            updateProgress({
              ...progress,
              milestones: updatedMilestones
            });

            // Add to memory
            const streakMemory: MemoryEntry = {
              id: uuidv4(),
              date: new Date().toISOString(),
              content: `User reached a ${newStreak} day streak milestone`,
              type: 'breakthrough',
              importance: 8,
              tags: ['streak', 'milestone', 'achievement'],
              accessCount: 0
            };
            get().addMemory(streakMemory);

            analytics.trackEvent('streak_milestone', {
              days: newStreak,
              isLongestStreak: newStreak >= progress.longestStreak,
            });
          }

          // Generate daily tasks based on mood and recovery stage
          get().suggestTasks();

          // Add emotional insight based on check-in
          const insightContent = getEmotionalInsight(mood, cravingLevel, newStreak);
          if (insightContent) {
            get().addInsight(insightContent, 'insight', 'system');
          }

          set({
            checkIns: getCheckIns(),
            userProgress: getProgress(),
          });
        },

        addJournalEntry: (content, tags) => {
          const newEntry: JournalEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            content,
            tags,
          };

          saveJournalEntry(newEntry);

          // Add to memory system with appropriate importance based on content
          const importantInfo = extractImportantInformation(content);
          const memoryImportance = importantInfo.length > 0 ? 8 : 6;

          const memory: MemoryEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            content: content.length > 200 ? content.substring(0, 200) + '...' : content,
            type: 'personal_detail',
            importance: memoryImportance,
            tags: [...tags, 'journal'],
            accessCount: 0
          };
          get().addMemory(memory);

          // Track journal entry created
          analytics.trackEvent('journal_entry_created', {
            wordCount: content.split(/\s+/).length,
            tagCount: tags.length,
            hasTags: tags.length > 0,
          });

          set({ journalEntries: getJournalEntries() });
        },

        removeJournalEntry: (id) => {
          deleteJournalEntry(id);
          set({ journalEntries: getJournalEntries() });
        },

        addTriggerLog: (trigger, intensity, strategy, successful, notes) => {
          const newTrigger: TriggerLog = {
            id: uuidv4(),
            date: new Date().toISOString(),
            trigger,
            intensity,
            strategy,
            successful,
            notes
          };

          saveTriggerLog(newTrigger);

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
          get().addMemory(memory);

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
            get().addMemory(strategyMemory);
          }

          // Track trigger log created
          analytics.trackEvent('trigger_log_created', {
            intensity,
            successful,
            hasNotes: notes.length > 0
          });

          set({ triggerLogs: getTriggerLogs() });
        },

        removeTriggerLog: (id) => {
          deleteTriggerLog(id);
          set({ triggerLogs: getTriggerLogs() });
        },

        addTask: (title, description, date, priority, category, timeEstimate) => {
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

          saveTask(newTask);

          // Add goal to memory if the task seems important
          if (priority === 'high' || category === 'recovery') {
            const memory: MemoryEntry = {
              id: uuidv4(),
              date: new Date().toISOString(),
              content: `User set a goal: ${title}${description ? ` - ${description}` : ''}`,
              type: 'goal',
              importance: priority === 'high' ? 7 : 5,
              tags: ['goal', category],
              accessCount: 0
            };
            get().addMemory(memory);
          }

          // Track task created
          analytics.trackEvent('task_created', {
            priority,
            category,
            hasTimeEstimate: !!timeEstimate
          });

          set({ tasks: getTasks() });
        },

        removeTask: (id) => {
          deleteTask(id);
          set({ tasks: getTasks() });
        },

        markTaskComplete: (id) => {
          completeTask(id);

          // Find the task to add to memory
          const task = getTasks().find(t => t.id === id);
          if (task && (task.priority === 'high' || task.category === 'recovery')) {
            const memory: MemoryEntry = {
              id: uuidv4(),
              date: new Date().toISOString(),
              content: `User completed the task: ${task.title}`,
              type: 'breakthrough',
              importance: 6,
              tags: ['achievement', 'completed_task'],
              accessCount: 0
            };
            get().addMemory(memory);
          }

          // Track task completed
          analytics.trackEvent('task_completed', { taskId: id });

          set({ tasks: getTasks() });
        },

        suggestTasks: () => {
          const today = getCurrentDateString();
          const progress = getProgress();
          const recoveryDays = progress.currentStreak;
          const existingTasks = getTasks().filter(t => t.date === today);

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

              saveTask(newTask);
            }

            set({ tasks: getTasks() });
          }
        },

        addInsight: (content, type, source) => {
          const newInsight: EmotionalInsight = {
            id: uuidv4(),
            date: new Date().toISOString(),
            content,
            type,
            source,
            shown: false
          };

          saveInsight(newInsight);

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
            get().addMemory(memory);
          }

          set({ insights: getInsights() });
        },

        markInsightSeen: (id) => {
          markInsightAsShown(id);
          set({ insights: getInsights() });
        },

        // Memory system actions
        addMemory: (memory) => {
          saveMemoryEntry(memory);
          set({ memories: getMemoryEntries() });
        },

        removeMemory: (id) => {
          deleteMemoryEntry(id);
          set({ memories: getMemoryEntries() });
        },

        addConversationSummary: (summary) => {
          saveConversationSummary(summary);
          set({ conversationSummaries: getConversationSummaries() });
        },

        getRelevantMemoriesForContext: (currentMessage, count = 5) => {
          return getRelevantMemories(currentMessage, count);
        },

        generateContextFromMemories: (currentMessage) => {
          return generateMemoryContextPrompt(currentMessage);
        },

        sendMessage: async (content) => {
          set({ isLoading: true });

          // Save user message
          const userMessage: Message = {
            id: uuidv4(),
            content,
            sender: 'user',
            timestamp: Date.now(),
          };
          saveMessage(userMessage);

          // Process the message for memory system
          const topics = detectMessageTopic(content);
          const emotionalState = detectEmotionalState(content);
          const importantInfo = extractImportantInformation(content);

          // If we extracted important information, add it to memory
          if (importantInfo.length > 0) {
            importantInfo.forEach(info => {
              const memory: MemoryEntry = {
                id: uuidv4(),
                date: new Date().toISOString(),
                content: info,
                type: 'personal_detail',
                importance: 8,
                tags: [...topics, emotionalState],
                accessCount: 0
              };
              get().addMemory(memory);
            });
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
            get().addMemory(memory);
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

          // Check if we should create a conversation summary
          const allMessages = [...get().messages, userMessage];
          if (shouldCreateSummary(allMessages)) {
            const summary = createConversationSummary(allMessages.slice(-20)); // Use last 20 messages
            get().addConversationSummary(summary);
          }

          // Generate memory context for more personalized response
          // const memoryContext = get().generateContextFromMemories(content); // Unused variable

          // Simulate AI response delay - randomize for natural feel
          // await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

          // Generate response based on user message and memory context
          // const mockResponse = getMockResponseWithMemory(content, memoryContext); // Function is unused
          let mockResponse = '';

          // Generate a context briefing from existing client-side memories
          // This uses the already processed memories (check-ins, journal insights, etc.)
          const clientContextBriefing = get().generateContextFromMemories(content); // Existing function that creates a prompt
          // We can reuse this to get a summary of relevant client-side memories.
          // This might be too verbose; might need a more concise version later.

          try {
            const response = await fetch('http://localhost:4000/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': import.meta.env.VITE_APP_API_KEY,
              },
              body: JSON.stringify({
                message: content,
                contextBriefing: clientContextBriefing
              }),
            });
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `API request failed with status ${response.status}`);
            }
            const data = await response.json();
            mockResponse = data.response;
          } catch (error: unknown) {
            console.error('Error connecting to AI backend:', error);
            let errorMessage = 'An unknown error occurred.';
            if (error instanceof Error) {
              errorMessage = error.message;
            } else if (typeof error === 'string') {
              errorMessage = error;
            }
            mockResponse = `Error: Could not connect to the AI backend. Using fallback response. ${errorMessage}`;
            // Optionally, could add a system message indicating the error to the user
          }
          const aiMessage: Message = {
            id: uuidv4(),
            content: mockResponse,
            sender: 'ai',
            timestamp: Date.now(),
          };
          saveMessage(aiMessage);

          set(state => ({
            messages: [...state.messages, aiMessage],
            isLoading: false,
          }));
        },

        resetProgress: () => {
          // Confirm with the user before resetting everything
          const confirmed = window.confirm(
            "Are you sure you want to reset all your progress data? This will erase your streaks, check-ins, and messages. Journal entries will be preserved."
          );

          if (confirmed) {
            // Reset everything except journal entries
            localStorage.removeItem('myboo_checkins');
            localStorage.removeItem('myboo_messages');
            localStorage.removeItem('myboo_progress');

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

        markRelapse: () => {
          const progress = getProgress();
          resetStreak();

          // Add a relapse milestone to track progress
          const milestone: Milestone = { // Added Milestone type
            id: uuidv4(),
            date: new Date().toISOString(),
            type: 'relapse',
            value: progress.relapseCount + 1,
            description: `Relapse recorded - Starting fresh`
          };

          const updatedMilestones = [...(progress.milestones || []), milestone];

          updateProgress({
            ...getProgress(),
            milestones: updatedMilestones
          });

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
          get().addMemory(memory);

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

          set({ userProgress: getProgress() });
        },

        initializeStore: () => {
          set({
            checkIns: getCheckIns(),
            journalEntries: getJournalEntries(),
            messages: getMessages(),
            userProgress: getProgress(),
            triggerLogs: getTriggerLogs(),
            tasks: getTasks(),
            insights: getInsights(),
            memories: getMemoryEntries(),
            conversationSummaries: getConversationSummaries(),
          });
        },
      }),
      {
        name: 'mybooai-storage',
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
