import api from "../api/api.service";
import axios from "axios";

export async function getIteration(id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/iterations/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicIteration(orgId, id) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/iterations/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateIteration(id, iteration) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/iterations/${id}`, iteration);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addIteration(iteration) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/iterations`, iteration);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listIterations() {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/iterations`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listIterationsWithWorkItemsForTimeline(timeline) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/iterations/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listPublicIterationsWithWorkItemsForTimeline(orgId, timeline) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/iterations/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteIteration(id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/iterations/${id}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function startIteration(id) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/iterations/${id}/start`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function completeIteration(id) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/iterations/${id}/complete`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getActiveIteration() {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/iterations/active`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicActiveIteration(orgId) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/iterations/active`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
