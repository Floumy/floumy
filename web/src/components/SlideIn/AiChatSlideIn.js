import React, { useCallback, useEffect, useRef, useState } from 'react';

// Import components
import ChatHeader from './components/ChatHeader';
import ChatBody from './components/ChatBody';
import ChatInput from './components/ChatInput';
import HistorySection from './components/HistorySection';

// Import styled components
import { ChatContainer, ChatStyles } from './components/StyledComponents';

// Import utilities and mock data
import { examplePrompts, initialMessages } from './components/utils';
import { useChatStream } from '../../hooks/useChatStream';
import ContextSection from './components/ContextSection';
import { useProjects } from '../../contexts/ProjectsContext';
import TabsSection from './components/TabsSection';
import { toast } from 'react-toastify';
import { listHistory } from '../../services/ai/chat.service';

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
  // const [inputMessage, setInputMessage] = useState('');
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

    const loadHistory = async () => {
      const history = await listHistory(currentProjectId);
      setChatSessions(history);
    };

    loadHistory().catch(() => {
      toast.error('Error loading chat history');
    });
  }, []);

  // Function to load a specific chat session
  const loadChatSession = (sessionId) => {
    const session = chatSessions.find((s) => s.sessionId === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(
        session.messages.map((msg) => ({
          text: msg,
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
    // setInputMessage(prompt);
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
          <TabsSection activeTab={activeTab} setActiveTab={setActiveTab} />

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
