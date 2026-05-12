import api from "./api";

const authService = {
  login(username, password) {
    return api.post("/auth/login/", { username, password });
  },

  me() {
    return api.get("/auth/me/");
  },

  refreshToken(refresh) {
    return api.post("/auth/refresh/", { refresh });
  },
};

export default authService;
