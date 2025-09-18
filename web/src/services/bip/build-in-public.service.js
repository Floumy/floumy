import api from '../api/api.service';
import axios from 'axios';
import { apiUrl } from '../../config';

export async function updateBuildInPublicSettings(orgId, projectId, settings) {
  try {
    await api.put(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/build-in-public/settings`,
      settings,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getBuildInPublicSettings(orgId, projectId) {
  try {
    const response = await axios.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/build-in-public/settings`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
