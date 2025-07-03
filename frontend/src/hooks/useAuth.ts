import { useState } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("access_token");
  });

  const login = (newToken: string) => {
    localStorage.setItem("access_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
  };

  const isLoggedIn = !!token;

  return { token, login, logout, isLoggedIn };
}

