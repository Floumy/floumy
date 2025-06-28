export const createChatStream = (message) => {
  return new EventSource(
    `${process.env.REACT_APP_API_URL}/ai/chat/stream?message=${message}`,
    {
      withCredentials: true,
    },
  );
};
