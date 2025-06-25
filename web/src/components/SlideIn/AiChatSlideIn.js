import React, { useEffect, useRef, useState } from 'react';

// Import components
import ChatHeader from './components/ChatHeader';
import TabsSection from './components/TabsSection';
import ContextSection from './components/ContextSection';
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
  mockContexts,
  simulateTyping,
} from './components/utils';

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
  const [currentSessionId, setCurrentSessionId] = useState(
    Date.now().toString(),
  );
  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);

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

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // Only save completed messages (filter out streaming messages)
        const completedMessages = messages.filter((msg) => !msg.isStreaming);

        // Save current chat
        localStorage.setItem(
          CHAT_HISTORY_KEY,
          JSON.stringify(completedMessages),
        );

        // Update or add to chat sessions
        const firstUserMessage = completedMessages.find((msg) => msg.isUser);
        const firstAIMessage = completedMessages.find((msg) => !msg.isUser);

        const sessionTitle = firstUserMessage
          ? firstUserMessage.text.substring(0, 50) +
            (firstUserMessage.text.length > 50 ? '...' : '')
          : 'New conversation';

        const sessionPreview = firstAIMessage
          ? firstAIMessage.text.substring(0, 100) +
            (firstAIMessage.text.length > 100 ? '...' : '')
          : 'No response yet';

        const sessionDate = new Date();

        setChatSessions((prevSessions) => {
          const updatedSessions = [...prevSessions];
          const existingSessionIndex = updatedSessions.findIndex(
            (s) => s.id === currentSessionId,
          );

          const sessionData = {
            id: currentSessionId,
            title: sessionTitle,
            preview: sessionPreview,
            date: sessionDate,
            messages: completedMessages,
          };

          if (existingSessionIndex >= 0) {
            updatedSessions[existingSessionIndex] = sessionData;
          } else {
            updatedSessions.unshift(sessionData);
          }

          // Save to localStorage
          localStorage.setItem(
            CHAT_SESSIONS_KEY,
            JSON.stringify(updatedSessions),
          );

          return updatedSessions;
        });
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [messages, currentSessionId]);

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

  return (
    <>
      <ChatStyles />
      {isOpen && (
        <ChatContainer>
          <ChatHeader toggle={toggle} />
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
                currentStreamingMessage={currentStreamingMessage}
                isTyping={isTyping}
                messagesEndRef={messagesEndRef}
                handleRegenerateResponse={handleRegenerateResponse}
              />

              <ChatInput
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSendMessage={handleSendMessage}
                isTyping={isTyping}
                examplePrompts={examplePrompts}
                handleSelectPrompt={handleSelectPrompt}
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
