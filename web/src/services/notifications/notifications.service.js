import api from "../api/api.service";

export async function listNotifications(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/notifications`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function countUnreadNotifications(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/notifications/unread`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function markAsRead(orgId, projectId, notificationIds) {
  try {
    const response = await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/notifications/mark-as-read`, { notificationIds });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteNotification(orgId, projectId, notificationId) {
  try {
    const response = await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/notifications/${notificationId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteAllNotifications(orgId, projectId) {
  try {
    const response = await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/notifications`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}