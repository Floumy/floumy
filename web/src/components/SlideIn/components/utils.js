// Utility functions for the AI Chat component

/**
 * Converts markdown text to HTML
 * @param {string} markdown - The markdown text to convert
 * @returns {string} The converted HTML
 */
export const markdownToHtml = (markdown) => {
  if (!markdown) return '';

  // Convert bold text: **text** or __text__ to <strong>text</strong>
  let html = markdown.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');

  // Convert code blocks: ```code``` to <pre><code>code</code></pre>
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Convert inline code: `code` to <code>code</code>
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Convert lists: - item to <ul><li>item</li></ul>
  html = html.replace(/(?:^|\n)- (.*)/g, '<ul><li>$1</li></ul>');
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // Convert links: [text](url) to <a href="url">text</a>
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  // Convert paragraphs: add <p> tags for text blocks
  html = html.replace(/(?:^|\n)([^\n<]+)(?:\n|$)/g, '<p>$1</p>');
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
};

/**
 * Simulates typing effect for AI responses
 * @param {string} text - The text to simulate typing for
 * @param {Function} callback - Callback function to update the text
 * @param {number} speed - Speed of typing in milliseconds
 * @returns {number} The interval ID
 */
export const simulateTyping = (text, callback, speed = 30) => {
  let i = 0;
  const interval = setInterval(() => {
    callback(text.substring(0, i));
    i++;
    if (i > text.length) {
      clearInterval(interval);
    }
  }, speed);
  return interval;
};

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