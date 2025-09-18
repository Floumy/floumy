import api from '../api/api.service';
import { apiUrl } from '../../config';

export async function createPage(orgId, projectId, parentId) {
  try {
    const response = await api.post(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/pages`,
      { parentId },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPagesByParentId(orgId, projectId, parentId, search) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/pages`,
      {
        params: { parentId, search },
      },
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function updatePage(orgId, projectId, id, data) {
  try {
    const response = await api.patch(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/pages/${id}`,
      data,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function deletePage(orgId, projectId, id) {
  try {
    await api.delete(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/pages/${id}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}
