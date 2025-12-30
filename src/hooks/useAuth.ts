"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  // hasAffiliate: boolean;
  profilePicture?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:4000/api/auth/status", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include", // Still include credentials for cookie-based auth if needed
      });

      if (response.ok) {
        const userData = await response.json();
        setAuthState({
          user: userData.user || userData,
          loading: false,
          error: null,
        });
      } else {
        // If the token is invalid, clear it and redirect to login
        localStorage.removeItem("access_token");
        throw new Error("Session expired or invalid");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthState({
        user: null,
        loading: false,
        error: "Please log in to continue",
      });
      router.push("/login");
    }
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
      router.push("/login");
    }
  };

  return {
    ...authState,
    logout,
    checkAuth,
  };
}
