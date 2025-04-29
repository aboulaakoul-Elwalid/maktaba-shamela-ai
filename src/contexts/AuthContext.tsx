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
    console.log("[AuthProvider] Fetching conversations..."); // Log start

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

      // Log status and check if response is ok before parsing JSON
      console.log(
        `[AuthProvider] Fetch conversations status: ${response.status}`
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "[AuthProvider] Fetch conversations error response:",
          errorText
        );
        throw new Error(
          `Failed to fetch conversations: ${response.status} ${errorText}`
        );
      }

      // Try parsing JSON
      let data: ListConversationsApiResponse | null = null;
      try {
        data = await response.json();
        console.log(
          "[AuthProvider] Raw conversations data:",
          JSON.stringify(data, null, 2)
        ); // Log raw data
      } catch (jsonError: any) {
        console.error(
          "[AuthProvider] Failed to parse JSON response:",
          jsonError
        );
        throw new Error("Received invalid data format from server.");
      }

      // *** Add More Robust Safety Checks Here ***
      const backendConversations = data?.conversations; // Access potentially undefined property

      // Check if it's an array BEFORE mapping
      if (!Array.isArray(backendConversations)) {
        console.error(
          "[AuthProvider] 'conversations' property is missing or not an array in the response:",
          backendConversations
        );
        // Set empty array or handle as error depending on expectation
        setConversations([]);
        // Optionally set an error message if conversations are expected
        // setConversationsError("Received invalid conversation data format.");
      } else {
        console.log(
          "[AuthProvider] Backend conversations array:",
          JSON.stringify(backendConversations, null, 2)
        ); // Log the array itself

        // Convert backend conversations to frontend format
        const frontendConversations: Conversation[] = backendConversations
          .map((conv: BackendConversation): Conversation => {
            // Add logging for individual item processing if needed
            // console.log("[AuthProvider] Mapping conversation item:", JSON.stringify(conv));
            if (
              !conv ||
              typeof conv.$id !== "string" ||
              typeof conv.created_at !== "string"
            ) {
              console.warn(
                "[AuthProvider] Skipping invalid conversation item:",
                conv
              );
              // Return a placeholder or filter it out later
              // For now, let's create a placeholder to avoid crashing map
              return {
                id: `invalid-${Math.random()}`,
                title: "Invalid Conversation Data",
                createdAt: new Date(),
                updatedAt: new Date(),
              };
            }
            return {
              id: conv.$id, // Ensure $id exists and is a string
              title: conv.title || `Conversation ${conv.$id.substring(0, 6)}`,
              createdAt: new Date(conv.created_at), // Ensure created_at exists and is valid date string
              updatedAt: conv.last_updated
                ? new Date(conv.last_updated)
                : new Date(conv.created_at),
            };
          })
          .filter((conv) => !conv.id.startsWith("invalid-")); // Filter out invalid items

        // Sort conversations by updatedAt descending (most recent first)
        frontendConversations.sort(
          (a, b) =>
            (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0)
        );

        console.log(
          "[AuthProvider] Setting frontend conversations:",
          frontendConversations.length
        );
        setConversations(frontendConversations);
      }
    } catch (err: any) {
      logApiError("fetchConversations", err);
      setConversationsError(err.message || "Failed to load conversations");
      console.error("Error fetching conversations:", err);
      setConversations([]); // Clear conversations on error
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
