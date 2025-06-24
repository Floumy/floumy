import api from '../api/api.service';

export async function addIssue(orgId, projectId, issue) {
  try {
    const response = await api.post(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/issues`,
      issue,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listIssues(orgId, projectId, page = 1, limit = 10) {
  try {
    const response = await api.get(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/issues?page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getIssue(orgId, projectId, issueId) {
  try {
    const response = await api.get(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/issues/${issueId}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateIssue(orgId, projectId, issueId, issue) {
  try {
    await api.put(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/issues/${issueId}`,
      issue,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteIssue(orgId, projectId, issueId) {
  try {
    await api.delete(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/issues/${issueId}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addIssueComment(orgId, projectId, issueId, comment) {
  try {
    const response = await api.post(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/issues/${issueId}/comments`,
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

export async function updateIssueComment(
  orgId,
  projectId,
  issueId,
  commentId,
  comment,
) {
  try {
    const response = await api.put(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
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

export async function deleteIssueComment(orgId, projectId, issueId, commentId) {
  try {
    await api.delete(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function searchIssues(
  orgId,
  projectId,
  searchText,
  page = 1,
  limit = 10,
) {
  try {
    const response = await api.get(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/issues/search?q=${searchText}&page=${page}&limit=${limit}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
