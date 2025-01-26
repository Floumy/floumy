import api from '../api/api.service';

export async function getIsGithubConnected(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/projects/${projectId}/is-connected`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getGithubUrl(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/projects/${projectId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getGithubRepos(orgId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/repos`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateProjectGithubRepo(orgId, projectId, repoId) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/projects/${projectId}/github/repo`, { id: repoId });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getOpenPullRequests(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/projects/${projectId}/github/prs`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}