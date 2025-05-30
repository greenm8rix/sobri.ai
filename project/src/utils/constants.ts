// Application constants
export const APP_NAME = 'Sobri.ai';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_CONFIG = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'https://soberi-backend-service-280233666207.europe-west1.run.app',
  BACKEND_API_KEY: import.meta.env.VITE_BACKEND_API_KEY || '',
};

// Chat Configuration
export const CHAT_CONFIG = {
  FREE_CHAT_LIMIT: 10,
  MESSAGE_MAX_LENGTH: 5000,
  SUMMARY_INTERVAL: 4,
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_ID: 'Soberi_userId',
  DISMISSED_HINTS: 'dismissedChatHints',
};

// Memory System
export const MEMORY_CONFIG = {
  MAX_MEMORIES_TO_RETRIEVE: 5,
  EMBEDDING_DIMENSION: 1536,
  RECENCY_WEIGHT: 0.4,
  IMPORTANCE_WEIGHT: 0.2,
  ACCESS_WEIGHT: 0.2,
};

// Task Categories
export const TASK_CATEGORIES = {
  SELF_CARE: 'self-care',
  PHYSICAL: 'physical',
  SOCIAL: 'social',
  PRODUCTIVE: 'productive',
  RECOVERY: 'recovery',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'API configuration is missing. Please contact support.',
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  AUTH_REQUIRED: 'Please sign in to continue.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
}; 