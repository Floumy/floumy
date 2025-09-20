import api from '../api/api.service';
import axios from 'axios';
import { apiUrl } from '../../config';

export async function listProjects(orgId) {
  try {
    const response = await api.get(`${apiUrl}/orgs/${orgId}/my-projects/`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function createProject(orgId, projectName, projectDescription) {
  try {
    const response = await api.post(`${apiUrl}/orgs/${orgId}/my-projects`, {
      name: projectName,
      description: projectDescription,
    });
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
      `${apiUrl}/orgs/${orgId}/my-projects/${projectId}`,
      { name: projectName, description: projectDescription },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteProject(orgId, projectId) {
  try {
    await api.delete(`${apiUrl}/orgs/${orgId}/my-projects/${projectId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicProject(orgId, projectId) {
  try {
    const response = await axios.get(
      `${apiUrl}/public/orgs/${orgId}/projects/${projectId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
