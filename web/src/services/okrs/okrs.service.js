import api from "../api/api.service";
import axios from "axios";

export async function addOKR(orgId, projectId, okr) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/okrs`, okr);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listOKRs(orgId, projectId, timeline) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/okrs/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listPublicObjectives(orgId, projectId, timeline) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${projectId}/okrs/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listKeyResults(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/okrs/key-results`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getOKR(orgId, projectId, id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/okrs/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicOKR(orgId, projectId, okrId) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${projectId}/okrs/${okrId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteOKR(orgId, projectId, id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/okrs/${id}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateObjective(orgId, projectId, id, objectiveData) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/okrs/objective/${id}`, objectiveData);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateKeyResult(orgId, projectId, objectiveId, keyResultId, keyResultData) {
  try {
    return await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/okrs/${objectiveId}/key-results/${keyResultId}`, keyResultData);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteKeyResult(orgId, projectId, objectiveId, keyResultId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/okrs/${objectiveId}/key-results/${keyResultId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addKeyResult(orgId, projectId, objectiveId, keyResult) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/okrs/${objectiveId}/key-results`, keyResult);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getKeyResult(orgId, projectId, objectiveId, keyResultId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/okrs/${objectiveId}/key-results/${keyResultId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicKeyResult(orgId, projectId, objectiveId, keyResultId) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${projectId}/okrs/${objectiveId}/key-results/${keyResultId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addKeyResultComment(orgId, projectId, objectiveId, keyResultId, content) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/okrs/key-results/${keyResultId}/comments`, { content });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateKeyResultComment(orgId, projectId, objectiveId, keyResultId, commentId, content) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/okrs/key-results/${keyResultId}/comments/${commentId}`, { content });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteKeyResultComment(orgId, projectId, objectiveId, keyResultId, commentId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/okrs/key-results/${keyResultId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addObjectiveComment(orgId, projectId, objectiveId, comment) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/okrs/${objectiveId}/comments`, {content: comment.content, mentions: comment.mentions});
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateObjectiveComment(orgId, projectId, objectiveId, commentId, comment) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/okrs/${objectiveId}/comments/${commentId}`, { content: comment.content, mentions: comment.mentions });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteObjectiveComment(orgId, projectId, objectiveId, commentId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/okrs/${objectiveId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}