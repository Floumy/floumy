import api from '../api/api.service';

export async function getIsGitLabConnected(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/gitlab/auth/orgs/${orgId}/projects/${projectId}/is-connected`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listProjects(orgId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/gitlab/orgs/${orgId}/projects`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function setProject(orgId, projectId, gitlabProjectId) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/gitlab/orgs/${orgId}/projects/${projectId}`, { gitlabProjectId });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function setToken(orgId, token) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/gitlab/auth/orgs/${orgId}/token`, { token });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}