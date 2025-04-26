import api from '../api/api.service';

export async function getOrg() {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/current`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function patchCurrentOrg(data) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/current`, data);
  } catch (e) {
    throw new Error(e.response.data.message);
  }
}