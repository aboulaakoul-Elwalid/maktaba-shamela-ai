// src/hooks/use-chat.ts
import { useState, useCallback, useEffect, useRef } from "react";
import {
  API_CONFIG,
  logApiCall,
  logApiResponse,
  logApiError,
} from "@/config/api";
import type {
  Message as FrontendMessageType,
  Source,
  HistoryMessage,
  SendMessageApiRequest,
  ChatApiResponse, // Import the non-streaming response type
  BackendMessage, // Keep for history loading if needed
} from "@/types/types";
import { parseSSE } from "@/lib/sse-parser"; // Keep for potential future use, but won't be called by sendMessage

const AUTH_TOKEN_KEY = "auth_token";
const HISTORY_LIMIT = 6; // Max history messages for anonymous users

// Interface for the history loading response (adjust if backend differs)
interface ConversationMessagesResponse {
  messages: BackendMessage[]; // Assuming backend returns BackendMessage format
}

export function useChat(initialConversationId: string | null = null) {
  const [messages, setMessages] = useState<FrontendMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Global loading for sending
  const [isLoadingHistory, setIsLoadingHistory] = useState(false); // Loading for history fetch
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(initialConversationId);

  // Ref to control abortion of fetch requests (can still be used for non-streaming)
  const abortControllerRef = useRef<AbortController | null>(null);

  // --- Cancel Function (can abort fetch) ---
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      console.log("Aborting previous fetch request...");
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      // Reset loading states if needed, though finally block in sendMessage handles it
      // setIsLoading(false);
      // Potentially remove placeholder if cancellation happens mid-request
      // setMessages(prev => prev.filter(msg => !msg.id.startsWith('ai-') || msg.content !== ""));
    }
  }, []);

  // --- Effect to load messages for the current conversation ---
  useEffect(() => {
    const loadMessageHistory = async (convId: string) => {
      setIsLoadingHistory(true);
      setError(null);
      setMessages([]); // Clear previous messages
      cancelStream(); // Cancel any ongoing send request

      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        console.warn("Attempted to load history without auth token.");
        setIsLoadingHistory(false);
        // Maybe set an error or guide user to login?
        // setError("Please log in to view conversation history.");
        return; // Don't proceed if not authenticated and trying to load specific conv
      }

      const endpoint = `/chat/conversations/${convId}/messages`;
      const url = `${API_CONFIG.BACKEND_URL}${endpoint}`;
      logApiCall(endpoint, "GET");

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          let errorBody = `History Error: ${response.status}`;
          try {
            const errorData = await response.json();
            errorBody = `${errorBody} - ${
              errorData.detail || JSON.stringify(errorData)
            }`;
          } catch (parseError) {
            errorBody = `${errorBody} - ${response.statusText}`;
          }
          throw new Error(errorBody);
        }

        const data: ConversationMessagesResponse = await response.json();
        logApiResponse(endpoint, response.status, data);

        // Convert backend messages to frontend format
        const fetchedMessages: FrontendMessageType[] = data.messages.map(
          (msg: BackendMessage): FrontendMessageType => ({
            id: msg.message_id,
            role: msg.message_type === "ai" ? "assistant" : "user",
            content: msg.content,
            timestamp: new Date(msg.timestamp), // Convert string to Date
            conversationId: msg.conversation_id,
            sources: msg.sources || [],
          })
        );

        setMessages(fetchedMessages);
      } catch (err: any) {
        logApiError(endpoint, err);
        setError(err.message || "Failed to load conversation history.");
        setMessages([]); // Clear messages on error
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (currentConversationId) {
      console.log("Loading history for conversation:", currentConversationId);
      loadMessageHistory(currentConversationId);
    } else {
      // No specific conversation selected (e.g., new chat)
      console.log("No initial conversation ID, starting fresh.");
      setMessages([]); // Ensure messages are cleared for a new chat
      setIsLoadingHistory(false); // Not loading history in this case
    }

    // Cleanup: Cancel any pending fetch if component unmounts or convId changes
    return () => {
      cancelStream();
    };
  }, [currentConversationId, cancelStream]); // Rerun when conversationId changes

  // --- Send Message using NON-STREAMING Fetch POST ---
  const sendMessage = useCallback(
    async (content: string, useRAG: boolean) => {
      if (!content.trim()) return;

      // Cancel any previous fetch request before starting new one
      cancelStream();

      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const isAnonymous = !token;

      const userMessageTimestamp = new Date();
      const userMessage: FrontendMessageType = {
        id: `user-${userMessageTimestamp.getTime()}`, // Temporary ID
        role: "user",
        content,
        timestamp: userMessageTimestamp,
        conversationId: currentConversationId || "temp-conv-user",
        sources: [],
      };

      const aiPlaceholderTimestamp = new Date(
        userMessageTimestamp.getTime() + 1
      );
      const aiPlaceholderMessage: FrontendMessageType = {
        id: `ai-${aiPlaceholderTimestamp.getTime()}`, // Temporary ID
        role: "assistant",
        content: "", // Will be filled after response
        sources: [],
        timestamp: aiPlaceholderTimestamp,
        conversationId: currentConversationId || "temp-conv-ai",
        isLoading: true, // Add loading state to the message itself
      };

      // Add user message and AI placeholder to state immediately
      setMessages((prevMessages) => [
        ...prevMessages,
        userMessage,
        aiPlaceholderMessage,
      ]);
      setIsLoading(true); // Global loading state for the input/button
      setError(null);

      // --- Construct Request Body ---
      const requestBody: SendMessageApiRequest = {
        content: content,
        use_rag: useRAG,
        // Add history for anonymous OR conversation_id for authenticated
      };

      if (isAnonymous) {
        // Get recent messages from state for anonymous context
        const historyToSend = messages
          .filter((msg) => msg.role === "user" || msg.role === "assistant")
          .slice(-HISTORY_LIMIT) // Limit history size
          .map(
            (msg): HistoryMessage => ({
              role: msg.role,
              content: msg.content,
            })
          );
        if (historyToSend.length > 0) {
          requestBody.history = historyToSend;
        }
        console.log("Sending anonymous request with history:", historyToSend);
      } else {
        // For authenticated users, send conversation_id if it exists
        if (currentConversationId) {
          requestBody.conversation_id = currentConversationId;
          console.log(
            "Sending authenticated request for conversation:",
            currentConversationId
          );
        } else {
          console.log("Sending authenticated request for NEW conversation.");
          // If no currentConversationId, backend will create a new one
        }
      }

      // --- Prepare Fetch ---
      const endpoint = "/chat/messages"; // Use the NON-STREAMING endpoint
      const url = `${API_CONFIG.BACKEND_URL}${endpoint}`;
      logApiCall(endpoint, "POST (JSON)", requestBody);

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json", // Expect JSON response
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // --- Execute Fetch ---
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(requestBody),
          signal: signal, // Allow cancellation
        });

        if (!response.ok) {
          let errorBody = `HTTP Error: ${response.status}`;
          try {
            const errorData = await response.json();
            errorBody = `${errorBody} - ${
              errorData.detail || JSON.stringify(errorData)
            }`;
          } catch (parseError) {
            errorBody = `${errorBody} - ${response.statusText}`;
          }
          throw new Error(errorBody);
        }

        // --- Process JSON Response ---
        const responseData: ChatApiResponse = await response.json();
        logApiResponse(endpoint, response.status, responseData);

        const newConvId = responseData.conversation_id;
        const finalUserMessageId = responseData.user_message_id;
        const finalAiMessageId = responseData.ai_message_id;

        // Update conversation ID state if it's new or confirmed
        if (newConvId && newConvId !== currentConversationId) {
          console.log("Received new/confirmed conversation ID:", newConvId);
          // Update the state. The useEffect will trigger history reload if needed,
          // but we also update messages directly here for immediate feedback.
          setCurrentConversationId(newConvId);
        }

        // Update messages state with the final data from the response
        setMessages((prev) =>
          prev.map((msg) => {
            // Update the user message with final ID and conversation ID
            if (msg.id === userMessage.id && finalUserMessageId) {
              return {
                ...msg,
                id: finalUserMessageId,
                conversationId: newConvId || msg.conversationId,
              };
            }
            // Update the AI placeholder message with final content, sources, ID, etc.
            if (msg.id === aiPlaceholderMessage.id) {
              return {
                ...msg,
                id: finalAiMessageId || msg.id, // Use final ID if available
                content: responseData.ai_response || "",
                sources: responseData.sources || [],
                conversationId: newConvId || msg.conversationId,
                isLoading: false, // Mark as not loading anymore
              };
            }
            // If conversation ID changed, update older messages in the state as well
            if (
              newConvId &&
              newConvId !== currentConversationId &&
              msg.conversationId === currentConversationId // Check against the ID *before* the update
            ) {
              return { ...msg, conversationId: newConvId };
            }
            return msg;
          })
        );
      } catch (err: any) {
        // Handle fetch errors (including AbortError)
        if (err.name === "AbortError") {
          console.log("Fetch aborted.");
          // Remove the placeholder message if request was cancelled before response
          setMessages((prev) =>
            prev.filter(
              (msg) =>
                msg.id !== userMessage.id && msg.id !== aiPlaceholderMessage.id
            )
          );
        } else {
          logApiError(endpoint, err);
          setError(err.message || "Failed to send message.");
          // Update placeholder to show error state instead of removing it
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiPlaceholderMessage.id
                ? {
                    ...msg,
                    isLoading: false,
                    content: `Error: ${
                      err.message || "Failed to get response"
                    }`,
                  }
                : msg
            )
          );
        }
      } finally {
        // Ensure loading state is reset and controller is cleared
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, currentConversationId, cancelStream] // Dependencies
  );

  // Function to explicitly set the active conversation ID (e.g., from a sidebar)
  const setActiveConversationId = (id: string | null) => {
    if (id !== currentConversationId) {
      console.log(`Setting active conversation ID to: ${id}`);
      setCurrentConversationId(id);
      // The useEffect hook will handle loading the history for the new ID
    }
  };

  return {
    messages,
    isLoading, // For send input state
    isLoadingHistory, // For history loading overlay
    error,
    sendMessage,
    currentConversationId,
    setActiveConversationId, // Expose this setter
  };
}
