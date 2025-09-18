import api from '../api/api.service';
import { apiUrl } from '../../config';

export async function getOrg() {
  try {
    const response = await api.get(`${apiUrl}/orgs/current`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function patchCurrentOrg(data) {
  try {
    await api.patch(`${apiUrl}/orgs/current`, data);
  } catch (e) {
    throw new Error(e.response.data.message);
  }
}
