import api from '../api/api.service';

export async function getIsGithubConnected(orgId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/is-connected`);
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

export async function getRepos(orgId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/repos`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}