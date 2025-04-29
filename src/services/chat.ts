// src/services/chat.ts

// --- Configuration ---
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://server-maktaba-shamela.onrender.com";

// --- Types ---

// Frontend Types (Used by Context/UI)
export interface Source {
  book_name: string;
  url: string;
  text_snippet?: string | null;
  relevance?: number | null;
  document_id?: string | null;
  page?: number | null;
  volume?: number | null;
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  conversationId: string;
  sources?: Source[] | null;
  pending?: boolean;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessage?: string | null;
}

// Backend Types (Representing raw API responses)
interface BackendMessage {
  message_id: string;
  user_id: string;
  content: string;
  message_type: "user" | "ai";
  timestamp: string;
  conversation_id: string;
  sources?: Source[] | null;
}

interface ConversationResponse {
  conversation_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: string | null;
  message_count: number;
}

interface CreateConversationResponse {
  conversation_id: string;
  message: string;
}

interface SendMessageBackendResponse {
  user_message: BackendMessage;
  ai_message: BackendMessage;
}

export interface SendMessageServiceResponse {
  userMessage: Message;
  aiMessage: Message;
}

// --- Helper Functions ---

/**
 * Gets necessary headers for API requests, including Authorization.
 * Now includes logging to verify token retrieval in test environment.
 */
const getAuthHeaders = (): HeadersInit => {
  // Attempt to retrieve token using localStorage (works with mock in Node/Bun)
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("auth_token")
      : global.localStorage?.getItem("auth_token"); // Check mock via global

  // *** ADDED LOGGING ***
  console.log(
    `[getAuthHeaders] Token retrieved from storage: ${
      token ? token.substring(0, 5) + "..." : "null"
    }`
  );

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    // Add other default headers if needed
    // "Accept": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    // Log if no token is found, as authenticated endpoints will likely fail
    console.warn(
      "[getAuthHeaders] No auth token found. Request will likely be anonymous or fail."
    );
  }
  return headers;
};

/**
 * Handles fetch responses, checks for errors, parses JSON.
 * Includes slightly more detailed error logging.
 * @throws {Error} Throws detailed error on failure.
 */
const handleApiResponse = async <T>(
  response: Response,
  operation: string
): Promise<T> => {
  const status = response.status;
  const statusText = response.statusText;
  let responseBody: any;

  try {
    // Handle 204 No Content specifically before trying to parse JSON
    if (status === 204) {
      console.log(
        `[handleApiResponse] Operation '${operation}' completed with Status 204 No Content.`
      );
      return null as T; // Success, but no body
    }
    // Attempt to parse JSON body for all other cases
    responseBody = await response.json();
  } catch (e) {
    // JSON parsing failed
    if (!response.ok) {
      // If status is also not ok, throw error based on status
      const errorMsg = `Failed to ${operation}: ${status} ${statusText} (Invalid or non-JSON error response)`;
      console.error(
        `API Error (${operation}): ${status} ${statusText}. Response body parsing failed.`,
        e
      );
      throw new Error(errorMsg);
    }
    // If status was ok but JSON parsing failed (unexpected but possible)
    console.warn(
      `API Warning (${operation}): ${status} ${statusText}. Successfully completed but response body parsing failed.`,
      e
    );
    return null as T; // Or handle as appropriate for the specific endpoint
  }

  // If response status is not ok (e.g., 4xx, 5xx)
  if (!response.ok) {
    let errorMessage =
      responseBody?.detail || responseBody?.message || `Failed to ${operation}`;
    // Add specific check for DELETE 404
    if (operation.startsWith("delete") && response.status === 404) {
      errorMessage = `Conversation not found or not owned by user (404)`;
    } else {
      errorMessage = `${errorMessage}: ${status} ${statusText}`;
    }
    console.error(
      `API Error (${operation}): Status ${status}. Message: ${errorMessage}`,
      responseBody
    );
    throw new Error(errorMessage);
  }

  // If response is ok but body is unexpectedly null/undefined (and not 204)
  // Modify this check if null IS a valid success response for some endpoints
  if (responseBody === null || responseBody === undefined) {
    console.warn(
      `API Warning (${operation}): Status ${status}. Operation successful but received null/undefined data.`
    );
  }

  return responseBody as T;
};

/**
 * Converts backend message format to frontend Message format.
 * Added basic check for input validity.
 */
const convertBackendMessage = (backendMsg: BackendMessage): Message => {
  if (!backendMsg || typeof backendMsg !== "object" || !backendMsg.message_id) {
    console.warn("[convertBackendMessage] Received invalid input:", backendMsg);
    // Return a placeholder or throw, depending on how strict you want to be
    return {
      id: `invalid-${Date.now()}`,
      content: "Error: Invalid message data received",
      role: "assistant",
      timestamp: new Date(),
      conversationId: "",
    };
  }
  return {
    id: backendMsg.message_id,
    content: backendMsg.content || "",
    role: backendMsg.message_type === "user" ? "user" : "assistant",
    timestamp: new Date(backendMsg.timestamp || Date.now()),
    conversationId: backendMsg.conversation_id,
    sources: backendMsg.sources || undefined,
  };
};

/**
 * Converts backend conversation response to frontend Conversation format.
 * Added basic check for input validity.
 */
const convertConversationResponse = (
  resp: ConversationResponse
): Conversation => {
  if (!resp || typeof resp !== "object" || !resp.conversation_id) {
    console.warn("[convertConversationResponse] Received invalid input:", resp);
    return {
      id: `invalid-${Date.now()}`,
      title: "Invalid Conversation",
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
    };
  }
  return {
    id: resp.conversation_id,
    title: resp.title || "New Conversation",
    createdAt: new Date(resp.created_at),
    updatedAt: new Date(resp.updated_at),
    messageCount: resp.message_count || 0,
    lastMessage: resp.last_message,
  };
};

// --- Service Functions ---

export const getConversations = async (): Promise<Conversation[]> => {
  console.log("[getConversations] Starting request...");
  const token = localStorage.getItem("auth_token");
  console.log(
    `[getConversations] Using token: ${token?.substring(
      0,
      5
    )}...${token?.substring(token.length - 5)}`
  );

  try {
    const response = await fetch(`${API_URL}/chat/conversations`, {
      method: "GET", // Explicitly set method
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      // Add timeout and credentials
      credentials: "include",
    });

    console.log(`[getConversations] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getConversations] Error response: ${errorText}`);
      throw new Error(
        `Failed to fetch conversations: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(
      `[getConversations] Received ${data.length} conversations:`,
      data.map((c: any) => c.conversation_id || c.id).join(", ")
    );

    // Map API response to our type
    return data.map((conv: any) => ({
      id: conv.conversation_id || conv.id,
      title: conv.title || "New Conversation",
      createdAt: new Date(conv.created_at || Date.now()),
      updatedAt: new Date(conv.updated_at || conv.created_at || Date.now()),
      messageCount: conv.message_count || 0,
      lastMessage: conv.last_message || null,
    }));
  } catch (error) {
    console.error("[getConversations] Error:", error);
    // Return empty array instead of throwing, to prevent app from breaking
    return [];
  }
};

export const getConversation = async (id: string): Promise<Conversation> => {
  const operation = `get conversation ${id}`;
  if (!id || typeof id !== "string")
    throw new Error("Conversation ID is required and must be a string.");

  const headers = getAuthHeaders();
  console.log(
    `[${operation}] Fetching: GET ${API_URL}/chat/conversations/${id}`
  );
  // console.log(`[${operation}] Headers: ${JSON.stringify(headers)}`);

  try {
    const response = await fetch(`${API_URL}/chat/conversations/${id}`, {
      method: "GET",
      headers,
    });
    const data = await handleApiResponse<ConversationResponse>(
      response,
      operation
    );
    if (!data)
      throw new Error("Conversation not found or invalid API response.");
    return convertConversationResponse(data);
  } catch (error) {
    console.error(`Error in ${operation}:`, error);
    throw error;
  }
};

export const getConversationMessages = async (
  conversationId: string
): Promise<Message[]> => {
  const operation = `get messages for conversation ${conversationId}`;
  if (!conversationId || typeof conversationId !== "string")
    throw new Error("Conversation ID is required and must be a string.");

  const headers = getAuthHeaders();
  console.log(
    `[${operation}] Fetching: GET ${API_URL}/chat/conversations/${conversationId}/messages`
  );
  // console.log(`[${operation}] Headers: ${JSON.stringify(headers)}`);

  try {
    const response = await fetch(
      `${API_URL}/chat/conversations/${conversationId}/messages`,
      { method: "GET", headers }
    );
    if (response.status === 404) {
      console.log(
        `[${operation}] Result: 404 Not Found. Returning empty message array.`
      );
      return []; // Valid case: conversation exists but has no messages, or ID was invalid
    }
    const data = await handleApiResponse<BackendMessage[]>(response, operation);
    const messages = Array.isArray(data) ? data : [];
    return messages
      .map(convertBackendMessage)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  } catch (error) {
    console.error(`Error in ${operation}:`, error);
    throw error;
  }
};

/**
 * Creates a new conversation.
 * Includes logging before fetch.
 */
export const createConversation = async (): Promise<string> => {
  const operation = "create conversation";
  const headers = getAuthHeaders();
  headers["Content-Type"] = "application/json";
  console.log(`[${operation}] Fetching: POST ${API_URL}/chat/conversations`);
  // *** ADDED LOGGING ***
  console.log(`[${operation}] Headers being sent: ${JSON.stringify(headers)}`); // Log the exact headers

  try {
    const response = await fetch(`${API_URL}/chat/conversations`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({}),
    });
    const data = await handleApiResponse<CreateConversationResponse>(
      response,
      operation
    );
    if (!data?.conversation_id) {
      throw new Error("API response did not include a conversation_id.");
    }
    // Check if the returned ID looks like an anonymous one
    if (data.conversation_id.startsWith("anon_conv_")) {
      console.warn(
        `[${operation}] Backend returned an anonymous conversation ID (${data.conversation_id}). Check backend auth handling for this endpoint.`
      );
    }
    return data.conversation_id;
  } catch (error) {
    console.error(`Error in ${operation}:`, error);
    throw error;
  }
};

export const sendMessage = async (
  conversationId: string,
  content: string,
  useRAG: boolean
): Promise<SendMessageServiceResponse> => {
  const operation = `send message to conversation ${conversationId}`;
  if (!conversationId || typeof conversationId !== "string")
    throw new Error("Conversation ID is required and must be a string.");
  if (!content || !content.trim())
    throw new Error("Message content cannot be empty.");

  const headers = getAuthHeaders();
  const body = JSON.stringify({
    content: content.trim(),
    conversation_id: conversationId,
    use_rag: useRAG,
  });

  console.log(`[${operation}] Fetching: POST ${API_URL}/chat/messages`);
  // console.log(`[${operation}] Headers: ${JSON.stringify(headers)}`);
  // console.log(`[${operation}] Body: ${body}`);

  try {
    const response = await fetch(`${API_URL}/chat/messages`, {
      method: "POST",
      headers,
      body,
    });
    const data = await handleApiResponse<SendMessageBackendResponse>(
      response,
      operation
    );
    if (!data?.user_message || !data?.ai_message) {
      throw new Error("API response missing user or AI message data.");
    }
    return {
      userMessage: convertBackendMessage(data.user_message),
      aiMessage: convertBackendMessage(data.ai_message),
    };
  } catch (error) {
    console.error(`Error in ${operation}:`, error);
    throw error;
  }
};

export const deleteConversation = async (
  conversationId: string
): Promise<void> => {
  const operation = `delete conversation ${conversationId}`;
  if (!conversationId || typeof conversationId !== "string")
    throw new Error("Conversation ID is required and must be a string.");

  const headers = getAuthHeaders();
  console.log(
    `[${operation}] Fetching: DELETE ${API_URL}/chat/conversations/${conversationId}`
  );
  // console.log(`[${operation}] Headers: ${JSON.stringify(headers}`);

  try {
    const response = await fetch(
      `${API_URL}/chat/conversations/${conversationId}`,
      { method: "DELETE", headers }
    );
    await handleApiResponse<null>(response, operation); // Expect 204 or similar success
  } catch (error) {
    console.error(`Error in ${operation}:`, error);
    throw error;
  }
};
