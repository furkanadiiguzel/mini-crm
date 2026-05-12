import {
  createContext, useContext, useState, useEffect, useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../services/authService";
import type { User, AuthContextValue } from "../types/auth";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [token, setToken]     = useState<string | null>(() => localStorage.getItem("access_token"));
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem("access_token");
    if (!storedToken) { setLoading(false); return; }
    try {
      const { data } = await authService.me();
      setToken(storedToken);
      setUser(data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await authService.login(username, password);
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    setToken(data.access);
    const { data: me } = await authService.me();
    setUser(me);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
