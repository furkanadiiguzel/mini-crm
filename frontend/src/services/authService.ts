import type { AxiosResponse } from "axios";
import api from "./api";
import type { User, AuthTokens } from "../types/auth";

const authService = {
  login(username: string, password: string): Promise<AxiosResponse<AuthTokens>> {
    return api.post<AuthTokens>("/auth/login/", { username, password });
  },

  me(): Promise<AxiosResponse<User>> {
    return api.get<User>("/auth/me/");
  },

  refreshToken(refresh: string): Promise<AxiosResponse<AuthTokens>> {
    return api.post<AuthTokens>("/auth/refresh/", { refresh });
  },
};

export default authService;
