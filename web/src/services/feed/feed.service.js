import api from '../api/api.service';
import axios from 'axios';
import { apiUrl } from '../../config';

export async function fetchFeedItems(orgId, projectId, page) {
  try {
    const response = await api.get(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/feed?page=${page}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function fetchPublicFeedItems(orgId, projectId, page) {
  try {
    const response = await axios.get(
      `${apiUrl}/public/orgs/${orgId}/projects/${projectId}/feed?page=${page}`,
    );
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
