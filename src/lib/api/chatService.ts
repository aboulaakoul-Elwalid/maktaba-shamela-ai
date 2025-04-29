// // src/lib/chatService.ts

// // IMPORTANT: Replace with your actual FastAPI backend URL
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// interface Source {
//   book_name?: string;
//   section_title?: string;
//   text_snippet?: string;
//   url?: string;
//   // Add any other fields your backend provides for sources
// }

// interface AiMessageResponse {
//   message_id: string;
//   content: string;
//   timestamp: string; // ISO format string expected from backend
//   sources?: Source[];
// }

// interface SendMessageResponse {
//   ai_message: AiMessageResponse;
//   // Include other potential response fields if your backend sends more
// }

// interface ConversationResponse {
//   conversation_id: string;
//   // Include other potential fields
// }

// // Function to get the auth token (replace with your actual logic)
// const getAuthToken = (): string | null => {
//   // Example: reading from localStorage or an auth context
//   // return localStorage.getItem('authToken');
//   return null; // Return null if no auth implemented yet
// };

// const handleResponse = async (response: Response) => {
//   if (!response.ok) {
//     let errorData;
//     try {
//       errorData = await response.json();
//     } catch (e) {
//       // If parsing error body fails, use status text
//       errorData = { detail: response.statusText };
//     }
//     console.error("API Error:", response.status, errorData);
//     throw new Error(errorData.detail || `HTTP error ${response.status}`);
//   }
//   try {
//     return await response.json();
//   } catch (e) {
//     // Handle cases where response is OK but body is not valid JSON or empty
//     if (
//       response.status === 204 /* No Content */ ||
//       response.headers.get("content-length") === "0"
//     ) {
//       return null; // Or return an appropriate value for No Content
//     }
//     console.error("JSON Parsing Error:", e);
//     throw new Error("Failed to parse server response.");
//   }
// };

// export const chatService = {
//   createConversation: async (): Promise<string> => {
//     const headers: HeadersInit = {
//       "Content-Type": "application/json",
//     };
//     const token = getAuthToken();
//     if (token) {
//       headers["Authorization"] = `Bearer ${token}`;
//     }

//     const response = await fetch(`${API_BASE_URL}/conversations/`, {
//       method: "POST",
//       headers: headers,
//     });
//     const data: ConversationResponse = await handleResponse(response);
//     if (!data || !data.conversation_id) {
//       throw new Error("Conversation ID not found in response");
//     }
//     return data.conversation_id;
//   },

//   sendMessage: async (
//     conversationId: string,
//     message: string,
//     useRAG: boolean
//   ): Promise<SendMessageResponse> => {
//     const headers: HeadersInit = {
//       "Content-Type": "application/json",
//     };
//     const token = getAuthToken();
//     if (token) {
//       headers["Authorization"] = `Bearer ${token}`;
//     }

//     const body = JSON.stringify({
//       content: message,
//       use_rag: useRAG, // Match backend expected field name
//     });

//     const response = await fetch(
//       `${API_BASE_URL}/conversations/${conversationId}/messages/`,
//       {
//         method: "POST",
//         headers: headers,
//         body: body,
//       }
//     );

//     const data: SendMessageResponse = await handleResponse(response);
//     if (!data || !data.ai_message) {
//       throw new Error("AI message not found in response");
//     }
//     return data;
//   },

//   // Assuming a DELETE endpoint exists to clear messages for a conversation
//   // Adjust endpoint and method if your API differs
//   clearConversation: async (conversationId: string): Promise<void> => {
//     const headers: HeadersInit = {};
//     const token = getAuthToken();
//     if (token) {
//       headers["Authorization"] = `Bearer ${token}`;
//     }

//     const response = await fetch(
//       `${API_BASE_URL}/conversations/${conversationId}/messages/`, // Or maybe /conversations/{conversationId} ?
//       {
//         method: "DELETE", // Or PUT/POST depending on your API design
//         headers: headers,
//       }
//     );
//     await handleResponse(response); // Check if the request was successful
//     console.log(`Conversation ${conversationId} messages cleared via API.`);
//   },
// };
