import api from '../api/api.service';
import axios from 'axios';

export async function listProjects(orgId) {
  try {
    const response = await api.get(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/my-projects/`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function createProject(orgId, projectName, projectDescription) {
  try {
    const response = await api.post(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/my-projects`,
      { name: projectName, description: projectDescription },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateProject(
  orgId,
  projectId,
  projectName,
  projectDescription,
) {
  try {
    const response = await api.put(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/my-projects/${projectId}`,
      { name: projectName, description: projectDescription },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteProject(orgId, projectId) {
  try {
    await api.delete(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/my-projects/${projectId}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicProject(orgId, projectId) {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${projectId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
