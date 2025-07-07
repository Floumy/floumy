import React, { useCallback, useEffect, useRef, useState } from 'react';

// Import components
import ChatHeader from './components/ChatHeader';
import ChatBody from './components/ChatBody';
import ChatInput from './components/ChatInput';
import HistorySection from './components/HistorySection';

// Import styled components
import { ChatContainer, ChatStyles } from './components/StyledComponents';

// Import utilities and mock data
import {
  CHAT_HISTORY_KEY,
  CHAT_SESSIONS_KEY,
  examplePrompts,
  initialMessages,
} from './components/utils';
import { useChatStream } from '../../hooks/useChatStream';
import ContextSection from './components/ContextSection';
import { useProjects } from '../../contexts/ProjectsContext';

export default function AiChatSlideIn({
  isOpen: initialIsOpen,
  toggle: externalToggle,
}) {
  const { currentProjectId } = useProjects();

  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [inputValue, setInputValue] = useState('');
  const [contextType, setContextType] = useState('project');
  const [selectedContext, setSelectedContext] = useState(currentProjectId);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'history'
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(crypto.randomUUID());

  const messagesEndRef = useRef(null);
  const [inputMessage, setInputMessage] = useState('');
  const {
    messages,
    setMessages,
    isLoading,
    // error,
    sendMessage,
    // clearMessages,
    // closeConnection,
  } = useChatStream();

  // Load chat sessions and current chat history from localStorage on mount
  useEffect(() => {
    setMessages(initialMessages);

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
        const messagesWithDates = parsedHistory.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, []);

  // Function to load a specific chat session
  const loadChatSession = (sessionId) => {
    const session = chatSessions.find((s) => s.id === sessionId);
    if (session) {
      setMessages(
        session.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      );
      setActiveTab('chat');
    }
  };

  // Function to start a new chat session
  const startNewSession = () => {
    setMessages(initialMessages);
    setCurrentSessionId(crypto.randomUUID());
    setActiveTab('chat');
  };

  // Handle selecting an example prompt
  const handleSelectPrompt = (prompt) => {
    setInputValue(prompt);
    setInputMessage(prompt);
    sendMessage(currentSessionId, prompt, selectedContext);
    setInputValue('');
  };

  // Handle context type change
  const handleContextTypeChange = (e) => {
    const newType = e.target.value;
    setContextType(newType);
    setSelectedContext(currentProjectId);
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

  const handleSubmit = useCallback(() => {
    if (inputValue.trim()) {
      sendMessage(currentSessionId, inputValue, selectedContext);
      setInputValue('');
    }
  }, [inputValue, sendMessage]);

  return (
    <>
      <ChatStyles />
      {isOpen && (
        <ChatContainer>
          <ChatHeader toggle={toggle} startNewSession={startNewSession} />
          {/*<TabsSection activeTab={activeTab} setActiveTab={setActiveTab} />*/}

          {activeTab === 'chat' ? (
            <>
              <ContextSection
                contextType={contextType}
                selectedContext={selectedContext}
                handleContextTypeChange={handleContextTypeChange}
              />

              <ChatBody
                messages={messages}
                isTyping={isLoading}
                messagesEndRef={messagesEndRef}
              />

              <ChatInput
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSendMessage={handleSubmit}
                isTyping={isLoading}
                examplePrompts={examplePrompts}
                handleSelectPrompt={handleSelectPrompt}
                showExamplePrompts={messages?.length === 1}
              />
            </>
          ) : (
            <HistorySection
              chatSessions={chatSessions}
              loadChatSession={loadChatSession}
              startNewSession={startNewSession}
            />
          )}
        </ChatContainer>
      )}
    </>
  );
}
