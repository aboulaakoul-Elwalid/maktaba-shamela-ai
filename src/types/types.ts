/**
 * Represents a source document used for generating an AI response.
 * Matches the structure returned by the backend's context formatting
 * and stored in the message sources.
 */
export interface Source {
  document_id: string; // Original ID from the vector store
  book_id?: string; // Extracted book ID (might be empty)
  book_name?: string | null; // Name of the source book
  title?: string | null; // Section title within the book (e.g., section_title)
  score?: number | null; // Relevance score from retrieval
  url?: string | null; // URL to the source (e.g., Shamela link)
  content?: string | null; // The relevant text snippet used as context
}

/**
 * Represents the raw message structure received from the backend API.
 */
export interface BackendMessage {
  message_id: string; // Matches $id from Appwrite
  conversation_id: string;
  user_id: string; // ID of the sender ('ai' or user ID)
  content: string;
  message_type: "user" | "ai"; // Matches backend type
  timestamp: string; // ISO 8601 timestamp string from backend
  sources?: Source[] | null; // Matches backend structure
}

/**
 * Represents the raw conversation structure received from the backend API.
 * Used for listing conversations.
 */
export interface BackendConversation {
  $id: string; // Conversation ID from Appwrite
  // conversation_id?: string; // Alternative if backend maps $id
  user_id: string;
  title: string;
  created_at: string; // ISO 8601 timestamp string
  last_updated?: string | null; // ISO 8601 timestamp string
  // message_count and last_message might be added client-side if needed
}

/**
 * Represents a message object adapted for frontend UI state.
 * Conversion from BackendMessage happens in frontend logic.
 */
export interface Message {
  id: string; // Use message_id from BackendMessage
  content: string;
  role: "user" | "assistant"; // Frontend role concept mapped from message_type
  timestamp: Date; // Converted from backend string
  conversationId: string;
  sources?: Source[];
  isLoading?: boolean;
}

/**
 * Represents a conversation object adapted for frontend UI state.
 * Conversion from BackendConversation happens in frontend logic.
 */
export interface Conversation {
  id: string; // Use $id from BackendConversation
  title: string;
  createdAt: Date; // Converted from backend string
  updatedAt?: Date | null; // Converted from backend string
  // messageCount and lastMessage might be added client-side if needed
}

/**
 * API response structure for creating a new conversation.
 * Matches POST /chat/conversations response.
 */
export interface CreateConversationApiResponse {
  conversation_id: string;
  message: string; // Added success message
}

/**
 * API response structure for the non-streaming chat endpoint.
 * Matches POST /chat/messages response (ChatResponse schema).
 */
export interface ChatApiResponse {
  ai_response: string;
  sources: Source[];
  conversation_id: string | null; // Null if anonymous
  user_message_id: string | null; // Null if anonymous
  ai_message_id: string | null; // Null if anonymous
  // Optional fields from chat_service for debugging/info
  model_used?: string;
  fallback_used?: boolean;
  error_detail?: string | null;
}

/**
 * API request structure for sending a message.
 * Matches POST /chat/messages request body (MessageCreate schema).
 */
export interface SendMessageApiRequest {
  content: string;
  use_rag: boolean; // <-- Add this required field
  conversation_id?: string | null; // Optional: Omit for first message of a new *authenticated* chat
  history?: HistoryMessage[] | null; // <-- Add this optional field for anonymous users
}

/**
 * API request structure for the direct retrieval endpoint.
 * Matches POST /retrieve request body (RetrievalRequest schema).
 */
export interface DirectRetrievalRequest {
  query: string;
  top_k?: number; // Corresponds to top_k in retriever
}

/**
 * Represents a single document match from the retrieval endpoint.
 * Matches the DocumentMatch schema used within RetrievalResponse.
 */
export interface DocumentMatch {
  id: string;
  score: number;
  metadata: {
    book_name: string;
    section_title: string;
    text: string;
    // Add other potential metadata fields if present
    [key: string]: any; // Allow for other metadata fields
  };
}

/**
 * API response structure for the direct retrieval endpoint.
 * Matches POST /retrieve response body (RetrievalResponse schema).
 */
export interface DirectRetrievalResponse {
  matches: DocumentMatch[];
  query: string;
}

/**
 * API response structure for fetching user conversations.
 * Matches GET /chat/conversations response.
 */
export interface ListConversationsApiResponse {
  conversations: BackendConversation[];
}

/**
 * Structure for history messages sent from frontend to backend
 * for anonymous user context via query parameter.
 */
export interface HistoryMessage {
  role: "user" | "assistant"; // Use "assistant" for AI messages
  content: string;
}

/**
 * API response structure for successful login.
 * Matches POST /auth/login response.
 */
export interface LoginApiResponse {
  access_token: string;
  token_type: string; // Usually "bearer"
}

/**
 * API request structure for user registration.
 * Matches POST /auth/register request body (UserCreate schema).
 */
export interface RegisterApiRequest {
  email: string;
  password: string;
  name?: string; // Optional name field
}

/**
 * API response structure for successful user registration.
 * Matches POST /auth/register response (UserResponse schema).
 */
export interface RegisterApiResponse {
  id: string; // Or user_id, depending on backend schema
  email: string;
  name?: string;
  is_anonymous: boolean; // Should be false after registration
  // Add other fields returned by the backend if necessary
}

// Keep old DirectRagQuery types commented out or remove if unused
// export interface DirectRagQueryRequest {
//   query: string;
//   top_k?: number;
//   reranking?: boolean;
// }
// export interface DirectRagQueryResponse {
//   response: string;
//   context: Source[]; // This was likely incorrect, retrieval returns matches
// }
