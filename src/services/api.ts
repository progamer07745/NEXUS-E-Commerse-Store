import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Debugging helpers: log requests and responses to inspect what's sent to the backend
api.interceptors.request.use(
  (config) => {
    try {
    // debug
      console.debug("[api] Request:", {
        url: (config.baseURL || "") + (config.url || ""),
        method: config.method,
        params: config.params,
        data: config.data,
        headers: config.headers,
      });
    } catch (e) {
      /* ignore */
    }
    return config;
  },
  (error) => {
    console.error("[api] Request error:", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    try {
      console.debug("[api] Response:", response.status, response.config.url, response.data);
    } catch (e) {
      /* ignore */
    }
    return response;
  },
  (error) => {
    console.error("[api] Response error:", error?.response?.status, error?.response?.data, error?.config?.url);
    return Promise.reject(error);
  },
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = "Bearer " + token;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;
