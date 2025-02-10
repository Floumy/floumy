import api from "../api/api.service";
import axios from "axios";

export async function addInitiative(orgId, projectId, initiative) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/initiatives`, initiative);

    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listInitiatives(orgId, projectId, page = 1, limit = 50) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/initiatives?page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listAllInitiatives(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/initiatives`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function searchInitiativesWithOptions(orgId, projectId, searchOptions, page = 1, limit = 50) {
  try {
    const params = new URLSearchParams();

    // Add basic search params
    if (searchOptions.text) {
      params.append('q', searchOptions.text);
    }

    // Add pagination
    if (page) {
      params.append('page', page.toString());
    }
    if (limit) {
      params.append('limit', limit.toString());
    }

    // Build filters object
    const filters = {
      status: searchOptions.status !== 'all' ? [searchOptions.status] : undefined,
      assigneeIds: searchOptions.assignee !== 'all' ? [searchOptions.assignee] : undefined,
      priority: searchOptions.priority !== 'all' ? [searchOptions.priority] : undefined,
      completedAt: (searchOptions.completedAt?.start || searchOptions.completedAt?.end) ? {
        start: searchOptions.completedAt.start || undefined,
        end: searchOptions.completedAt.end || undefined
      } : undefined
    };

    // Only add filters if there are any active ones
    if (Object.values(filters).some(v => v !== undefined)) {
      params.append('f', JSON.stringify(filters));
    }

    const url = `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/initiatives/search?${params.toString()}`;

    const response = await api.get(url);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getInitiative(orgId, projectId, id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/initiatives/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicInitiative(orgId, projectId, id) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${projectId}/initiatives/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateInitiative(orgId, projectId, id, initiative) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/initiatives/${id}`, initiative);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteInitiative(orgId, projectId, id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/initiatives/${id}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addMilestone(orgId, projectId, milestone) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/milestones`, milestone);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listMilestones(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/milestones/list`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listMilestonesWithInitiatives(orgId, projectId, timeline) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/milestones/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listPublicMilestonesWithInitiatives(orgId, projectId, timeline) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${projectId}/milestones/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listInitiativesWithoutMilestone(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/initiatives/without-milestone`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getMilestone(orgId, projectId, id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/milestones/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicMilestone(orgId, projectId, milestoneId) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${projectId}/milestones/${milestoneId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateMilestone(orgId, projectId, id, milestone) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/milestones/${id}`, milestone);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteMilestone(orgId, projectId, id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/milestones/${id}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateInitiativeMilestone(orgId, projectId, initiativeId, milestoneId) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/initiatives/${initiativeId}`, { milestone: milestoneId });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateInitiativeKeyResult(orgId, projectId, initiativeId, keyResultId) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/initiatives/${initiativeId}`, { keyResult: keyResultId });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateInitiativeStatus(orgId, projectId, initiativeId, status) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/initiatives/${initiativeId}`, { status });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateInitiativePriority(orgId, projectId, initiativeId, priority) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/initiatives/${initiativeId}`, { priority });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addInitiativeComment(orgId, projectId, initiativeId, comment) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/initiatives/${initiativeId}/comments`, {
      content: comment.content,
      mentions: comment.mentions
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteInitiativeComment(orgId, projectId, initiativeId, commentId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/initiatives/${initiativeId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateInitiativeComment(orgId, projectId, initiativeId, commentId, comment) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/initiatives/${initiativeId}/comments/${commentId}`, {
      content: comment.content,
      mentions: comment.mentions
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function changeAssignee(orgId, projectId, initiativeId, assigneeId) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/initiatives/${initiativeId}/assignee`, { assignee: assigneeId });
  } catch (e) {
    throw new Error(e.message);
  }
}