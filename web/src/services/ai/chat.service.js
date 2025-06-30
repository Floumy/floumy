export const createChatStream = (sessionId, message) => {
  return new EventSource(
    `${process.env.REACT_APP_API_URL}/ai/chat/stream/${sessionId}/?message=${encodeURIComponent(message)}`,
    {
      withCredentials: true,
    },
  );
};
