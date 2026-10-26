"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper to fetch current user profile
  const fetchCurrentUser = useCallback(async (authToken) => {
    try {
      const activeToken = authToken || localStorage.getItem("accessToken");
      if (!activeToken) {
        setUser(null);
        setLoading(false);
        return null;
      }

      const res = await fetch("/api/v7-otb/auth/me", {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(activeToken);
        return data.user;
      } else {
        // Token expired or invalid
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
        setToken(null);
        return null;
      }
    } catch (err) {
      console.error("Error fetching user session:", err);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (savedToken) {
      setToken(savedToken);
      fetchCurrentUser(savedToken);
    } else {
      setLoading(false);
    }
  }, [fetchCurrentUser]);

  // Login action
  const login = async ({ email, password, code, tempToken }) => {
    const res = await fetch("/api/v7-otb/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, code, tempToken }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    // Check if 2FA challenge is requested
    if (data.requires2FA) {
      return {
        requires2FA: true,
        tempToken: data.tempToken,
        email: data.email,
      };
    }

    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      setToken(data.accessToken);
      setUser(data.user);
      return { success: true, user: data.user };
    }

    return data;
  };

  // Register action
  const register = async ({ name, email, password }) => {
    const res = await fetch("/api/v7-otb/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Registration failed");
    }

    return data;
  };

  // Logout action
  const logout = async () => {
    try {
      await fetch("/api/v7-otb/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setToken(null);
      router.push("/login");
    }
  };

  // Refresh user state (e.g. after 2FA activation)
  const refreshUser = async () => {
    return await fetchCurrentUser(token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
