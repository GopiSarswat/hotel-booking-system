import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

let accessToken = null;
let refreshing = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original?._retried || original?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }
    original._retried = true;
    refreshing ||= api.post("/auth/refresh").finally(() => {
      refreshing = null;
    });
    const { data } = await refreshing;
    setAccessToken(data.accessToken);
    original.headers.Authorization = `Bearer ${data.accessToken}`;
    return api(original);
  },
);

export const messageFrom = (error) => error.response?.data?.message || error.message || "Something went wrong.";

