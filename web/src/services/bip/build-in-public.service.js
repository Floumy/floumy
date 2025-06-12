import api from '../api/api.service';
import axios from 'axios';

export async function updateBuildInPublicSettings(orgId, projectId, settings) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/build-in-public/settings`, settings);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getBuildInPublicSettings(orgId, projectId) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/build-in-public/settings`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
