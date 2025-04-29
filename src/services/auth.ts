"use client";

import { apiClient } from "@/lib/apiClient"; // ✅ FIXED: Correct import path
import { API_ENDPOINTS } from "@/lib/constants";

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface LoginResponse {
  token: string; // Or access_token based on your actual API response
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  user_id: string;
  message: string;
}

/**
 * Log in a user with email and password
 */
export const login = async (
  email: string,
  password: string
): Promise<{ user: User | null; error?: string }> => {
  try {
    const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.LOGIN, {
      email,
      password,
    });

    if (response.error) {
      return {
        user: null,
        error: response.error.message || "Login failed",
      };
    }

    if (response.data?.token) {
      localStorage.setItem("auth_token", response.data.token);
      return { user: response.data.user };
    }

    return { user: null, error: "No authentication token received" };
  } catch (error) {
    console.error("Login error:", error);
    return {
      user: null,
      error: error instanceof Error ? error.message : "Unknown login error",
    };
  }
};

/**
 * Register a new user
 */
export const register = async (
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; message: string; userId?: string }> => {
  try {
    const response = await apiClient.post<RegisterResponse>(
      API_ENDPOINTS.REGISTER,
      { name, email, password }
    );

    if (response.error) {
      return {
        success: false,
        message: response.error.message || "Registration failed",
      };
    }

    return {
      success: true,
      message: response.data?.message || "Registration successful",
      userId: response.data?.user_id,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown registration error",
    };
  }
};

/**
 * Logout the current user
 */
export const logout = (): void => {
  localStorage.removeItem("auth_token");
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Return null if not authenticated
    if (!isAuthenticated()) {
      return null;
    }

    const response = await apiClient.get<User>(API_ENDPOINTS.ME);

    if (response.error || !response.data) {
      // If unauthorized, clear token
      if (response.error?.status === 401) {
        logout();
      }
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Check if user is authenticated (has token)
 */
export const isAuthenticated = (): boolean => {
  return typeof window !== "undefined" && !!localStorage.getItem("auth_token");
};

/**
 * Get authentication headers for custom requests
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};
export const refreshToken = async (): Promise<boolean> => {
  const currentToken = localStorage.getItem("auth_token");

  if (!currentToken) {
    console.warn("No token to refresh");
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.access_token) {
      localStorage.setItem("auth_token", data.access_token);
      console.log("Token refreshed successfully");
      return true;
    } else {
      throw new Error("No token in refresh response");
    }
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return false;
  }
};
