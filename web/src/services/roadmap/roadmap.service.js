import api from "../api/api.service";
import axios from "axios";

export async function addFeature(feature) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/features`, feature);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listFeatures(page = 1, limit = 50) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/features?page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listAllFeatures() {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/features`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function searchFeatures(searchText, page = 1, limit = 50) {
  try {
    // Url encode the search text
    searchText = encodeURIComponent(searchText);
    const response = await api.get(`${process.env.REACT_APP_API_URL}/features/search?q=${searchText}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }

}

export async function getFeature(id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/features/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicFeature(orgId, id) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/features/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeature(id, feature) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/features/${id}`, feature);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteFeature(id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/features/${id}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addMilestone(milestone) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/milestones`, milestone);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listMilestones() {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/milestones/list`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listMilestonesWithFeatures(timeline) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/milestones/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listPublicMilestonesWithFeatures(orgId, timeline) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/milestones/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listFeaturesWithoutMilestone() {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/features/without-milestone`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getMilestone(id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/milestones/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicMilestone(orgId, milestoneId) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/milestones/${milestoneId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateMilestone(id, milestone) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/milestones/${id}`, milestone);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteMilestone(id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/milestones/${id}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeatureMilestone(featureId, milestoneId) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/features/${featureId}`, { milestone: milestoneId });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeatureKeyResult(featureId, keyResultId) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/features/${featureId}`, { keyResult: keyResultId });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeatureStatus(featureId, status) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/features/${featureId}`, { status });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeaturePriority(featureId, priority) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/features/${featureId}`, { priority });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addFeatureComment(featureId, comment) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/features/${featureId}/comments`, {
      content: comment
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteFeatureComment(featureId, commentId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/features/${featureId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeatureComment(featureId, commentId, comment) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/features/${featureId}/comments/${commentId}`, { content: comment });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}