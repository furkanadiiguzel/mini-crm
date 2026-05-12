import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/token/refresh/`,
            { refresh }
          );
          localStorage.setItem("access_token", data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const customerService = {
  list: (params) => api.get("/customers/", { params }),
  get: (id) => api.get(`/customers/${id}/`),
  create: (data) => api.post("/customers/", data),
  update: (id, data) => api.patch(`/customers/${id}/`, data),
  remove: (id) => api.delete(`/customers/${id}/`),
  stats: () => api.get("/customers/stats/"),
};

export default api;
