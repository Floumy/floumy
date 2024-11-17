import api from "../api/api.service";

export async function addIssue(orgId, issue) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/issues`, issue);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listIssues(orgId, page = 1, limit = 10) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/issues?page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getIssue(orgId, issueId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/issues/${issueId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateIssue(orgId, issueId, issue) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/issues/${issueId}`, issue);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteIssue(orgId, issueId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/issues/${issueId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addIssueComment(orgId, issueId, content) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/issues/${issueId}/comments`, {
      content
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateIssueComment(orgId, issueId, commentId, content) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/issues/${issueId}/comments/${commentId}`, {
      content
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteIssueComment(orgId, issueId, commentId) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/issues/${issueId}/comments/${commentId}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function searchIssues(orgId, searchText, page = 1, limit = 10) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/issues/search?q=${searchText}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}