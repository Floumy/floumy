import api from "../api/api.service";
import axios from "axios";

export async function addOKR(okr) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/okrs`, okr);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listOKRs(timeline) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/okrs/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listPublicObjectives(orgId, timeline) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/okrs/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listKeyResults() {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/okrs/key-results`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getOKR(id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/okrs/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicOKR(orgId, okrId) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/okrs/${okrId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteOKR(id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/okrs/${id}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateObjective(id, objectiveData) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/okrs/objective/${id}`, objectiveData);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateKeyResult(objectiveId, keyResultId, keyResultData) {
  try {
    return await api.put(`${process.env.REACT_APP_API_URL}/okrs/${objectiveId}/key-results/${keyResultId}`, keyResultData);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteKeyResult(objectiveId, keyResultId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/okrs/${objectiveId}/key-results/${keyResultId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addKeyResult(objectiveId, keyResult) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/okrs/${objectiveId}/key-results`, keyResult);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getKeyResult(objectiveId, keyResultId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/okrs/${objectiveId}/key-results/${keyResultId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicKeyResult(orgId, objectiveId, keyResultId) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/okrs/${objectiveId}/key-results/${keyResultId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addKeyResultComment(objectiveId, keyResultId, content) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/okrs/key-results/${keyResultId}/comments`, { content });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateKeyResultComment(objectiveId, keyResultId, commentId, content) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/okrs/key-results/${keyResultId}/comments/${commentId}`, { content });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteKeyResultComment(objectiveId, keyResultId, commentId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/okrs/key-results/${keyResultId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addObjectiveComment(objectiveId, content) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/okrs/${objectiveId}/comments`, { content });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateObjectiveComment(objectiveId, commentId, content) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/okrs/${objectiveId}/comments/${commentId}`, { content });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteObjectiveComment(objectiveId, commentId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/okrs/${objectiveId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}