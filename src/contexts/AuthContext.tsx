"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  API_CONFIG,
  logApiCall,
  logApiResponse,
  logApiError,
} from "@/config/api";
import type {
  LoginApiResponse,
  RegisterApiResponse,
  RegisterApiRequest,
  Conversation,
  ListConversationsApiResponse,
  BackendConversation,
} from "@/types/types";

const AUTH_TOKEN_KEY = "auth_token";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
}

// Export the context type with added conversation properties
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => void;

  // Conversation properties and methods
  conversations: Conversation[];
  isLoadingConversations: boolean;
  conversationsError: string | null;
  fetchConversations: () => Promise<void>;
}

// Export the context itself
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Existing auth state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add conversation state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [conversationsError, setConversationsError] = useState<string | null>(
    null
  );

  const checkAuthStatus = useCallback(() => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
        console.log("Auth: Token found, user authenticated.");
      } else {
        setIsAuthenticated(false);
        setUser(null);
        console.log("Auth: No token found.");
      }
    } catch (e) {
      console.error("Auth: Error reading auth status from storage", e);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    const endpoint = "/auth/login";
    const url = `${API_CONFIG.BACKEND_URL}${endpoint}`;
    logApiCall(endpoint, "POST", { email });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginApiResponse | { detail: string } = await response.json();

      if (!response.ok) {
        logApiError(endpoint, data);
        throw new Error(
          (data as { detail: string }).detail ||
            `Login failed: ${response.status}`
        );
      }

      logApiResponse(endpoint, response.status, data);
      const { access_token } = data as LoginApiResponse;

      if (!access_token) {
        throw new Error("Login successful but no token received.");
      }

      localStorage.setItem(AUTH_TOKEN_KEY, access_token);
      setToken(access_token);
      setIsAuthenticated(true);
      console.log("Auth: Login successful.");
      return;
    } catch (err: any) {
      logApiError(endpoint, err);
      setError(err.message || "An unknown login error occurred.");
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      const endpoint = "/auth/register";
      const url = `${API_CONFIG.BACKEND_URL}${endpoint}`;
      const body: RegisterApiRequest = { name, email, password };
      logApiCall(endpoint, "POST", { name, email });

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        });

        const data: RegisterApiResponse | { detail: string } =
          await response.json();

        if (!response.ok) {
          logApiError(endpoint, data);
          throw new Error(
            (data as { detail: string }).detail ||
              `Registration failed: ${response.status}`
          );
        }

        logApiResponse(endpoint, response.status, data);
        console.log("Auth: Registration successful.");
        return;
      } catch (err: any) {
        logApiError(endpoint, err);
        setError(err.message || "An unknown registration error occurred.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    console.log("Auth: Logging out.");
    setIsLoading(true);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
    setIsLoading(false);
  }, []);

  // Add fetchConversations function
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setConversations([]);
      return;
    }

    setIsLoadingConversations(true);
    setConversationsError(null);

    try {
      const endpoint = "/chat/conversations";
      const url = `${API_CONFIG.BACKEND_URL}${endpoint}`;
      logApiCall(endpoint, "GET");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch conversations: ${response.status} ${errorText}`
        );
      }

      const data: ListConversationsApiResponse = await response.json();
      logApiResponse(endpoint, response.status, data);

      // Convert backend conversations to frontend format
      const frontendConversations: Conversation[] = data.conversations.map(
        (conv: BackendConversation): Conversation => ({
          id: conv.$id,
          title: conv.title || "Untitled Conversation",
          createdAt: new Date(conv.created_at),
          updatedAt: conv.last_updated ? new Date(conv.last_updated) : null,
        })
      );

      setConversations(frontendConversations);
    } catch (err: any) {
      logApiError("fetchConversations", err);
      setConversationsError(err.message || "Failed to load conversations");
      console.error("Error fetching conversations:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [isAuthenticated, token]);

  // Load conversations when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    } else {
      setConversations([]);
    }
  }, [isAuthenticated, fetchConversations]);

  // Update the value object to include conversation properties
  const value = {
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuthStatus,
    // Add conversation properties
    conversations,
    isLoadingConversations,
    conversationsError,
    fetchConversations,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
