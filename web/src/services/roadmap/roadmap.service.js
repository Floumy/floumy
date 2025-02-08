import api from "../api/api.service";
import axios from "axios";

export async function addFeature(orgId, projectId, feature) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/features`, feature);

    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listFeatures(orgId, projectId, page = 1, limit = 50) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/features?page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listAllFeatures(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/features`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function searchFeaturesWithOptions(orgId, projectId, searchOptions, page = 1, limit = 50) {
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

    const url = `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/features/search?${params.toString()}`;

    const response = await api.get(url);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getFeature(orgId, projectId, id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/features/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicFeature(orgId, projectId, id) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${projectId}/features/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeature(orgId, projectId, id, feature) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/features/${id}`, feature);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteFeature(orgId, projectId, id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/features/${id}`);
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

export async function listMilestonesWithFeatures(orgId, projectId, timeline) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/milestones/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listPublicMilestonesWithFeatures(orgId, projectId, timeline) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${projectId}/milestones/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listFeaturesWithoutMilestone(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/features/without-milestone`);
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

export async function updateFeatureMilestone(orgId, projectId, featureId, milestoneId) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/features/${featureId}`, { milestone: milestoneId });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeatureKeyResult(orgId, projectId, featureId, keyResultId) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/features/${featureId}`, { keyResult: keyResultId });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeatureStatus(orgId, projectId, featureId, status) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/features/${featureId}`, { status });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeaturePriority(orgId, projectId, featureId, priority) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/features/${featureId}`, { priority });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addFeatureComment(orgId, projectId, featureId, comment) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/features/${featureId}/comments`, {
      content: comment.content,
      mentions: comment.mentions
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteFeatureComment(orgId, projectId, featureId, commentId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/features/${featureId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeatureComment(orgId, projectId, featureId, commentId, comment) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/features/${featureId}/comments/${commentId}`, {
      content: comment.content,
      mentions: comment.mentions
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function changeAssignee(orgId, projectId, featureId, assigneeId) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/features/${featureId}/assignee`, { assignee: assigneeId });
  } catch (e) {
    throw new Error(e.message);
  }
}