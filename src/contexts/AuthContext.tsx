"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

// Define your User type
interface User {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  [key: string]: any;
}

// Define the context shape
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// Define the localStorage key consistently
const AUTH_TOKEN_KEY = "auth_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // --- checkAuth ---
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      console.log(
        "Checking authentication with token:",
        token?.substring(0, 10) + "..."
      );

      if (!token) {
        console.log("No token found");
        setUser(null);
        return;
      }

      console.log("Token found, attempting to parse user info");
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );

        const payload = JSON.parse(jsonPayload);
        console.log("Token payload:", payload);
        setUser({
          id: payload.sub,
          name: payload.name,
          email: payload.email,
        });
      } catch (e) {
        console.error("Could not parse JWT token:", e);
        setUser(null);
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser(null);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth status on initial load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // --- login ---
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Logging in with", email);

      // Mock successful login for development
      const mockToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const token = mockToken;

      localStorage.setItem(AUTH_TOKEN_KEY, token);

      await checkAuth();
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Failed to login");
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // --- register ---
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Registering", name, email);

      console.log("Mock registration successful, redirecting to login");
    } catch (err: any) {
      console.error("Registration failed:", err);
      setError(err.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  // --- logout ---
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Logging out");

      localStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
    } catch (err: any) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !isLoading,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
