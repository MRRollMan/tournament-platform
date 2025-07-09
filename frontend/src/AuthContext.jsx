import { createContext, useState, useEffect } from "react";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER } from "./constants.js";
import { jwtDecode } from "jwt-decode";
import { api } from "./api.jsx";

export const AuthContext = createContext();

export function clear_auth_storage() {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
  localStorage.removeItem(USER);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const current_user = localStorage.getItem(USER);
    if (current_user) {
      setUser({ data: JSON.parse(current_user) });
    } else{
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (access, refresh) => {
    localStorage.setItem(ACCESS_TOKEN, access);
    localStorage.setItem(REFRESH_TOKEN, refresh);
    const decoded = jwtDecode(access);
    localStorage.setItem(USER, JSON.stringify(decoded.user));
    setUser({ data: decoded.user });
  };

  const logout = async () => {
    const token = localStorage.getItem(REFRESH_TOKEN);
    clear_auth_storage();
    setUser(null);
    await api.logout(token);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
