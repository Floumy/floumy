import axios from "axios";
import {logout} from "../auth/auth.service";

// Create an Axios instance
const api = axios.create({
  withCredentials: true
});

async function refreshTokens() {
  await axios.post(`${process.env.REACT_APP_API_URL}/auth/refresh-token`, {}, {
    withCredentials: true
  });
}

function retryOriginalRequestWithTheNewAccessToken(error) {
  const originalRequest = error.config;
  return api(originalRequest);
}

export async function logoutUser() {
  localStorage.removeItem("currentUserName");
  localStorage.removeItem("currentUserId");
  localStorage.removeItem("currentUserOrgId");
  localStorage.removeItem("currentOrg");
  localStorage.removeItem("currentOrgName");
  localStorage.removeItem("paymentPlan");
  localStorage.removeItem("isSubscribed");
  localStorage.removeItem("nextPaymentDate");
  await logout()
}

// Add a response interceptor
api.interceptors.response.use(null, async error => {
  const originalRequest = error.config;
  if (error.response.status === 401) {
    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    if (originalRequest._retryCount >= 3) {
      await logoutUser();
      window.location.href = "/auth/sign-in";
      return Promise.reject(error);
    }

    originalRequest._retryCount += 1;

    try {
      await refreshTokens();
      return retryOriginalRequestWithTheNewAccessToken(error);
    } catch (refreshError) {
      await logoutUser();
      window.location.href = "/auth/sign-in";
    }
  }

  if (error.response.status === 402) {
    window.location.href = "/admin/billing?expired=true";
  }

  // If the error is due to other reasons, we'll just pass it along
  return Promise.reject(error);
});

export default api;