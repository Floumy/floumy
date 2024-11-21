import api from "../api/api.service";
import { cacheData, clearCache, getCachedData } from "../cache/cache.service";
import axios from "axios";

export async function updateBuildInPublicSettings(orgId, projectId, settings) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/build-in-public/settings`, settings);
    clearBuildInPublicSettingsCache(orgId, projectId);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getBuildInPublicSettings(orgId, projectId) {
  const cacheKey = `${orgId}-${projectId}-settings`;
  try {
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      return cachedData;
    }
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${projectId}/build-in-public/settings`);
    const responseData = response.data;
    cacheData(cacheKey, responseData, 60000);
    return responseData;
  } catch (e) {
    clearBuildInPublicSettingsCache(orgId, projectId);
    throw new Error(e.message);
  }
}

export function clearBuildInPublicSettingsCache(orgId, projectId) {
  clearCache(`${orgId}-${projectId}-settings`);
}
