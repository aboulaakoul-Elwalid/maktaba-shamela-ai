// src/hooks/use-chat.ts
import { useState, useCallback } from "react";
// Assuming types/types.ts is the source of truth now
import type {
  Message as FrontendMessageType,
  ChatApiResponse,
  Source,
} from "@/types/types";
// Removed AuthContext import as we get token from localStorage
import {
  API_CONFIG,
  logApiCall,
  logApiResponse,
  logApiError,
} from "@/config/api";

// Define the localStorage key consistently (must match AuthContext)
const AUTH_TOKEN_KEY = "auth_token";

export function useChat() {
  const [messages, setMessages] = useState<FrontendMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);

  const sendMessage = useCallback(
    async (content: string, useRAG: boolean) => {
      if (!content.trim()) return;

      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      const userMessageTimestamp = new Date();
      const userMessage: FrontendMessageType = {
        id: `user-${userMessageTimestamp.getTime()}`,
        role: "user",
        content,
        timestamp: userMessageTimestamp,
        conversationId: currentConversationId || "temp-conv",
        sources: [],
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setIsLoading(true);
      setError(null);

      const endpoint = "/api/chat"; // Still using proxy
      const method = "POST";
      const body = JSON.stringify({
        message: content,
        useRAG,
        conversationId: currentConversationId,
      });

      logApiCall(endpoint, method, body);

      try {
        const response = await fetch(endpoint, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: body,
        });

        if (!response.ok) {
          let errorBody = "Failed to fetch";
          try {
            const errorData = await response.json();
            errorBody = errorData.detail || JSON.stringify(errorData);
          } catch (parseError) {
            errorBody = response.statusText;
          }
          throw new Error(`API Error: ${response.status} ${errorBody}`);
        }

        const data: ChatApiResponse = await response.json();
        logApiResponse(endpoint, response.status, data);

        const conversationIdForAi =
          data.conversation_id || currentConversationId;
        if (
          data.conversation_id &&
          data.conversation_id !== currentConversationId
        ) {
          setCurrentConversationId(data.conversation_id);
          console.log("Started/using conversation:", data.conversation_id);
        }

        const aiMessageTimestamp = new Date();
        const aiMessage: FrontendMessageType = {
          id: data.ai_message_id || `ai-${aiMessageTimestamp.getTime()}`,
          role: "assistant",
          content: data.ai_response,
          sources: data.sources || [],
          timestamp: aiMessageTimestamp,
          conversationId: conversationIdForAi || "temp-conv",
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (err: any) {
        logApiError(endpoint, err);
        const errorMessageText =
          err.message ||
          "Sorry, there was an error processing your request. Please try again.";
        setError(errorMessageText);

        const errorTimestamp = new Date();
        const errorMessage: FrontendMessageType = {
          id: `error-${errorTimestamp.getTime()}`,
          role: "assistant",
          content: errorMessageText,
          timestamp: errorTimestamp,
          conversationId: currentConversationId || "temp-error-conv",
          sources: [],
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentConversationId]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    currentConversationId,
    setCurrentConversationId,
  };
}
