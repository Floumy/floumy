import api from '../api/api.service';

export async function generateKeyResults(objective) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/ai/key-results?objective=${objective}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function generateInitiativesForOKR(objective, keyResult) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/ai/okrs-initiatives?objective=${objective}&keyResult=${keyResult}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function generateInitiativesForFeatureRequest(featureRequest, featureRequestDescription) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/ai/feature-requests-initiatives?featureRequest=${featureRequest}&description=${featureRequestDescription}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}