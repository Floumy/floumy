import api from '../api/api.service';
import axios from 'axios';
import { apiUrl } from '../../config';

export async function getCycle(orgId, projectId, id) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/cycles/${id}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicCycle(orgId, projectId, id) {
  try {
    const response = await axios.get(
      `${apiUrl}/public/orgs/${orgId}/projects/${projectId}/cycles/${id}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updateCycle(orgId, projectId, id, cycle) {
  try {
    const response = await api.put(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/cycles/${id}`,
      cycle,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function addCycle(orgId, projectId, cycle) {
  try {
    const response = await api.post(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/cycles`,
      cycle,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listCycles(orgId, projectId) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/cycles`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listCyclesWithWorkItemsForTimeline(
  orgId,
  projectId,
  timeline,
) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/cycles/timeline/${timeline}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function listPublicCyclesWithWorkItemsForTimeline(
  orgId,
  projectId,
  timeline,
) {
  try {
    const response = await axios.get(
      `${apiUrl}/public/orgs/${orgId}/projects/${projectId}/cycles/timeline/${timeline}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deleteCycle(orgId, projectId, id) {
  try {
    await api.delete(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/cycles/${id}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function startCycle(orgId, projectId, id) {
  try {
    await api.post(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/cycles/${id}/start`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function completeCycle(orgId, projectId, id) {
  try {
    await api.post(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/cycles/${id}/complete`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getActiveCycle(orgId, projectId) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/cycles/active`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicActiveCycle(orgId, projectId) {
  try {
    const response = await axios.get(
      `${apiUrl}/public/orgs/${orgId}/projects/${projectId}/cycles/active`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
