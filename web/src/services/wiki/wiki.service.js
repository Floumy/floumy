import api from '../api/api.service';

export async function createPage(orgId, projectId, parentId) {
  try {
    const response = await api.post(
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/wiki`,
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
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/wiki`,
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
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/wiki/${id}`,
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
      `${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/wiki/${id}`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}
