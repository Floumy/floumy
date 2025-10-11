import { apiUrl } from '../../config';
import api from '../api/api.service';

export const createChatStream = (sessionId, message, projectId) => {
  let url = `${apiUrl}/ai/chat/stream/${sessionId}/?message=${encodeURIComponent(message)}`;
  if (projectId) {
    url += `&project=${projectId}`;
  }

  return new EventSource(url, {
    withCredentials: true,
  });
};

export async function listHistorySessions(projectId) {
  try {
    const response = await api.get(
      `${apiUrl}/ai/chat/history/sessions/projects/${projectId}/`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listHistorySessionMessages(sessionId) {
  try {
    const response = await api.get(
      `${apiUrl}/ai/chat/history/sessions/${sessionId}/messages`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
