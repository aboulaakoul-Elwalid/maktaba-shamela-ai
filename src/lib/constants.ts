// API Configuration
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://server-maktaba-shamela.onrender.com";

// API Endpoints
export const API_ENDPOINTS = {
  // Chat endpoints
  CONVERSATIONS: "/chat/conversations",
  CONVERSATION: (id: string) => `/chat/conversations/${id}`,
  CONVERSATION_MESSAGES: (id: string) => `/chat/conversations/${id}/messages`,

  // RAG endpoints
  RAG_QUERY: "/rag/query",

  // Auth endpoints
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ME: "/auth/me",

  // File endpoints
  UPLOAD: "/upload",
};

// Chat configuration
export const CHAT_CONFIG = {
  DEFAULT_TOP_K: 5,
  DEFAULT_USE_RERANKING: true,
};
