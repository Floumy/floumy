import api from '../api/api.service';

export async function listNotifications() {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/notifications`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function countUnreadNotifications() {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/notifications/unread`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function markAsRead(notificationIds) {
  try {
    const response = await api.patch(`${process.env.REACT_APP_API_URL}/notifications/mark-as-read`, { notificationIds });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteNotification(notificationId) {
  try {
    const response = await api.delete(`${process.env.REACT_APP_API_URL}/notifications/${notificationId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteAllNotifications() {
  try {
    const response = await api.delete(`${process.env.REACT_APP_API_URL}/notifications`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}