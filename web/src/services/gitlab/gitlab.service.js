import api from '../api/api.service';
import { apiUrl } from '../../config';

export async function getIsGitLabConnected(orgId, projectId) {
  try {
    const response = await api.get(
      `${apiUrl}/gitlab/auth/orgs/${orgId}/projects/${projectId}/is-connected`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listMergeRequests(orgId, projectId) {
  try {
    const response = await api.get(
      `${apiUrl}/gitlab/merge-requests/orgs/${orgId}/projects/${projectId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listProjects(orgId, projectId) {
  try {
    const response = await api.get(
      `${apiUrl}/gitlab/projects/orgs/${orgId}/projects/${projectId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function setProject(orgId, projectId, gitlabProjectId) {
  try {
    const response = await api.put(
      `${apiUrl}/gitlab/projects/orgs/${orgId}/projects/${projectId}`,
      { project: gitlabProjectId },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function setToken(orgId, projectId, token) {
  try {
    const response = await api.put(
      `${apiUrl}/gitlab/auth/orgs/${orgId}/projects/${projectId}/token`,
      { token },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function disconnectProject(orgId, projectId) {
  try {
    const response = await api.delete(
      `${apiUrl}/gitlab/auth/orgs/${orgId}/projects/${projectId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
export async function getMergeRequestsCycleTime(
  orgId,
  projectId,
  timeframeInDays,
) {
  try {
    const response = await api.get(
      `${apiUrl}/gitlab/merge-requests/orgs/${orgId}/projects/${projectId}/mrs/cycle-time`,
      {
        params: {
          timeframeInDays,
        },
      },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
export async function getMergeRequestsMergeTime(
  orgId,
  projectId,
  timeframeInDays,
) {
  try {
    const response = await api.get(
      `${apiUrl}/gitlab/merge-requests/orgs/${orgId}/projects/${projectId}/mrs/merge-time`,
      {
        params: {
          timeframeInDays,
        },
      },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getMergeRequestsFirstReviewTime(
  orgId,
  projectId,
  timeframeInDays,
) {
  try {
    const response = await api.get(
      `${apiUrl}/gitlab/merge-requests/orgs/${orgId}/projects/${projectId}/mrs/first-review-time`,
      {
        params: {
          timeframeInDays,
        },
      },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
