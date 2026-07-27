import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAccessToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.post("/auth/refresh")
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(credentials) {
      const { data } = await api.post("/auth/login", credentials);
      setAccessToken(data.accessToken);
      setUser(data.user);
    },
    async register(payload) {
      const { data } = await api.post("/auth/register", payload);
      setAccessToken(data.accessToken);
      setUser(data.user);
    },
    async logout() {
      await api.post("/auth/logout");
      setAccessToken(null);
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

