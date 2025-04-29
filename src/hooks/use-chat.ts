// src/hooks/use-chat.ts
import { useState, useCallback, useRef, useEffect } from "react";
import type {
  Message as FrontendMessageType,
  Source,
  HistoryMessage,
  SendMessageApiRequest, // Import the request type
} from "@/types/types";
import {
  API_CONFIG,
  logApiCall,
  logApiResponse,
  logApiError,
} from "@/config/api";
import { parseSSE } from "@/lib/sse-parser"; // We will create this helper

const AUTH_TOKEN_KEY = "auth_token";
const HISTORY_LIMIT = 6;

interface ConversationMessagesResponse {
  messages: FrontendMessageType[];
}

export function useChat(initialConversationId: string | null = null) {
  const [messages, setMessages] = useState<FrontendMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(initialConversationId);

  // Ref to control abortion of the fetch stream
  const abortControllerRef = useRef<AbortController | null>(null);

  // --- Stream Cleanup Function ---
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      console.log("Aborting fetch stream request.");
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      // Ensure loading state is reset if we manually cancel
      // Note: The fetch error handling should also set isLoading to false
      setIsLoading(false);
    }
  }, []);

  // --- Effect to load messages ---
  useEffect(() => {
    const loadMessageHistory = async (convId: string) => {
      console.log(`Loading history for conversation: ${convId}`);
      setIsLoadingHistory(true);
      setError(null);
      setMessages([]);
      cancelStream(); // Cancel any ongoing message stream

      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setError("Authentication token not found.");
        setIsLoadingHistory(false);
        return;
      }

      const endpoint = `/chat/conversations/${convId}/messages`;
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
          let errorBody = "Failed to fetch history";
          try {
            const errorData = await response.json();
            errorBody = errorData.detail || JSON.stringify(errorData);
          } catch (parseError) {
            errorBody = response.statusText;
          }
          throw new Error(`API Error: ${response.status} ${errorBody}`);
        }

        const data: ConversationMessagesResponse = await response.json();
        logApiResponse(endpoint, response.status, data);

        const formattedMessages = data.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));

        setMessages(formattedMessages);
      } catch (err: any) {
        logApiError(endpoint, err);
        setError(err.message || "Failed to load chat history.");
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (currentConversationId) {
      loadMessageHistory(currentConversationId);
    } else {
      setMessages([]);
      cancelStream(); // Ensure no stream is active for "New Chat"
    }

    // Cleanup on unmount or when conversationId changes
    return () => {
      cancelStream();
    };
  }, [currentConversationId, cancelStream]);

  // --- Send Message using Fetch POST ---
  const sendMessage = useCallback(
    async (content: string, useRAG: boolean) => {
      if (!content.trim()) return;

      cancelStream(); // Cancel any previous stream before starting new one

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

      let historyToSend: HistoryMessage[] | undefined = undefined;
      if (isAnonymous) {
        historyToSend = messages.slice(-HISTORY_LIMIT).map(
          (msg): HistoryMessage => ({
            role: msg.role,
            content: msg.content,
          })
        );
        if (historyToSend.length > 0) {
          requestBody.history = historyToSend;
        }
      } else {
        if (currentConversationId) {
          requestBody.conversation_id = currentConversationId;
        }
      }

      const endpoint = "/chat/messages/stream";
      const url = `${API_CONFIG.BACKEND_URL}${endpoint}`;
      logApiCall(endpoint, "POST (SSE Stream)", requestBody);

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
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

        if (!response.body) {
          throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        await parseSSE(reader, decoder, {
          onData: (eventData) => {
            // --- Add this check ---
            if (eventData.data === "[DONE]") {
              console.log("Received stream completion signal [DONE]");
              // The 'end' event or 'onClose' should handle final state,
              // but we stop processing this specific message here.
              return;
            }
            // ---------------------

            try {
              const parsedJson = JSON.parse(eventData.data);

              switch (eventData.event) {
                case "chunk":
                  if (parsedJson.token) {
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === aiPlaceholderMessage.id
                          ? { ...msg, content: msg.content + parsedJson.token }
                          : msg
                      )
                    );
                  }
                  break;
                case "sources":
                  const sourcesData: Source[] = parsedJson;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiPlaceholderMessage.id
                        ? { ...msg, sources: sourcesData }
                        : msg
                    )
                  );
                  break;
                case "conversation_id":
                  const newConvId = parsedJson.conversation_id;
                  if (newConvId && newConvId !== currentConversationId) {
                    console.log(
                      "Received new/confirmed conversation ID:",
                      newConvId
                    );
                    setCurrentConversationId(newConvId);
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === aiPlaceholderMessage.id ||
                        msg.id === userMessage.id
                          ? { ...msg, conversationId: newConvId }
                          : msg
                      )
                    );
                  }
                  break;
                case "message_id":
                  const finalAiMessageId = parsedJson.message_id;
                  if (finalAiMessageId) {
                    console.log(
                      "Received final AI message ID:",
                      finalAiMessageId
                    );
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === aiPlaceholderMessage.id
                          ? { ...msg, id: finalAiMessageId }
                          : msg
                      )
                    );
                  }
                  break;
                case "error":
                  const backendErrorMessage =
                    parsedJson.detail || "Error during generation.";
                  console.error(
                    "Backend SSE Error Event:",
                    backendErrorMessage
                  );
                  setError(backendErrorMessage);
                  cancelStream();
                  break;
                case "end":
                  console.log("SSE stream ended via 'end' event.");
                  setIsLoading(false);
                  abortControllerRef.current = null;
                  break;
                default:
                  console.warn("Received unknown SSE event:", eventData.event);
                  break;
              }
            } catch (e) {
              console.error(
                "Failed to parse SSE data JSON:",
                eventData.data,
                e
              );
            }
          },
          onError: (err) => {
            console.error("Error processing SSE stream:", err);
            if (err.name !== "AbortError") {
              setError(err.message || "Failed to process chat response.");
            }
            setIsLoading(false);
            abortControllerRef.current = null;
          },
          onClose: () => {
            console.log("SSE stream reader closed.");
            setIsLoading(false);
            abortControllerRef.current = null;
          },
        });
      } catch (err: any) {
        logApiError(endpoint, err);
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to send message.");
        }
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, currentConversationId, cancelStream]
  );

  const setActiveConversationId = (id: string | null) => {
    setCurrentConversationId(id);
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
