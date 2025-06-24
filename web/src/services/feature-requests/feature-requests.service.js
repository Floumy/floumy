import api from '../api/api.service';
import { isAuthenticated } from '../auth/auth.service';

export async function addFeatureRequest(orgId, projectId, featureRequest) {
  try {
    const response = await api.post(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/feature-requests`,
      featureRequest,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listFeatureRequests(
  orgId,
  projectId,
  page = 1,
  limit = 10,
) {
  try {
    const response = await api.get(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/feature-requests?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getFeatureRequest(orgId, projectId, featureRequestId) {
  try {
    const response = await api.get(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/feature-requests/${featureRequestId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeatureRequest(
  orgId,
  projectId,
  featureRequestId,
  featureRequest,
) {
  try {
    await api.put(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/feature-requests/${featureRequestId}`,
      featureRequest,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteFeatureRequest(orgId, projectId, featureRequestId) {
  try {
    await api.delete(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/feature-requests/${featureRequestId}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function upvoteFeatureRequest(orgId, projectId, featureRequestId) {
  if (!(await isAuthenticated())) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${projectId}/feature-requests`;
  }

  try {
    await api.post(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/feature-requests/${featureRequestId}/upvote`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function downvoteFeatureRequest(
  orgId,
  projectId,
  featureRequestId,
) {
  if (!(await isAuthenticated())) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${projectId}/feature-requests`;
  }

  try {
    await api.post(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/feature-requests/${featureRequestId}/downvote`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listCurrentUserFeatureRequestVotes(orgId, projectId) {
  if (!(await isAuthenticated())) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${projectId}/feature-requests`;
  }

  try {
    const response = await api.get(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/feature-requests/my-votes`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addFeatureRequestComment(
  orgId,
  projectId,
  featureRequestId,
  comment,
) {
  if (!(await isAuthenticated())) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${projectId}/feature-requests`;
  }

  try {
    const response = await api.post(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/feature-requests/${featureRequestId}/comments`,
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

export async function updateFeatureRequestComment(
  orgId,
  projectId,
  featureRequestId,
  commentId,
  comment,
) {
  if (!(await isAuthenticated())) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${projectId}/feature-requests`;
  }

  try {
    const response = await api.put(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/feature-requests/${featureRequestId}/comments/${commentId}`,
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

export async function deleteFeatureRequestComment(
  orgId,
  projectId,
  featureRequestId,
  commentId,
) {
  if (!(await isAuthenticated())) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/org/${orgId}/feature-requests`;
  }

  try {
    await api.delete(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/feature-requests/${featureRequestId}/comments/${commentId}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function searchFeatureRequests(
  orgId,
  projectId,
  searchText,
  page = 1,
  limit = 10,
) {
  if (!(await isAuthenticated())) {
    window.location.href = `/auth/sign-in?redirectTo=/admin/orgs/${orgId}/projects/${projectId}/feature-requests`;
  }

  try {
    const response = await api.get(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/feature-requests/search?q=${searchText}&page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
