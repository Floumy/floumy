import api from "../api/api.service";

export async function addIssue(orgId, productId, issue) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/issues`, issue);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listIssues(orgId, productId, page = 1, limit = 10) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/issues?page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getIssue(orgId, productId, issueId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/issues/${issueId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateIssue(orgId, productId, issueId, issue) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/issues/${issueId}`, issue);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteIssue(orgId, productId, issueId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/issues/${issueId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addIssueComment(orgId, productId, issueId, content) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/issues/${issueId}/comments`, {
      content
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateIssueComment(orgId, productId, issueId, commentId, content) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/issues/${issueId}/comments/${commentId}`, {
      content
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteIssueComment(orgId, productId, issueId, commentId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/issues/${issueId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function searchIssues(orgId, productId, searchText, page = 1, limit = 10) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/issues/search?q=${searchText}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}