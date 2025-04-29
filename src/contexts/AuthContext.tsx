"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
// Import Conversation, Login, and Register types
import type {
  Conversation,
  BackendConversation,
  ListConversationsApiResponse,
  LoginApiResponse,
  RegisterApiRequest, // <-- Import RegisterApiRequest
  RegisterApiResponse, // <-- Import RegisterApiResponse
} from "@/types/types";
import {
  API_CONFIG,
  logApiCall,
  logApiResponse,
  logApiError,
} from "@/config/api";

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
  isLoading: boolean; // Loading for auth check/login/register
  error: string | null; // Error for auth operations
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // Conversation related state and functions
  conversations: Conversation[];
  isLoadingConversations: boolean;
  conversationsError: string | null;
  fetchConversations: () => Promise<void>; // Function to manually refresh
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
  // Default values for conversation state
  conversations: [],
  isLoadingConversations: false,
  conversationsError: null,
  fetchConversations: async () => {},
});

const AUTH_TOKEN_KEY = "auth_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Auth loading
  const [error, setError] = useState<string | null>(null); // Auth error
  const router = useRouter();

  // --- Conversation State ---
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [conversationsError, setConversationsError] = useState<string | null>(
    null
  );
  // --------------------------

  // --- Fetch Conversations Function ---
  const fetchConversations = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      // Don't attempt to fetch if no token
      setConversations([]); // Clear conversations if token disappears
      return;
    }

    setIsLoadingConversations(true);
    setConversationsError(null);
    const endpoint = "/chat/conversations";
    const url = `${API_CONFIG.BACKEND_URL}${endpoint}`;
    logApiCall(endpoint, "GET");

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorBody = "Failed to fetch conversations";
        try {
          const errorData = await response.json();
          errorBody = errorData.detail || JSON.stringify(errorData);
        } catch (parseError) {
          errorBody = response.statusText;
        }
        throw new Error(`API Error: ${response.status} ${errorBody}`);
      }

      const data: ListConversationsApiResponse = await response.json();
      logApiResponse(endpoint, response.status, data);

      // Convert backend conversations to frontend format
      const formattedConversations = data.conversations
        .map(
          (conv: BackendConversation): Conversation => ({
            id: conv.$id, // Use $id from backend
            title: conv.title || `Conversation ${conv.$id.substring(0, 6)}`, // Fallback title
            createdAt: new Date(conv.created_at),
            updatedAt: conv.last_updated
              ? new Date(conv.last_updated)
              : undefined,
          })
        )
        .sort(
          (a, b) =>
            (b.updatedAt || b.createdAt).getTime() -
            (a.updatedAt || a.createdAt).getTime()
        ); // Sort newest first

      setConversations(formattedConversations);
    } catch (err: any) {
      logApiError(endpoint, err);
      setConversationsError(err.message || "Failed to load conversations.");
      setConversations([]); // Clear on error
    } finally {
      setIsLoadingConversations(false);
    }
  }, []); // No dependencies needed here, relies on token check inside

  // --- checkAuth ---
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      console.log("Checking auth...");

      if (!token) {
        console.log("No token found");
        setUser(null);
        setConversations([]); // Clear conversations on logout/no token
        return;
      }

      // Parse token (same as before)
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
        setUser({ id: payload.sub, name: payload.name, email: payload.email });

        // --- Fetch conversations after confirming user ---
        await fetchConversations();
        // -------------------------------------------------
      } catch (e) {
        console.error("Could not parse JWT token:", e);
        setUser(null);
        setConversations([]); // Clear conversations
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser(null);
      setConversations([]); // Clear conversations
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, [fetchConversations]); // Add fetchConversations dependency

  // Check auth status on initial load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // --- login ---
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    const endpoint = "/auth/login"; // Backend login endpoint
    const url = `${API_CONFIG.BACKEND_URL}${endpoint}`;

    // --- Prepare JSON Body ---
    const requestBody = {
      email: email, // Use 'email' field as per test_api.bat
      password: password,
    };
    // -------------------------

    logApiCall(endpoint, "POST", { email: email, password: "***" }); // Log without password
    console.log("Attempting login to URL:", url); // Keep this log for now

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          // --- Change Content-Type to JSON ---
          "Content-Type": "application/json",
          // ------------------------------------
          Accept: "application/json",
        },
        // --- Send JSON string ---
        body: JSON.stringify(requestBody),
        // ------------------------
      });

      const data = await response.json(); // Attempt to parse JSON response regardless of status

      if (!response.ok) {
        // Handle 4xx/5xx errors
        logApiError(endpoint, { status: response.status, data });
        // FastAPI often returns error details in {"detail": "..."}
        // Handle potential validation errors if status is 422
        let errorMessage =
          data.detail || `Login failed: ${response.statusText}`;
        if (
          response.status === 422 &&
          data.detail &&
          Array.isArray(data.detail)
        ) {
          errorMessage = data.detail
            .map((err: any) => `${err.loc.join(".")}: ${err.msg}`)
            .join("; ");
        } else if (response.status === 422 && typeof data.detail === "string") {
          errorMessage = data.detail; // Handle simple string detail for 422
        }
        throw new Error(errorMessage);
      }

      // --- Success ---
      logApiResponse(endpoint, response.status, data);
      const loginData = data as LoginApiResponse; // Type assertion

      if (!loginData.access_token) {
        throw new Error("Login successful but no access token received.");
      }

      const token = loginData.access_token;
      localStorage.setItem(AUTH_TOKEN_KEY, token);

      // Re-run checkAuth to parse token, set user, AND fetch conversations
      await checkAuth();

      // Optionally clear error on success
      setError(null);
    } catch (err: any) {
      logApiError(endpoint, err); // Log the caught error
      setError(err.message || "Failed to login. Please check credentials.");
      localStorage.removeItem(AUTH_TOKEN_KEY); // Ensure token is removed on failure
      setUser(null);
      setConversations([]); // Clear conversations on login failure
      // Re-throw the error so the component calling login can catch it if needed
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // --- register ---
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    const endpoint = "/auth/register"; // Backend register endpoint
    const url = `${API_CONFIG.BACKEND_URL}${endpoint}`;

    const requestBody: RegisterApiRequest = {
      email: email,
      password: password,
      name: name || undefined, // Send name only if provided
    };

    logApiCall(endpoint, "POST", { email: email, name: name, password: "***" });
    console.log("Attempting registration to URL:", url); // <-- ADD THIS LINE

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json(); // Attempt to parse JSON response

      if (!response.ok) {
        // Handle 4xx/5xx errors
        logApiError(endpoint, { status: response.status, data });
        // FastAPI often returns error details in {"detail": "..."}
        // It might also return validation errors in a structured way
        let errorMessage =
          data.detail || `Registration failed: ${response.statusText}`;
        if (
          response.status === 422 &&
          data.detail &&
          Array.isArray(data.detail)
        ) {
          // Handle FastAPI validation errors
          errorMessage = data.detail
            .map((err: any) => `${err.loc.join(".")}: ${err.msg}`)
            .join("; ");
        }
        throw new Error(errorMessage);
      }

      // --- Success ---
      logApiResponse(endpoint, response.status, data);
      const registerData = data as RegisterApiResponse; // Type assertion

      console.log("Registration successful:", registerData);
      // Optionally clear error on success
      setError(null);

      // Decide what to do after successful registration:
      // Option 1: Automatically log the user in (requires another API call or backend to return token)
      // Option 2: Show a success message and let the user log in manually
      // Option 3: Redirect to login page

      // For now, just log success and clear loading/error
      // The user will need to log in separately
    } catch (err: any) {
      logApiError(endpoint, err); // Log the caught error
      setError(err.message || "Failed to register. Please try again.");
      // Re-throw the error so the component calling register can catch it if needed
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // --- logout ---
  const logout = useCallback(async () => {
    try {
      setIsLoading(true); // Use the main auth loading state
      setError(null);
      console.log("Logging out");

      // TODO: Call backend logout endpoint if it exists

      localStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
      setConversations([]); // Clear conversations on logout
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
        isLoading, // Auth loading
        error, // Auth error
        login,
        register, // Expose the implemented register function
        logout,
        // Conversation values
        conversations,
        isLoadingConversations,
        conversationsError,
        fetchConversations,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
