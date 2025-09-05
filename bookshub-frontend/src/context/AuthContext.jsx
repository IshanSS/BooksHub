import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Try to load user from localStorage on initial load
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Login with backend API
  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:5010/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  };

  // Signup with backend API
  const signup = async (name, email, password, college, location) => {
    try {
      const res = await fetch("http://localhost:5010/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, college, location }),
      });
      const data = await res.json();
      if (res.ok) {
        // Optionally log in the user or redirect to login page
        return { success: true };
      } else {
        return { success: false, message: data.message || "Signup failed" };
      }
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  };

  // Logout and clear localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
