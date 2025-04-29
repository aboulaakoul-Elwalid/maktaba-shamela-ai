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
  Source, // Make sure Source type is defined correctly
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

        const backendMessages = data?.messages || []; // Default to empty array

        // Convert backend messages to frontend format
        const fetchedMessages: FrontendMessageType[] = backendMessages.map(
          (msg: BackendMessage): FrontendMessageType => ({
            id: msg.message_id,
            role: msg.message_type === "ai" ? "assistant" : "user",
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            conversationId: msg.conversation_id,
            sources: (msg.sources || []) as Source[], // Add type assertion if needed
            isLoading: false, // History messages are never loading
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
      console.log("No initial conversation ID, starting fresh.");
      setMessages([]); // Ensure messages are cleared for a new chat
      setIsLoadingHistory(false); // Not loading history in this case
    }

    return () => {
      cancelStream();
    };
  }, [currentConversationId, cancelStream]);

  // --- Send Message using NON-STREAMING Fetch POST ---
  const sendMessage = useCallback(
    async (content: string, useRAG: boolean) => {
      if (!content.trim()) return;

      cancelStream();

      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const isAnonymous = !token;

      const userMessageTimestamp = new Date();
      const userMessage: FrontendMessageType = {
        id: `user-${userMessageTimestamp.getTime()}`,
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
        id: `ai-${aiPlaceholderTimestamp.getTime()}`,
        role: "assistant",
        content: "",
        sources: [],
        timestamp: aiPlaceholderTimestamp,
        conversationId: currentConversationId || "temp-conv-ai",
        isLoading: true,
      };

      setMessages((prevMessages) => [
        ...prevMessages,
        userMessage,
        aiPlaceholderMessage,
      ]);
      setIsLoading(true);
      setError(null);

      const requestBody: SendMessageApiRequest = {
        content: content,
        use_rag: useRAG,
      };

      if (isAnonymous) {
        const historyToSend = messages
          .filter((msg) => msg.role === "user" || msg.role === "assistant")
          .slice(-HISTORY_LIMIT)
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
        if (currentConversationId) {
          requestBody.conversation_id = currentConversationId;
          console.log(
            "Sending authenticated request for conversation:",
            currentConversationId
          );
        } else {
          console.log("Sending authenticated request for NEW conversation.");
        }
      }

      const endpoint = "/chat/messages";
      const url = `${API_CONFIG.BACKEND_URL}${endpoint}`;
      logApiCall(endpoint, "POST (JSON)", requestBody);

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(requestBody),
          signal: signal,
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

        const responseData: ChatApiResponse = await response.json();
        logApiResponse(endpoint, response.status, responseData);

        const newConvId = responseData.conversation_id;
        const finalUserMessageId = responseData.user_message_id;
        const finalAiMessageId = responseData.ai_message_id;

        if (newConvId && newConvId !== currentConversationId) {
          console.log("Received new/confirmed conversation ID:", newConvId);
          setCurrentConversationId(newConvId);
        }

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === userMessage.id && finalUserMessageId) {
              return {
                ...msg,
                id: finalUserMessageId,
                conversationId: newConvId || msg.conversationId,
              };
            }
            if (msg.id === aiPlaceholderMessage.id) {
              return {
                ...msg,
                id: finalAiMessageId || msg.id,
                content: responseData.ai_response || "",
                sources: responseData.sources || [],
                conversationId: newConvId || msg.conversationId,
                isLoading: false,
              };
            }
            if (
              newConvId &&
              newConvId !== currentConversationId &&
              msg.conversationId === currentConversationId
            ) {
              return { ...msg, conversationId: newConvId };
            }
            return msg;
          })
        );
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Fetch aborted.");
          setMessages((prev) =>
            prev.filter(
              (msg) =>
                msg.id !== userMessage.id && msg.id !== aiPlaceholderMessage.id
            )
          );
        } else {
          logApiError(endpoint, err);
          setError(err.message || "Failed to send message.");
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
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, currentConversationId, cancelStream]
  );

  const setActiveConversationId = (id: string | null) => {
    if (id !== currentConversationId) {
      console.log(`Setting active conversation ID to: ${id}`);
      setCurrentConversationId(id);
    }
  };

  return {
    messages,
    isLoading,
    isLoadingHistory,
    error,
    sendMessage,
    currentConversationId,
    setActiveConversationId,
  };
}
