import api from "../api/api.service";

export async function addWorkItem(orgId, productId, workItem) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/work-items`, workItem);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listWorkItems(orgId, productId, page = 1, limit = 50) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/work-items?page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function searchWorkItems(orgId, productId, searchText, page = 1, limit = 50) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/work-items/search?q=${searchText}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listOpenWorkItems(orgId, productId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/work-items/open`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getWorkItem(orgId, productId, id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/work-items/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicWorkItem(orgId, productId, workItemId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${productId}/work-items/${workItemId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateWorkItem(orgId, productId, id, workItem) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/work-items/${id}`, workItem);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteWorkItem(orgId, productId, id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/work-items/${id}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateWorkItemIteration(orgId, productId, id, iterationId) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/work-items/${id}`, { iteration: iterationId });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateWorkItemStatus(orgId, productId, id, status) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/work-items/${id}`, { status: status });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateWorkItemPriority(orgId, productId, id, priority) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/work-items/${id}`, { priority: priority });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addComment(orgId, productId, workItemId, comment) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/work-items/${workItemId}/comments`, { content: comment });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateComment(orgId, productId, workItemId, commentId, comment) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/work-items/${workItemId}/comments/${commentId}`, { content: comment });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteComment(orgId, productId, workItemId, commentId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/work-items/${workItemId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listComments(orgId, productId, workItemId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/work-items/${workItemId}/comments`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}