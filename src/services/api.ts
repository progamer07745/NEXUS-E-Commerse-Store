import axios from "axios";

const api = axios.create({
  baseURL: String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, ""),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});


export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = "Bearer " + token;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;
