import api from '../api/api.service';

export async function getGithubUrl() {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/github/auth`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}