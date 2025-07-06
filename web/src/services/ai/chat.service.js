export const createChatStream = (sessionId, message, projectId) => {
  let url = `${process.env.REACT_APP_API_URL}/ai/chat/stream/${sessionId}/?message=${encodeURIComponent(message)}`;
  if (projectId) {
    url += `&project=${projectId}`;
  }

  return new EventSource(url, {
    withCredentials: true,
  });
};
