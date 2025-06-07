import api, { logoutUser } from '../api/api.service';

export async function getCurrentUser() {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/users/me`);
    return response.data;
  } catch (e) {
    throw new Error(e.response.data.message);
  }
}

export async function patchCurrentUser(data) {
  try {
    const response = await api.patch(`${process.env.REACT_APP_API_URL}/users/me`, data);
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
  localStorage.setItem("currentUserName", currentUser.name);
  localStorage.setItem("currentUserId", currentUser.id);
  if (currentUser.orgId !== null && currentUser.orgId !== undefined) {
    localStorage.setItem("currentUserOrgId", currentUser.orgId);
  }
}

export async function deactivateUser(userId) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/users/${userId}/deactivate`);
  } catch (e) {
    throw new Error(e.response.data.message);
  }
}

export async function getUsersByOrgId(orgId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/users`);
    return response.data;
  } catch (e) {
    throw new Error(e.response.data.message);
  }
}
