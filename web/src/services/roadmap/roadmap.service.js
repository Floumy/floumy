import api from "../api/api.service";
import axios from "axios";

export async function addFeature(orgId, productId, feature) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/features`, feature);

    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listFeatures(orgId, productId, page = 1, limit = 50) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/features?page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listAllFeatures(orgId, productId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/features`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function searchFeatures(orgId, productId, searchText, page = 1, limit = 50) {
  try {
    // Url encode the search text
    searchText = encodeURIComponent(searchText);
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/features/search?q=${searchText}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }

}

export async function getFeature(orgId, productId, id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/features/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicFeature(orgId, productId, id) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/products/${productId}/features/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeature(orgId, productId, id, feature) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/features/${id}`, feature);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteFeature(orgId, productId, id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/features/${id}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addMilestone(orgId, productId, milestone) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/milestones`, milestone);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listMilestones(orgId, productId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/milestones/list`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listMilestonesWithFeatures(orgId, productId, timeline) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/milestones/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listPublicMilestonesWithFeatures(orgId, productId, timeline) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/products/${productId}/milestones/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listFeaturesWithoutMilestone(orgId, productId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/features/without-milestone`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getMilestone(orgId, productId, id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/milestones/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicMilestone(orgId, productId, milestoneId) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/products/${productId}/milestones/${milestoneId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateMilestone(orgId, productId, id, milestone) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/milestones/${id}`, milestone);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteMilestone(orgId, productId, id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/milestones/${id}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeatureMilestone(orgId, productId, featureId, milestoneId) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/features/${featureId}`, { milestone: milestoneId });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeatureKeyResult(orgId, productId, featureId, keyResultId) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/features/${featureId}`, { keyResult: keyResultId });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeatureStatus(orgId, productId, featureId, status) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/features/${featureId}`, { status });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeaturePriority(orgId, productId, featureId, priority) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/features/${featureId}`, { priority });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addFeatureComment(orgId, productId, featureId, comment) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/features/${featureId}/comments`, {
      content: comment
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteFeatureComment(orgId, productId, featureId, commentId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/features/${featureId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateFeatureComment(orgId, productId, featureId, commentId, comment) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/features/${featureId}/comments/${commentId}`, { content: comment });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}