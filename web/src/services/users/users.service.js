import api, { logoutUser } from '../api/api.service';
import { apiUrl } from '../../config';

export async function getCurrentUser() {
  try {
    const response = await api.get(`${apiUrl}/users/me`);
    return response.data;
  } catch (e) {
    throw new Error(e.response.data.message);
  }
}

export async function patchCurrentUser(data) {
  try {
    const response = await api.patch(`${apiUrl}/users/me`, data);
    const currentUser = response.data;
    setCurrentUserToLocalStorage(currentUser);
    return currentUser;
  } catch (e) {
    throw new Error(e.response.data.message);
  }
}

export async function setCurrentUser() {
  try {
    const currentUser = await getCurrentUser();

    setCurrentUserToLocalStorage(currentUser);
  } catch (e) {
    await logoutUser();
  }
}

export function setCurrentUserToLocalStorage(currentUser) {
  localStorage.setItem('currentUserName', currentUser.name);
  localStorage.setItem('currentUserId', currentUser.id);
  localStorage.setItem('currentUserRole', currentUser.role);
  if (currentUser.orgId !== null && currentUser.orgId !== undefined) {
    localStorage.setItem('currentUserOrgId', currentUser.orgId);
  }
}

export async function deactivateUser(userId) {
  try {
    await api.post(`${apiUrl}/users/${userId}/deactivate`);
  } catch (e) {
    throw new Error(e.response.data.message);
  }
}

export async function getUsersByOrgId(orgId) {
  try {
    const response = await api.get(`${apiUrl}/orgs/${orgId}/users`);
    return response.data;
  } catch (e) {
    throw new Error(e.response.data.message);
  }
}

export async function updateUserRole(userId, role) {
  try {
    const response = await api.put(`${apiUrl}/users/${userId}/role`, { role });
    return response.data;
  } catch (e) {
    throw new Error(e.response.data.message);
  }
}

export async function getCurrentUserMcpToken() {
  try {
    const response = await api.get(`${apiUrl}/users/me/mcp-token`);
    return response.data;
  } catch (e) {
    throw new Error(e.response.data.message);
  }
}

export async function refreshCurrentUserMcpToken() {
  try {
    const response = await api.post(`${apiUrl}/users/me/mcp-token/refresh`);
    return response.data;
  } catch (e) {
    throw new Error(e.response.data.message);
  }
}
