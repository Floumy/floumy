import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';
import { Button, Input, InputGroup, InputGroupAddon, UncontrolledTooltip } from 'reactstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import DOMPurify from 'dompurify';

// Styled components for the chat UI
const ChatContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 600px;
  height: 100vh;
  background-color: #ffffff;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  resize: horizontal;
  min-width: 500px;
  border-left: 1px solid #e6e6e6;

  @media (max-width: 1200px) {
    box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
    /* On medium or smaller screens, don't push content, just overlay */
    position: absolute;
  }
`;

const ChatHeader = styled.div`
  padding: 16px 20px;
  background-color: white;
  color: #343541;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  letter-spacing: 0.3px;
  border-bottom: 1px solid #e5e5e6;
`;

const ContextContainer = styled.div`
  padding: 12px 20px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e5e6;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ContextHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ContextTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
`;

const ContextSwitcher = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ContextItem = styled.div`
  background-color: white;
  border: 1px solid #e5e5e6;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #343541;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const ContextIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: ${props => props.color || '#f0e7fa'};
  color: ${props => props.iconColor || '#8a2be2'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const ContextInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ContextName = styled.div`
  font-weight: 500;
  margin-bottom: 2px;
`;

const ContextMeta = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const ContextSelect = styled.select`
  background-color: white;
  border: 1px solid #e5e5e6;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: #343541;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #8a2be2;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e5e6;
  background-color: white;
`;

const Tab = styled.button`
  padding: 12px 20px;
  background-color: ${props => props.active ? '#f9fafb' : 'white'};
  color: ${props => props.active ? '#8a2be2' : '#6b7280'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#8a2be2' : 'transparent'};
  font-weight: ${props => props.active ? '600' : '500'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: #8a2be2;
    background-color: ${props => props.active ? '#f9fafb' : 'rgba(249, 250, 251, 0.5)'};
  }

  &:focus {
    outline: none;
  }
`;

const HistoryContainer = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: white;
`;

const HistoryList = styled(PerfectScrollbar)`
  flex: 1;
  padding: 0 20px;

  .ps__rail-y {
    background-color: transparent !important;
    width: 8px !important;

    .ps__thumb-y {
      background-color: rgba(138, 43, 226, 0.3) !important;
      width: 6px !important;
      right: 1px !important;
    }
  }
`;

const HistoryItem = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e5e5e6;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f9fafb;
  }
`;

const HistoryItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const HistoryItemTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #343541;
`;

const HistoryItemDate = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

const HistoryItemPreview = styled.div`
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmptyHistory = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: #6b7280;

  i {
    font-size: 32px;
    margin-bottom: 16px;
    color: #d1d5db;
  }

  h4 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #374151;
  }

  p {
    font-size: 14px;
    max-width: 300px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ClearHistoryButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:focus {
    outline: none;
  }
`;

const ChatBody = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: white;
`;

const MessageList = styled(PerfectScrollbar)`
  flex: 1;
  padding: 0 20px;

  .ps__rail-y {
    background-color: transparent !important;
    width: 8px !important;

    .ps__thumb-y {
      background-color: rgba(138, 43, 226, 0.3) !important;
      width: 6px !important;
      right: 1px !important;
    }
  }
`;

const MessageRow = styled(motion.div)`
  display: flex;
  padding: 16px 0;
  position: relative;
  width: 100%;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(249, 250, 251, 0.7);
  }
`;

const MessageAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;

  ${(props) =>
    props.isUser
      ? `
    background-color: #8a2be2;
    color: white;
  `
      : `
    background-color: #f0e7fa;
    color: #8a2be2;
  `}
`;

const MessageContent = styled.div`
  flex: 1;
  word-wrap: break-word;
  line-height: 1.6;
  font-size: 14px;
  color: #343541;
  max-width: calc(100% - 44px);
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Timestamp = styled.div`
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
  opacity: 0.8;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
`;

const MessageSender = styled.div`
  font-weight: 600;
  font-size: 13px;
  color: ${(props) => (props.isUser ? '#8a2be2' : '#343541')};
  margin-right: 8px;
`;

const ChatFooter = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #e5e5e6;
  background-color: white;
  position: relative;
  z-index: 1;

  .input-group {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e5e5e6;
  }
`;

const ExamplePromptsContainer = styled.div`
  padding: 20px;
  border-top: 1px solid #e5e5e6;
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  background-color: #f9fafb;
  position: relative;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: thin;
  scrollbar-color: rgba(138, 43, 226, 0.3) transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(138, 43, 226, 0.3);
    border-radius: 6px;
  }

  &:before {
    content: "Suggested prompts";
    position: absolute;
    top: -10px;
    left: 20px;
    background-color: #f9fafb;
    padding: 0 8px;
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
  }
`;

const ExamplePromptChip = styled.div`
  background-color: white;
  color: #6b21a8;
  border: 1px solid #e5e5e6;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;

  &:before {
    content: "✨";
    font-size: 14px;
  }

  &:hover {
    background: linear-gradient(135deg, #f9f5ff 0%, #fff 100%);
    color: #8a2be2;
    border-color: #d8b4fe;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;


const RegenerateButton = styled(Button)`
  margin: 8px 20px 16px;
  align-self: flex-start;
  background-color: white;
  color: #6b21a8;
  border: 1px solid #e5e5e6;
  font-weight: 500;
  transition: all 0.15s ease;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background-color: #f9f5ff;
    color: #8a2be2;
    border-color: #d8b4fe;
    transform: translateY(-1px);
  }

  &:focus {
    outline: none;
    border-color: #d8b4fe;
  }
`;

// Mock data for the chat
const initialMessages = [
  {
    id: 1,
    text: "Hello! I'm your AI assistant. How can I help you today?",
    isUser: false,
    timestamp: new Date(Date.now() - 60000 * 5),
  },
];

// Example prompts for quick selection
const examplePrompts = [
  "Help me define OKRs",
  "Create initiatives",
  "Add work items to an initiative",
  "Create work item",
  "Define quarterly objectives",
  "Track OKR progress",
  "Prioritize work items",
  "Create sprint plan",
];

// Mock context data
const mockContexts = {
  okrs: [
    { id: 1, name: "Increase User Engagement", type: "OKR", icon: "ni-chart-bar-32", color: "#ebf5ff", iconColor: "#3182ce", meta: "Q2 2023 • 75% complete" },
    { id: 2, name: "Improve Platform Stability", type: "OKR", icon: "ni-chart-bar-32", color: "#ebf5ff", iconColor: "#3182ce", meta: "Q2 2023 • 40% complete" },
    { id: 3, name: "Expand Market Reach", type: "OKR", icon: "ni-chart-bar-32", color: "#ebf5ff", iconColor: "#3182ce", meta: "Q2 2023 • 25% complete" },
  ],
  initiatives: [
    { id: 1, name: "User Onboarding Redesign", type: "Initiative", icon: "ni-spaceship", color: "#faf5ff", iconColor: "#805ad5", meta: "In progress • 3 work items" },
    { id: 2, name: "Performance Optimization", type: "Initiative", icon: "ni-spaceship", color: "#faf5ff", iconColor: "#805ad5", meta: "In progress • 5 work items" },
    { id: 3, name: "Mobile App Development", type: "Initiative", icon: "ni-spaceship", color: "#faf5ff", iconColor: "#805ad5", meta: "Planning • 2 work items" },
  ],
  workItems: [
    { id: 1, name: "Implement User Feedback Form", type: "Work Item", icon: "ni-single-copy-04", color: "#f0fff4", iconColor: "#38a169", meta: "High priority • Due in 5 days" },
    { id: 2, name: "Fix Login Page Bug", type: "Work Item", icon: "ni-single-copy-04", color: "#f0fff4", iconColor: "#38a169", meta: "Medium priority • Due in 3 days" },
    { id: 3, name: "Update Documentation", type: "Work Item", icon: "ni-single-copy-04", color: "#f0fff4", iconColor: "#38a169", meta: "Low priority • Due in 10 days" },
  ],
};

// Function to convert markdown to HTML
const markdownToHtml = (markdown) => {
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

// Simulate typing effect for AI responses
const simulateTyping = (text, callback, speed = 30) => {
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

// localStorage keys for chat history
const CHAT_HISTORY_KEY = 'ai_chat_history';
const CHAT_SESSIONS_KEY = 'ai_chat_sessions';

export default function AiChatSlideIn({
  isOpen: initialIsOpen,
  toggle: externalToggle,
}) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [contextType, setContextType] = useState('okrs');
  const [selectedContext, setSelectedContext] = useState(mockContexts.okrs[0]);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'history'
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(Date.now().toString());
  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const clearHistoryBtnRef = useRef(null);

  // Load chat sessions and current chat history from localStorage on mount
  useEffect(() => {
    try {
      // Load chat sessions
      const savedSessions = localStorage.getItem(CHAT_SESSIONS_KEY);
      if (savedSessions) {
        setChatSessions(JSON.parse(savedSessions));
      }

      // Load current chat history
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Convert string timestamps back to Date objects
        const messagesWithDates = parsedHistory.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // Only save completed messages (filter out streaming messages)
        const completedMessages = messages.filter(msg => !msg.isStreaming);

        // Save current chat
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(completedMessages));

        // Update or add to chat sessions
        const firstUserMessage = completedMessages.find(msg => msg.isUser);
        const firstAIMessage = completedMessages.find(msg => !msg.isUser);

        const sessionTitle = firstUserMessage 
          ? firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '')
          : 'New conversation';

        const sessionPreview = firstAIMessage 
          ? firstAIMessage.text.substring(0, 100) + (firstAIMessage.text.length > 100 ? '...' : '')
          : 'No response yet';

        const sessionDate = new Date();

        const updatedSessions = [...chatSessions];
        const existingSessionIndex = updatedSessions.findIndex(s => s.id === currentSessionId);

        const sessionData = {
          id: currentSessionId,
          title: sessionTitle,
          preview: sessionPreview,
          date: sessionDate,
          messages: completedMessages
        };

        if (existingSessionIndex >= 0) {
          updatedSessions[existingSessionIndex] = sessionData;
        } else {
          updatedSessions.unshift(sessionData);
        }

        setChatSessions(updatedSessions);
        localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(updatedSessions));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [messages, chatSessions, currentSessionId]);

  // Function to load a specific chat session
  const loadChatSession = (sessionId) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
      setCurrentSessionId(sessionId);
      setActiveTab('chat');
    }
  };

  // Function to start a new chat session
  const startNewSession = () => {
    setMessages(initialMessages);
    setCurrentSessionId(Date.now().toString());
    setActiveTab('chat');
  };

  // Handle clearing chat history
  const handleClearHistory = () => {
    setMessages(initialMessages);
    setChatSessions([]);
    setCurrentSessionId(Date.now().toString());
    localStorage.removeItem(CHAT_HISTORY_KEY);
    localStorage.removeItem(CHAT_SESSIONS_KEY);
  };

  // Handle selecting an example prompt
  const handleSelectPrompt = (prompt) => {
    setInputValue(prompt);
  };

  // Handle context type change
  const handleContextTypeChange = (e) => {
    const newType = e.target.value;
    setContextType(newType);
    setSelectedContext(mockContexts[newType][0]);
  };

  // Handle context item selection
  const handleContextSelect = (contextItem) => {
    setSelectedContext(contextItem);
    // You could also update the input value with a relevant prompt
    setInputValue(`Tell me about ${contextItem.name}`);
  };

  // Update internal state when prop changes
  useEffect(() => {
    setIsOpen(initialIsOpen);
  }, [initialIsOpen]);

  // Toggle chat visibility
  const toggle = () => {
    setIsOpen(!isOpen);
    if (externalToggle) {
      externalToggle();
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI thinking
    setIsTyping(true);

    // Mock AI response after a delay
    setTimeout(() => {
      setIsTyping(false);

      // Generate a mock response based on user input
      let responseText = '';
      if (
        inputValue.toLowerCase().includes('hello') ||
        inputValue.toLowerCase().includes('hi')
      ) {
        responseText = 'Hello there! How can I assist you today?';
      } else if (inputValue.toLowerCase().includes('help')) {
        responseText =
          "I'd be happy to help! Here are some things I can do:\n\n- Answer questions\n- Provide information\n- Assist with tasks\n\nJust let me know what you need!";
      } else if (inputValue.toLowerCase().includes('markdown')) {
        responseText =
          "Sure, I can demonstrate Markdown:\n\n**Bold text** looks like this.\n\n`Code snippets` are formatted like this.\n\n```\nfunction example() {\n  return 'This is a code block';\n}\n```\n\nYou can also create [links](https://example.com).";
      } else {
        responseText =
          "Thanks for your message! I'm a mock AI assistant. This is a simulated response to demonstrate the chat interface. Is there anything specific you'd like to know?";
      }

      // Create a placeholder for the streaming message
      const aiMessage = {
        id: messages.length + 2,
        text: '',
        isUser: false,
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Simulate streaming text
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }

      typingIntervalRef.current = simulateTyping(responseText, (text) => {
        setCurrentStreamingMessage(text);
      });

      // When streaming is complete, update the message
      setTimeout(
        () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessage.id
                ? { ...msg, text: responseText, isStreaming: false }
                : msg,
            ),
          );
          setCurrentStreamingMessage('');
        },
        responseText.length * 30 + 500,
      );
    }, 1000);
  };

  // Handle regenerating the last AI response
  const handleRegenerateResponse = () => {
    // Find the last AI message
    const lastAiMessageIndex = [...messages]
      .reverse()
      .findIndex((msg) => !msg.isUser);

    if (lastAiMessageIndex === -1) return;

    const actualIndex = messages.length - 1 - lastAiMessageIndex;
    const lastAiMessage = messages[actualIndex];

    // Remove the last AI message
    setMessages((prev) => prev.filter((_, index) => index !== actualIndex));

    // Simulate AI thinking
    setIsTyping(true);

    // Generate a new response
    setTimeout(() => {
      setIsTyping(false);

      // Create a slightly different response
      const newResponseText =
        lastAiMessage.text + ' (Regenerated with additional insights)';

      // Create a placeholder for the streaming message
      const regeneratedMessage = {
        id: messages.length + 1,
        text: '',
        isUser: false,
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, regeneratedMessage]);

      // Simulate streaming text
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }

      typingIntervalRef.current = simulateTyping(newResponseText, (text) => {
        setCurrentStreamingMessage(text);
      });

      // When streaming is complete, update the message
      setTimeout(
        () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === regeneratedMessage.id
                ? { ...msg, text: newResponseText, isStreaming: false }
                : msg,
            ),
          );
          setCurrentStreamingMessage('');
        },
        newResponseText.length * 30 + 500,
      );
    }, 1000);
  };

  // Format timestamp
  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <ChatContainer
          >
            <ChatHeader>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '6px', 
                  backgroundColor: '#f0e7fa', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <i className="ni ni-atom" style={{ color: '#8a2be2', fontSize: '14px' }}></i>
                </div>
                <span style={{ fontWeight: '600', color: '#343541' }}>AI Assistant</span>
              </div>
              <HeaderActions>
                <ClearHistoryButton 
                  onClick={handleClearHistory}
                  id="clear-history-btn"
                  ref={clearHistoryBtnRef}
                >
                  <i className="ni ni-fat-delete" style={{ fontSize: '14px' }}></i>
                </ClearHistoryButton>
                <UncontrolledTooltip
                  placement="top"
                  target="clear-history-btn"
                >
                  Clear chat history
                </UncontrolledTooltip>
                <Button 
                  close 
                  onClick={toggle} 
                  style={{ 
                    color: '#6b7280', 
                    opacity: 0.6,
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '0.6'}
                />
              </HeaderActions>
            </ChatHeader>

            <TabsContainer>
              <Tab 
                active={activeTab === 'chat'} 
                onClick={() => setActiveTab('chat')}
              >
                <i className="ni ni-chat-round" style={{ fontSize: '14px' }}></i>
                Chat
              </Tab>
              <Tab 
                active={activeTab === 'history'} 
                onClick={() => setActiveTab('history')}
              >
                <i className="ni ni-time-alarm" style={{ fontSize: '14px' }}></i>
                History
              </Tab>
            </TabsContainer>

            {activeTab === 'chat' ? (
              <>
                <ContextContainer>
                  <ContextHeader>
                    <ContextTitle>Current Context</ContextTitle>
                    <ContextSwitcher>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>View:</span>
                      <ContextSelect value={contextType} onChange={handleContextTypeChange}>
                        <option value="okrs">OKRs</option>
                        <option value="initiatives">Initiatives</option>
                        <option value="workItems">Work Items</option>
                      </ContextSelect>
                    </ContextSwitcher>
                  </ContextHeader>

                  {/* Selected context item */}
                  <ContextItem>
                    <ContextIcon color={selectedContext.color} iconColor={selectedContext.iconColor}>
                      <i className={`ni ${selectedContext.icon}`}></i>
                    </ContextIcon>
                    <ContextInfo>
                      <ContextName>{selectedContext.name}</ContextName>
                      <ContextMeta>{selectedContext.meta}</ContextMeta>
                    </ContextInfo>
                  </ContextItem>

                  {/* List of available context items */}
                  <div style={{ marginTop: '8px' }}>
                    <ContextTitle style={{ marginBottom: '8px' }}>Other {contextType === 'okrs' ? 'OKRs' : contextType === 'initiatives' ? 'Initiatives' : 'Work Items'}</ContextTitle>
                    {mockContexts[contextType]
                      .filter(item => item.id !== selectedContext.id)
                      .slice(0, 2) // Show only 2 other items to save space
                      .map(item => (
                        <ContextItem 
                          key={item.id} 
                          onClick={() => handleContextSelect(item)}
                          style={{ cursor: 'pointer', opacity: 0.8, transition: 'all 0.2s ease' }}
                          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                        >
                          <ContextIcon color={item.color} iconColor={item.iconColor}>
                            <i className={`ni ${item.icon}`}></i>
                          </ContextIcon>
                          <ContextInfo>
                            <ContextName>{item.name}</ContextName>
                            <ContextMeta>{item.meta}</ContextMeta>
                          </ContextInfo>
                        </ContextItem>
                      ))}
                  </div>
                </ContextContainer>

                <ChatBody>
                  <MessageList>
                    <MessageContainer>
                      {messages.map((message) => (
                        <MessageRow 
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <MessageAvatar isUser={message.isUser}>
                            {message.isUser ? 'U' : 'AI'}
                          </MessageAvatar>
                          <div style={{ flex: 1 }}>
                            <MessageHeader>
                              <MessageSender isUser={message.isUser}>
                                {message.isUser ? 'You' : 'AI Assistant'}
                              </MessageSender>
                              <Timestamp>
                                {formatTimestamp(message.timestamp)}
                              </Timestamp>
                            </MessageHeader>
                            <MessageContent>
                              {message.isUser ? (
                                message.text
                              ) : (
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                      markdownToHtml(message.text),
                                    ),
                                  }}
                                />
                              )}
                            </MessageContent>
                          </div>
                        </MessageRow>
                      ))}

                      {/* Streaming message */}
                      {currentStreamingMessage && (
                        <MessageRow
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <MessageAvatar isUser={false}>AI</MessageAvatar>
                          <div style={{ flex: 1 }}>
                            <MessageHeader>
                              <MessageSender isUser={false}>
                                AI Assistant
                              </MessageSender>
                              <Timestamp>
                                {formatTimestamp(new Date())}
                              </Timestamp>
                            </MessageHeader>
                            <MessageContent>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(
                                    markdownToHtml(currentStreamingMessage),
                                  ),
                                }}
                              />
                            </MessageContent>
                          </div>
                        </MessageRow>
                      )}

                      {/* Loading indicator */}
                      {isTyping && (
                        <MessageRow
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <MessageAvatar isUser={false}>AI</MessageAvatar>
                          <div style={{ flex: 1 }}>
                            <MessageHeader>
                              <MessageSender isUser={false}>
                                AI Assistant
                              </MessageSender>
                              <Timestamp>
                                {formatTimestamp(new Date())}
                              </Timestamp>
                            </MessageHeader>
                            <MessageContent>
                              <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                            </MessageContent>
                          </div>
                        </MessageRow>
                      )}

                      <div ref={messagesEndRef} />
                    </MessageContainer>
                  </MessageList>

                  {/* Regenerate button */}
                  {messages.some((msg) => !msg.isUser) && !isTyping && (
                    <RegenerateButton
                      color="light"
                      size="sm"
                      onClick={handleRegenerateResponse}
                    >
                      <i className="ni ni-refresh-02" style={{ fontSize: '12px' }}></i>
                      Regenerate response
                    </RegenerateButton>
                  )}
                </ChatBody>

                <ExamplePromptsContainer>
                  {examplePrompts.map((prompt, index) => (
                    <ExamplePromptChip 
                      key={index} 
                      onClick={() => handleSelectPrompt(prompt)}
                    >
                      {prompt}
                    </ExamplePromptChip>
                  ))}
                </ExamplePromptsContainer>

                <ChatFooter>
                  <InputGroup>
                    <Input
                      placeholder="Type your message..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && inputValue.trim()) {
                          handleSendMessage();
                        }
                      }}
                    />
                    <InputGroupAddon addonType="append">
                      <Button
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={isTyping || !inputValue.trim()}
                      >
                        Send
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </ChatFooter>
              </>
            ) : (
              <HistoryContainer>
                <HistoryList>
                  {chatSessions.length > 0 ? (
                    chatSessions.map((session) => (
                      <HistoryItem 
                        key={session.id} 
                        onClick={() => loadChatSession(session.id)}
                      >
                        <HistoryItemHeader>
                          <HistoryItemTitle>{session.title}</HistoryItemTitle>
                          <HistoryItemDate>
                            {new Date(session.date).toLocaleDateString()} {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </HistoryItemDate>
                        </HistoryItemHeader>
                        <HistoryItemPreview>{session.preview}</HistoryItemPreview>
                      </HistoryItem>
                    ))
                  ) : (
                    <EmptyHistory>
                      <i className="ni ni-time-alarm"></i>
                      <h4>No chat history yet</h4>
                      <p>Your chat history will appear here once you start conversations.</p>
                    </EmptyHistory>
                  )}
                </HistoryList>
                <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e5e6' }}>
                  <Button 
                    color="primary" 
                    block 
                    onClick={startNewSession}
                  >
                    <i className="ni ni-chat-round" style={{ marginRight: '8px' }}></i>
                    Start New Chat
                  </Button>
                </div>
              </HistoryContainer>
            )}
          </ChatContainer>
        )}
      </AnimatePresence>

      {/* Add styling for the typing indicator and other elements */}
      <style>
        {`
          .typing-indicator {
            display: flex;
            align-items: center;
            padding: 4px 0;
          }

          .typing-indicator span {
            height: 6px;
            width: 6px;
            margin: 0 2px;
            background-color: #8a2be2;
            border-radius: 50%;
            display: inline-block;
            animation: typing 1.4s infinite ease-in-out both;
            opacity: 0.6;
          }

          .typing-indicator span:nth-child(1) {
            animation-delay: 0s;
          }

          .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
          }

          .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes typing {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.5);
            }
            100% {
              transform: scale(1);
            }
          }

          /* Custom styling for input and button */
          .form-control {
            border-color: #e5e5e6;
            border-radius: 8px;
            padding: 10px 16px;
            font-size: 14px;
            transition: all 0.2s ease;
          }

          .form-control:focus {
            border-color: #8a2be2;
            outline: none;
          }

          .btn-primary {
            background-color: #8a2be2;
            border-color: #8a2be2;
            font-weight: 500;
            border-radius: 8px;
            padding: 8px 16px;
            transition: all 0.2s ease;
          }

          .btn-primary:hover, .btn-primary:focus {
            background-color: #7823c7;
            border-color: #7823c7;
          }

          code {
            background-color: rgba(138, 43, 226, 0.05);
            padding: 3px 6px;
            border-radius: 4px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 13px;
            color: #6b21a8;
            border: 1px solid rgba(138, 43, 226, 0.1);
          }

          pre {
            background-color: #f9fafb;
            padding: 12px 16px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 12px 0;
            border: 1px solid #e5e5e6;
          }

          pre code {
            background-color: transparent;
            padding: 0;
            color: #343541;
            border: none;
            font-size: 12px;
            line-height: 1.6;
          }

          a {
            color: #8a2be2;
            text-decoration: underline;
            transition: color 0.2s ease;
          }

          a:hover {
            color: #7823c7;
          }

          ul {
            padding-left: 20px;
            margin: 12px 0;
          }

          li {
            margin-bottom: 6px;
          }

          p {
            margin: 0 0 12px 0;
            line-height: 1.6;
          }

          /* Add subtle animations */
          .message-enter {
            opacity: 0;
            transform: translateY(10px);
          }

          .message-enter-active {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 300ms, transform 300ms;
          }
        `}
      </style>
    </>
  );
}
