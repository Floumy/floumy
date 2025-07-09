// Utility functions for the AI Chat component

/**
 * Formats a timestamp to a readable time
 * @param {Date} date - The date to format
 * @returns {string} The formatted time string
 */
export const formatTimestamp = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Mock data for the chat
export const initialMessages = [
  {
    id: 1,
    text: "Hello! I'm your AI assistant. How can I help you today?",
    isUser: false,
    timestamp: new Date(Date.now() - 60000 * 5),
  },
];

// Example prompts for quick selection
export const examplePrompts = [
  'Help me define OKRs',
  'Help me define initiatives',
  'Help me define work items',
];

// localStorage keys for chat history
export const CHAT_HISTORY_KEY = 'ai_chat_history';
export const CHAT_SESSIONS_KEY = 'ai_chat_sessions';
