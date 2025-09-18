import api from '../api/api.service';
import { apiUrl } from '../../config';

export async function listNotifications() {
  try {
    const response = await api.get(`${apiUrl}/notifications`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function countUnreadNotifications() {
  try {
    const response = await api.get(`${apiUrl}/notifications/unread`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function markAsRead(notificationIds) {
  try {
    const response = await api.patch(`${apiUrl}/notifications/mark-as-read`, {
      notificationIds,
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteNotification(notificationId) {
  try {
    const response = await api.delete(
      `${apiUrl}/notifications/${notificationId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteAllNotifications() {
  try {
    const response = await api.delete(`${apiUrl}/notifications`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
