import api from "../api/api.service";

export async function addWorkItem(orgId, projectId, workItem) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/work-items`, workItem);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listWorkItems(orgId, projectId, page = 1, limit = 50) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/work-items?page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function searchWorkItems(orgId, projectId, searchText, page = 1, limit = 50) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/work-items/search?q=${searchText}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listOpenWorkItems(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/work-items/open`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getWorkItem(orgId, projectId, id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/work-items/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicWorkItem(orgId, projectId, workItemId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${projectId}/work-items/${workItemId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateWorkItem(orgId, projectId, id, workItem) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/work-items/${id}`, workItem);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteWorkItem(orgId, projectId, id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/work-items/${id}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateWorkItemIteration(orgId, projectId, id, iterationId) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/work-items/${id}`, { iteration: iterationId });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateWorkItemStatus(orgId, projectId, id, status) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/work-items/${id}`, { status: status });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateWorkItemPriority(orgId, projectId, id, priority) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/work-items/${id}`, { priority: priority });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addComment(orgId, projectId, workItemId, comment) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/work-items/${workItemId}/comments`, { content: comment.content, mentions: comment.mentions });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateComment(orgId, projectId, workItemId, commentId, comment) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/work-items/${workItemId}/comments/${commentId}`, { content: comment.content, mentions: comment.mentions });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteComment(orgId, projectId, workItemId, commentId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/work-items/${workItemId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listComments(orgId, projectId, workItemId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/work-items/${workItemId}/comments`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}