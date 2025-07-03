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
  'Create initiatives',
  'Add work items to an initiative',
  'Create work item',
  'Define quarterly objectives',
  'Track OKR progress',
  'Prioritize work items',
  'Create sprint plan',
];

// Mock context data
export const mockContexts = {
  okrs: [
    {
      id: 1,
      name: 'Increase User Engagement',
      type: 'OKR',
      icon: 'ni-chart-bar-32',
      color: '#ebf5ff',
      iconColor: '#3182ce',
      meta: 'Q2 2023 • 75% complete',
    },
    {
      id: 2,
      name: 'Improve Platform Stability',
      type: 'OKR',
      icon: 'ni-chart-bar-32',
      color: '#ebf5ff',
      iconColor: '#3182ce',
      meta: 'Q2 2023 • 40% complete',
    },
    {
      id: 3,
      name: 'Expand Market Reach',
      type: 'OKR',
      icon: 'ni-chart-bar-32',
      color: '#ebf5ff',
      iconColor: '#3182ce',
      meta: 'Q2 2023 • 25% complete',
    },
  ],
  initiatives: [
    {
      id: 1,
      name: 'User Onboarding Redesign',
      type: 'Initiative',
      icon: 'ni-spaceship',
      color: '#faf5ff',
      iconColor: '#805ad5',
      meta: 'In progress • 3 work items',
    },
    {
      id: 2,
      name: 'Performance Optimization',
      type: 'Initiative',
      icon: 'ni-spaceship',
      color: '#faf5ff',
      iconColor: '#805ad5',
      meta: 'In progress • 5 work items',
    },
    {
      id: 3,
      name: 'Mobile App Development',
      type: 'Initiative',
      icon: 'ni-spaceship',
      color: '#faf5ff',
      iconColor: '#805ad5',
      meta: 'Planning • 2 work items',
    },
  ],
  workItems: [
    {
      id: 1,
      name: 'Implement User Feedback Form',
      type: 'Work Item',
      icon: 'ni-single-copy-04',
      color: '#f0fff4',
      iconColor: '#38a169',
      meta: 'High priority • Due in 5 days',
    },
    {
      id: 2,
      name: 'Fix Login Page Bug',
      type: 'Work Item',
      icon: 'ni-single-copy-04',
      color: '#f0fff4',
      iconColor: '#38a169',
      meta: 'Medium priority • Due in 3 days',
    },
    {
      id: 3,
      name: 'Update Documentation',
      type: 'Work Item',
      icon: 'ni-single-copy-04',
      color: '#f0fff4',
      iconColor: '#38a169',
      meta: 'Low priority • Due in 10 days',
    },
  ],
};

// localStorage keys for chat history
export const CHAT_HISTORY_KEY = 'ai_chat_history';
export const CHAT_SESSIONS_KEY = 'ai_chat_sessions';
