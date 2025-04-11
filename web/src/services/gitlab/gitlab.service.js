import api from '../api/api.service';

export async function getIsGitLabConnected(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/gitlab/auth/orgs/${orgId}/projects/${projectId}/is-connected`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listMergeRequests(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/gitlab/merge-requests/orgs/${orgId}/projects/${projectId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listProjects(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/gitlab/projects/orgs/${orgId}/projects/${projectId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function setProject(orgId, projectId, gitlabProjectId) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/gitlab/projects/orgs/${orgId}/projects/${projectId}`, { project: gitlabProjectId });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function setToken(orgId, projectId, token) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/gitlab/auth/orgs/${orgId}/projects/${projectId}/token`, { token });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function disconnectProject(orgId, projectId) {
  try {
    const response = await api.delete(`${process.env.REACT_APP_API_URL}/gitlab/auth/orgs/${orgId}/projects/${projectId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}