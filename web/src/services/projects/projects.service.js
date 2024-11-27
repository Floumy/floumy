import api from '../api/api.service';

export async function listProjects(orgId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/my-projects/`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function createProject(orgId, projectName) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/my-projects`, { name: projectName });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}