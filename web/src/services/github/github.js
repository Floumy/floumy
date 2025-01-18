import api from '../api/api.service';

export async function getGithubUrl(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/projects/${projectId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}