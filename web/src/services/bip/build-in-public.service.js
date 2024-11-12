import api from "../api/api.service";
import { cacheData, clearCache, getCachedData } from "../cache/cache.service";
import axios from "axios";

export async function updateBuildInPublicSettings(settings) {
  try {
    await api.put(`${process.env.REACT_APP_API_URL}/build-in-public/settings`, settings);
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getBuildInPublicSettings() {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/build-in-public/settings`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getPublicBuildInPublicSettings(orgId) {
  const cacheKey = `${orgId}-settings`;
  try {
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      return cachedData;
    }
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/build-in-public/org/${orgId}/settings`);
    const responseData = response.data;
    cacheData(cacheKey, responseData, 60000);
    return responseData;
  } catch (e) {
    clearCache(cacheKey);
    throw new Error(e.message);
  }
}
