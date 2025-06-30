import { useCallback, useEffect, useRef, useState } from 'react';
import { createChatStream } from '../services/ai/chat.service';

export const useChatStream = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const eventSourceRef = useRef(null);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const sendMessage = useCallback(
    (sessionId, message) => {
      setError(null);
      setIsLoading(true);

      cleanup();

      // Add the user's message first
      const userMessageId = crypto.randomUUID();
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: userMessageId,
          text: message,
          isUser: true,
        },
      ]);

      try {
        const eventSource = createChatStream(sessionId, message);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          const eventData = JSON.parse(event.data);
          setMessages((prevMessages) => {
            const messageIndex = prevMessages.findIndex(
              (m) => m.id === eventData.id,
            );
            if (messageIndex !== -1) {
              // Update existing message
              const updatedMessages = [...prevMessages];
              updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                text: updatedMessages[messageIndex].text + eventData.text,
              };
              return updatedMessages;
            } else {
              // Add new message
              return [
                ...prevMessages,
                {
                  id: eventData.id,
                  text: eventData.text,
                  isUser: eventData.isUser,
                },
              ];
            }
          });
        };

        eventSource.onerror = (error) => {
          setError(error);
          setIsLoading(false);
          cleanup();
        };

        eventSource.onopen = () => {
          setIsLoading(false);
        };
      } catch (error) {
        setError(error);
        setIsLoading(false);
      }
    },
    [cleanup],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    setMessages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    closeConnection: cleanup,
  };
};
