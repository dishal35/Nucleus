import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the token exists in localStorage on app load
    const token = localStorage.getItem("token");
    if (token) {
      validateToken(token); // Set the token in state for immediate access
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/user/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data); // Set the user details
      } else {
        localStorage.removeItem("token"); // Remove invalid token
        setUser(null);
      }
    } catch (error) {
      console.error("Error validating token:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:5000/api/user/logout", {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("token"); // Remove token on logout
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};