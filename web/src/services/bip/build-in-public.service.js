import api from "../api/api.service";
import { cacheData, clearCache, getCachedData } from "../cache/cache.service";
import axios from "axios";

export async function updateBuildInPublicSettings(orgId, productId, settings) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/build-in-public/settings`, settings);
    clearBuildInPublicSettingsCache(orgId, productId);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getBuildInPublicSettings(orgId, productId) {
  const cacheKey = `${orgId}-${productId}-settings`;
  try {
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      return cachedData;
    }
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/orgs/${orgId}/projects/${productId}/build-in-public/settings`);
    const responseData = response.data;
    cacheData(cacheKey, responseData, 60000);
    return responseData;
  } catch (e) {
    clearBuildInPublicSettingsCache(orgId, productId);
    throw new Error(e.message);
  }
}

export function clearBuildInPublicSettingsCache(orgId, productId) {
  clearCache(`${orgId}-${productId}-settings`);
}
