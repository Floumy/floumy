import api from "../api/api.service";
import axios from "axios";

export async function getSprint(orgId, projectId, id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/sprints/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicSprint(orgId, projectId, id) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${projectId}/sprints/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateSprint(orgId, projectId, id, sprint) {
  try {
    const response = await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/sprints/${id}`, sprint);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addSprint(orgId, projectId, sprint) {
  try {
    const response = await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/sprints`, sprint);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listSprints(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/sprints`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listSprintsWithWorkItemsForTimeline(orgId, projectId, timeline) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/sprints/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listPublicSprintsWithWorkItemsForTimeline(orgId, projectId, timeline) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${projectId}/sprints/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteSprint(orgId, projectId, id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/sprints/${id}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function startSprint(orgId, projectId, id) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/sprints/${id}/start`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function completeSprint(orgId, projectId, id) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/sprints/${id}/complete`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getActiveSprint(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/sprints/active`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicActiveSprint(orgId, projectId) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${projectId}/sprints/active`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
