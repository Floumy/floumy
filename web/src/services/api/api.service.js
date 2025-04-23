import axios from "axios";

// Create an Axios instance
const api = axios.create();

async function refreshTokens() {
  const currentRefreshToken = localStorage.getItem("refreshToken");
  const refreshResponse = await axios.post(`${process.env.REACT_APP_API_URL}/auth/refresh-token`, {
    refreshToken: currentRefreshToken
  });
  const accessToken = refreshResponse.data.accessToken;
  const refreshToken = refreshResponse.data.refreshToken;

  updateTokens(accessToken, refreshToken);

  return {
    accessToken,
    refreshToken
  };
}

function retryOriginalRequestWithTheNewAccessToken(error, newAccessToken) {
  const originalRequest = error.config;
  originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
  return api(originalRequest);
}

function updateTokens(newAccessToken, newRefreshToken) {
  localStorage.setItem("accessToken", newAccessToken);
  localStorage.setItem("refreshToken", newRefreshToken);
}

export function logoutUser() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentUserName");
  localStorage.removeItem("currentUserId");
  localStorage.removeItem("currentUserOrgId");
  localStorage.removeItem("lastSignedIn");
  localStorage.removeItem("currentOrg");
  localStorage.removeItem("currentOrgName");
  localStorage.removeItem("paymentPlan");
  localStorage.removeItem("isSubscribed");
  localStorage.removeItem("nextPaymentDate");
  localStorage.removeItem('lastVisitedProjectId');
}

// Add a response interceptor
api.interceptors.response.use(null, async error => {
  const originalRequest = error.config;
  if (error.response.status === 401) {
    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    if (originalRequest._retryCount >= 3) {
      logoutUser();
      window.location.href = "/auth/sign-in";
      return Promise.reject(error);
    }

    originalRequest._retryCount += 1;

    try {
      const { accessToken } = await refreshTokens();
      // Update the Axios instance with the new token
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      return retryOriginalRequestWithTheNewAccessToken(error, accessToken);
    } catch (refreshError) {
      logoutUser();
      window.location.href = "/auth/sign-in";
    }
  }

  if (error.response.status === 402) {
    window.location.href = "/admin/billing?expired=true";
  }

  // If the error is due to other reasons, we'll just pass it along
  return Promise.reject(error);
});

api.interceptors.request.use(
  config => {
    // Get the accessToken from localStorage
    const accessToken = localStorage.getItem("accessToken");

    // If the accessToken exists, set the Authorization header
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      delete config.headers["Authorization"];
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  });

export default api;