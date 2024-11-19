import api from "../api/api.service";
import axios from "axios";

export async function addOKR(orgId, productId, okr) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/okrs`, okr);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listOKRs(orgId, productId, timeline) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/okrs/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listPublicObjectives(orgId, productId, timeline) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/products/${productId}/okrs/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listKeyResults(orgId, productId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/okrs/key-results`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getOKR(orgId, productId, id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/okrs/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicOKR(orgId, productId, okrId) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/products/${productId}/okrs/${okrId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteOKR(orgId, productId, id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/okrs/${id}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateObjective(orgId, productId, id, objectiveData) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/okrs/objective/${id}`, objectiveData);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateKeyResult(orgId, productId, objectiveId, keyResultId, keyResultData) {
  try {
    return await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/okrs/${objectiveId}/key-results/${keyResultId}`, keyResultData);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteKeyResult(orgId, productId, objectiveId, keyResultId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/okrs/${objectiveId}/key-results/${keyResultId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addKeyResult(orgId, productId, objectiveId, keyResult) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/okrs/${objectiveId}/key-results`, keyResult);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getKeyResult(orgId, productId, objectiveId, keyResultId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/okrs/${objectiveId}/key-results/${keyResultId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicKeyResult(orgId, productId, objectiveId, keyResultId) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/products/${productId}/okrs/${objectiveId}/key-results/${keyResultId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addKeyResultComment(orgId, productId, objectiveId, keyResultId, content) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/okrs/key-results/${keyResultId}/comments`, { content });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateKeyResultComment(orgId, productId, objectiveId, keyResultId, commentId, content) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/okrs/key-results/${keyResultId}/comments/${commentId}`, { content });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteKeyResultComment(orgId, productId, objectiveId, keyResultId, commentId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/okrs/key-results/${keyResultId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addObjectiveComment(orgId, productId, objectiveId, content) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/okrs/${objectiveId}/comments`, { content });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateObjectiveComment(orgId, productId, objectiveId, commentId, content) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/okrs/${objectiveId}/comments/${commentId}`, { content });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteObjectiveComment(orgId, productId, objectiveId, commentId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/okrs/${objectiveId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}