import api from "../api/api.service";
import axios from "axios";

export async function getIteration(orgId, productId, id) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/iterations/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicIteration(orgId, productId, id) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/products/${productId}/iterations/${id}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateIteration(orgId, productId, id, iteration) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/iterations/${id}`, iteration);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addIteration(orgId, productId, iteration) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/iterations`, iteration);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listIterations(orgId, productId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/iterations`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listIterationsWithWorkItemsForTimeline(orgId, productId, timeline) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/iterations/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listPublicIterationsWithWorkItemsForTimeline(orgId, productId, timeline) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/products/${productId}/iterations/timeline/${timeline}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteIteration(orgId, productId, id) {
  try {
    await api.delete(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/iterations/${id}`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function startIteration(orgId, productId, id) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/iterations/${id}/start`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function completeIteration(orgId, productId, id) {
  try {
    await api.post(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/iterations/${id}/complete`);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getActiveIteration(orgId, productId) {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/products/${productId}/iterations/active`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicActiveIteration(orgId, productId) {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}/products/${productId}/iterations/active`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
