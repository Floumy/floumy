import api from '../api/api.service';

export async function generateKeyResults(objective) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/ai/key-results?objective=${objective}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}