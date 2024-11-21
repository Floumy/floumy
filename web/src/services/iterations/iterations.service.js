import api from "../api/api.service";
import axios from "axios";

export async function getIteration(orgId, projectId, id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/iterations/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicIteration(orgId, projectId, id) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${projectId}/iterations/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateIteration(orgId, projectId, id, iteration) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/iterations/${id}`, iteration);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addIteration(orgId, projectId, iteration) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/iterations`, iteration);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listIterations(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/iterations`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listIterationsWithWorkItemsForTimeline(orgId, projectId, timeline) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/iterations/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listPublicIterationsWithWorkItemsForTimeline(orgId, projectId, timeline) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${projectId}/iterations/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteIteration(orgId, projectId, id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/iterations/${id}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function startIteration(orgId, projectId, id) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/iterations/${id}/start`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function completeIteration(orgId, projectId, id) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/iterations/${id}/complete`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getActiveIteration(orgId, projectId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/iterations/active`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicActiveIteration(orgId, projectId) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/projects/${projectId}/iterations/active`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
