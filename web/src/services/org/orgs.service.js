import api, { logoutUser } from "../api/api.service";
import { cacheData, getCachedData } from "../cache/cache.service";

export async function getOrg() {
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/orgs/current`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function setCurrentOrg() {
  try {
    const currentOrg = await getOrg();
    localStorage.setItem("currentOrg", JSON.stringify(currentOrg));
    localStorage.setItem("currentOrgId", currentOrg.id);
    localStorage.setItem("currentProjectId", currentOrg.projects[0].id);
    localStorage.setItem("currentOrgName", currentOrg.name);
    localStorage.setItem("paymentPlan", currentOrg.paymentPlan);
    localStorage.setItem("isSubscribed", currentOrg.isSubscribed);
    localStorage.setItem("nextPaymentDate", currentOrg.nextPaymentDate);
  } catch (e) {
    logoutUser();
  }
}

export async function patchCurrentOrg(data) {
  try {
    await api.patch(`${process.env.REACT_APP_API_URL}/orgs/current`, data);
  } catch (e) {
    throw new Error(e.response.data.message);
  }
}

export async function getPublicOrg(orgId) {
  try {
    const cacheKey = `${orgId}-org`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const response = await api.get(`${process.env.REACT_APP_API_URL}/public/orgs/${orgId}`);
    const responseData = response.data;
    cacheData(cacheKey, responseData, 600000);
    return responseData;
  } catch (e) {
    throw new Error(e.message);
  }
}