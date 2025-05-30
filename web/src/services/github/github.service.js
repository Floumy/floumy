import api from '../api/api.service';

export async function getIsGithubConnected(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/projects/${projectId}/is-connected`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getGithubUrl(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/projects/${projectId}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getGithubRepos(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/projects/${projectId}/repos`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateProjectGithubRepo(orgId, projectId, repoId) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/projects/${projectId}/github/repo`, { id: repoId });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteProjectGithubRepo(orgId, projectId) {
  try {
    const response = await api.delete(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/projects/${projectId}/github/repo`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPullRequests(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/projects/${projectId}/github/prs`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPRsCycleTime(orgId, projectId, timeframeInDays) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/projects/${projectId}/github/prs/cycle-time`, {
      params: {
        timeframeInDays
      }
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPRsAverageMergeTime(orgId, projectId, timeframeInDays) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/projects/${projectId}/github/prs/merge-time`, {
      params: {
        timeframeInDays
      }
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPRsFirstReviewTime(orgId, projectId, timeframeInDays) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/github/auth/orgs/${orgId}/projects/${projectId}/github/prs/first-review-time`, {
      params: {
        timeframeInDays
      }
    });
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
