import api from "../api/api.service";

export async function addWorkItem(workItem) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/work-items`, workItem);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listWorkItems(page = 1, limit = 50) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/work-items?page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function searchWorkItems(searchText, page = 1, limit = 50) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/work-items/search?q=${searchText}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listOpenWorkItems() {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/work-items/open`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getWorkItem(id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/work-items/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicWorkItem(orgId, workItemId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/work-items/${workItemId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateWorkItem(id, workItem) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/work-items/${id}`, workItem);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteWorkItem(id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/work-items/${id}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateWorkItemIteration(id, iterationId) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/work-items/${id}`, { iteration: iterationId });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateWorkItemStatus(id, status) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/work-items/${id}`, { status: status });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateWorkItemPriority(id, priority) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/work-items/${id}`, { priority: priority });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addComment(workItemId, comment) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/work-items/${workItemId}/comments`, { content: comment });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateComment(workItemId, commentId, comment) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/work-items/${workItemId}/comments/${commentId}`, { content: comment });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteComment(workItemId, commentId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/work-items/${workItemId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listComments(workItemId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/work-items/${workItemId}/comments`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}