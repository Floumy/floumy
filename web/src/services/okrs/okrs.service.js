import api from '../api/api.service';
import axios from 'axios';
import { apiUrl } from '../../config';

export async function addOKR(orgId, projectId, okr) {
  try {
    const response = await api.post(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/okrs`,
      okr,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listOKRs(orgId, projectId, timeline) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/okrs/timeline/${timeline}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listPublicObjectives(orgId, projectId, timeline) {
  try {
    const response = await axios.get(
      `${apiUrl}/public/orgs/${orgId}/projects/${projectId}/okrs/timeline/${timeline}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listKeyResults(orgId, projectId) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/key-results`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getOKR(orgId, projectId, id) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/okrs/${id}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listOrgObjectives(orgId, timeline) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/okrs/timeline/${timeline}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicOKR(orgId, projectId, okrId) {
  try {
    const response = await axios.get(
      `${apiUrl}/public/orgs/${orgId}/projects/${projectId}/okrs/${okrId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteOKR(orgId, projectId, id) {
  try {
    await api.delete(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/okrs/${id}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateObjective(orgId, projectId, id, objectiveData) {
  try {
    const response = await api.put(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/okrs/objective/${id}`,
      objectiveData,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateKeyResult(
  orgId,
  projectId,
  keyResultId,
  keyResultData,
) {
  try {
    const response = await api.put(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/key-results/${keyResultId}`,
      keyResultData,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteKeyResult(orgId, projectId, keyResultId) {
  try {
    await api.delete(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/key-results/${keyResultId}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addKeyResult(orgId, projectId, objectiveId, keyResult) {
  try {
    const response = await api.post(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/okrs/${objectiveId}/key-results`,
      keyResult,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getKeyResult(orgId, projectId, keyResultId) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/key-results/${keyResultId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicKeyResult(orgId, projectId, keyResultId) {
  try {
    const response = await axios.get(
      `${apiUrl}/public/orgs/${orgId}/projects/${projectId}/key-results/${keyResultId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addKeyResultComment(
  orgId,
  projectId,
  keyResultId,
  comment,
) {
  try {
    const response = await api.post(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/key-results/${keyResultId}/comments`,
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
  projectId,
  keyResultId,
  commentId,
  comment,
) {
  try {
    const response = await api.put(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/key-results/${keyResultId}/comments/${commentId}`,
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

export async function deleteKeyResultComment(
  orgId,
  projectId,
  keyResultId,
  commentId,
) {
  try {
    await api.delete(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/key-results/${keyResultId}/comments/${commentId}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addObjectiveComment(
  orgId,
  projectId,
  objectiveId,
  comment,
) {
  try {
    const response = await api.post(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/okrs/${objectiveId}/comments`,
      { content: comment.content, mentions: comment.mentions },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateObjectiveComment(
  orgId,
  projectId,
  objectiveId,
  commentId,
  comment,
) {
  try {
    const response = await api.put(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/okrs/${objectiveId}/comments/${commentId}`,
      { content: comment.content, mentions: comment.mentions },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteObjectiveComment(
  orgId,
  projectId,
  objectiveId,
  commentId,
) {
  try {
    await api.delete(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/okrs/${objectiveId}/comments/${commentId}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getOkrStats(orgId, projectId, timeline) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/okrs-stats/timeline/${timeline}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicOkrStats(orgId, projectId, timeline) {
  try {
    const response = await axios.get(
      `${apiUrl}/public/orgs/${orgId}/projects/${projectId}/okrs-stats/timeline/${timeline}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getUser(orgId, userId) {
  try {
    const response = await api.get(`${apiUrl}/orgs/${orgId}/users/${userId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
