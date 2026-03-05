import api from '../api/api.service';
import { isAuthenticated } from '../auth/auth.service';
import { apiUrl } from '../../config';

export async function addRequest(orgId, projectId, request) {
  try {
    const response = await api.post(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/requests`,
      request,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listRequests(orgId, projectId, page = 1, limit = 10) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/requests?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listPublicRequests(
  orgId,
  projectId,
  page = 1,
  limit = 10,
) {
  try {
    const response = await api.get(
      `${apiUrl}/public/orgs/${orgId}/projects/${projectId}/requests?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getRequest(orgId, projectId, requestId) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/requests/${requestId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicRequest(orgId, projectId, requestId) {
  try {
    const response = await api.get(
      `${apiUrl}/public/orgs/${orgId}/projects/${projectId}/requests/${requestId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateRequest(orgId, projectId, requestId, request) {
  try {
    await api.put(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/requests/${requestId}`,
      request,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteRequest(orgId, projectId, requestId) {
  try {
    await api.delete(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/requests/${requestId}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function upvoteRequest(orgId, projectId, requestId) {
  if (!(await isAuthenticated())) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${projectId}/requests`;
  }

  try {
    await api.post(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/requests/${requestId}/upvote`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function downvoteRequest(orgId, projectId, requestId) {
  if (!(await isAuthenticated())) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${projectId}/requests`;
  }

  try {
    await api.post(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/requests/${requestId}/downvote`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listCurrentUserRequestVotes(orgId, projectId) {
  if (!(await isAuthenticated())) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${projectId}/requests`;
  }

  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/requests/my-votes`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addRequestComment(orgId, projectId, requestId, comment) {
  if (!(await isAuthenticated())) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${projectId}/requests`;
  }

  try {
    const response = await api.post(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/requests/${requestId}/comments`,
      {
        content: comment.content,
        mentions: comment.mentions,
      },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateRequestComment(
  orgId,
  projectId,
  requestId,
  commentId,
  comment,
) {
  if (!(await isAuthenticated())) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${projectId}/requests`;
  }

  try {
    const response = await api.put(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/requests/${requestId}/comments/${commentId}`,
      {
        content: comment.content,
        mentions: comment.mentions,
      },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteRequestComment(
  orgId,
  projectId,
  requestId,
  commentId,
) {
  if (!(await isAuthenticated())) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/org/${orgId}/requests`;
  }

  try {
    await api.delete(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/requests/${requestId}/comments/${commentId}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function searchRequests(
  orgId,
  projectId,
  searchText,
  page = 1,
  limit = 10,
) {
  if (!(await isAuthenticated())) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${projectId}/requests`;
  }

  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/requests/search?q=${searchText}&page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function searchPublicRequests(
  orgId,
  projectId,
  searchText,
  page = 1,
  limit = 10,
) {
  try {
    const response = await api.get(
      `${apiUrl}/public/orgs/${orgId}/projects/${projectId}/requests/search?q=${searchText}&page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
