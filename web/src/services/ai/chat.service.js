import { apiUrl } from '../../config';
export const createChatStream = (sessionId, message, projectId) => {
  let url = `${apiUrl}/ai/chat/stream/${sessionId}/?message=${encodeURIComponent(message)}`;
  if (projectId) {
    url += `&project=${projectId}`;
  }

  return new EventSource(url, {
    withCredentials: true,
  });
};
