import api from "../api/api.service";
import { isAuthenticated } from "../auth/auth.service";

export async function addFeatureRequest(orgId, productId, featureRequest) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/feature-requests`, featureRequest);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listFeatureRequests(orgId, productId, page = 1, limit = 10) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/feature-requests?page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getFeatureRequest(orgId, productId, featureRequestId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/feature-requests/${featureRequestId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeatureRequest(orgId, productId, featureRequestId, featureRequest) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/feature-requests/${featureRequestId}`, featureRequest);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteFeatureRequest(orgId, productId, featureRequestId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/feature-requests/${featureRequestId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function upvoteFeatureRequest(orgId, productId, featureRequestId) {
  if (!await isAuthenticated()) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${productId}/feature-requests`;
  }

  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/feature-requests/${featureRequestId}/upvote`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function downvoteFeatureRequest(orgId, productId, featureRequestId) {
  if (!await isAuthenticated()) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${productId}/feature-requests`;
  }

  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/feature-requests/${featureRequestId}/downvote`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listCurrentUserFeatureRequestVotes(orgId, productId) {
  if (!await isAuthenticated()) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${productId}/feature-requests`;
  }

  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/feature-requests/my-votes`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addFeatureRequestComment(orgId, productId, featureRequestId, comment) {
  if (!await isAuthenticated()) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${productId}/feature-requests`;
  }

  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/feature-requests/${featureRequestId}/comments`, {
      content: comment
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeatureRequestComment(orgId, productId, featureRequestId, commentId, comment) {
  if (!await isAuthenticated()) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${productId}/feature-requests`;
  }

  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/feature-requests/${featureRequestId}/comments/${commentId}`, {
      content: comment
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteFeatureRequestComment(orgId, productId, featureRequestId, commentId) {
  if (!await isAuthenticated()) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/org/${orgId}/feature-requests`;
  }

  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/feature-requests/${featureRequestId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function searchFeatureRequests(orgId, productId, searchText, page = 1, limit = 10) {
  if (!await isAuthenticated()) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${productId}/feature-requests`;
  }

  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/feature-requests/search?q=${searchText}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}