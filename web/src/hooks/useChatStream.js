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
  }, []);

  const sendMessage = useCallback(
    (message) => {
      setError(null);
      setIsLoading(true);

      cleanup();

      try {
        const eventSource = createChatStream(message);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          const messageIndex = messages.findIndex((m) => m.id === event.id);
          if (messageIndex !== -1) {
            setMessages((prevMessages) => [
              ...prevMessages.slice(0, messageIndex),
              {
                ...prevMessages[messageIndex],
                text: `${prevMessages[messageIndex].text}${event.data}`,
              },
            ]);
          } else {
            setMessages([
              {
                id: event.id,
                type: event.type,
                text: event.data,
              },
            ]);
          }
          console.log(messages);
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
