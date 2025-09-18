import api from '../api/api.service';
import { apiUrl } from '../../config';

export async function createDemoProject(orgId, projectId, objectives) {
  try {
    await api.post(`${apiUrl}/orgs/${orgId}/projects/${projectId}/demo`, {
      objectives,
    });
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function completeDemoProject(orgId, projectId) {
  try {
    await api.post(
      `${apiUrl}/orgs/${orgId}/projects/${projectId}/demo/complete`,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}
