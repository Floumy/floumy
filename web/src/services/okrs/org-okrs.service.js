import api from '../api/api.service';
import axios from 'axios';

export async function addOKR(orgId, okr) {
  try {
    const response = await api.post(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/okrs`,
      okr,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listOKRs(orgId, timeline) {
  try {
    const response = await api.get(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/okrs/timeline/${timeline}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listPublicObjectives(orgId, timeline) {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/okrs/timeline/${timeline}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listKeyResults(orgId) {
  try {
    const response = await api.get(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/key-results`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getOKR(orgId, id) {
  try {
    const response = await api.get(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/okrs/${id}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicOKR(orgId, okrId) {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/okrs/${okrId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteOKR(orgId, id) {
  try {
    await api.delete(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/okrs/${id}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateObjective(orgId, id, objectiveData) {
  try {
    const response = await api.put(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/okrs/objective/${id}`,
      objectiveData,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateKeyResult(orgId, keyResultId, keyResultData) {
  try {
    const response = await api.put(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/key-results/${keyResultId}`,
      keyResultData,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteKeyResult(orgId, keyResultId) {
  try {
    await api.delete(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/key-results/${keyResultId}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addKeyResult(orgId, objectiveId, keyResult) {
  try {
    const response = await api.post(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/okrs/${objectiveId}/key-results`,
      keyResult,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getKeyResult(orgId, keyResultId) {
  try {
    const response = await api.get(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/key-results/${keyResultId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicKeyResult(orgId, keyResultId) {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/key-results/${keyResultId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addKeyResultComment(orgId, keyResultId, comment) {
  try {
    const response = await api.post(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/key-results/${keyResultId}/comments`,
      {
        content: comment.content,
        mentions: comment.mentions,
      },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateKeyResultComment(
  orgId,
  keyResultId,
  commentId,
  comment,
) {
  try {
    const response = await api.put(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/key-results/${keyResultId}/comments/${commentId}`,
      {
        content: comment.content,
        mentions: comment.mentions,
      },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteKeyResultComment(orgId, keyResultId, commentId) {
  try {
    await api.delete(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/key-results/${keyResultId}/comments/${commentId}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addObjectiveComment(orgId, objectiveId, comment) {
  try {
    const response = await api.post(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/okrs/${objectiveId}/comments`,
      { content: comment.content, mentions: comment.mentions },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateObjectiveComment(
  orgId,
  objectiveId,
  commentId,
  comment,
) {
  try {
    const response = await api.put(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/okrs/${objectiveId}/comments/${commentId}`,
      { content: comment.content, mentions: comment.mentions },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteObjectiveComment(orgId, objectiveId, commentId) {
  try {
    await api.delete(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/okrs/${objectiveId}/comments/${commentId}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getOkrStats(orgId, timeline) {
  try {
    const response = await api.get(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/okrs-stats/timeline/${timeline}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
