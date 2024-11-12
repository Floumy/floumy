import api from "../api/api.service";
import { isAuthenticated } from "../auth/auth.service";

export async function addFeatureRequest(orgId, featureRequest) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/feature-requests`, featureRequest);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listFeatureRequests(orgId, page = 1, limit = 10) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/feature-requests?page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getFeatureRequest(orgId, featureRequestId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/feature-requests/${featureRequestId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeatureRequest(orgId, featureRequestId, featureRequest) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/feature-requests/${featureRequestId}`, featureRequest);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteFeatureRequest(orgId, featureRequestId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/feature-requests/${featureRequestId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function upvoteFeatureRequest(orgId, featureRequestId) {
  if (!await isAuthenticated()) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/org/${orgId}/feature-requests`;
  }

  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/feature-requests/${featureRequestId}/upvote`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function downvoteFeatureRequest(orgId, featureRequestId) {
  if (!await isAuthenticated()) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/org/${orgId}/feature-requests`;
  }

  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/feature-requests/${featureRequestId}/downvote`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listCurrentUserFeatureRequestVotes(orgId) {
  if (!await isAuthenticated()) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/org/${orgId}/feature-requests`;
  }

  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/feature-requests/my-votes`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addFeatureRequestComment(orgId, featureRequestId, comment) {
  if (!await isAuthenticated()) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/org/${orgId}/feature-requests`;
  }

  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/feature-requests/${featureRequestId}/comments`, {
      content: comment
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeatureRequestComment(orgId, featureRequestId, commentId, comment) {
  if (!await isAuthenticated()) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/org/${orgId}/feature-requests`;
  }

  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/feature-requests/${featureRequestId}/comments/${commentId}`, {
      content: comment
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteFeatureRequestComment(orgId, featureRequestId, commentId) {
  if (!await isAuthenticated()) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/org/${orgId}/feature-requests`;
  }

  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/feature-requests/${featureRequestId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function searchFeatureRequests(orgId, searchText, page = 1, limit = 10) {
  if (!await isAuthenticated()) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/org/${orgId}/feature-requests`;
  }

  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/feature-requests/search?q=${searchText}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}