// import { API_CONFIG } from "@/config/api";

// const API_URL = API_CONFIG.BACKEND_URL;

// export interface MessageSource {
//   book_name: string;
//   section_title?: string;
//   text_snippet?: string;
//   relevance?: number;
//   document_id?: string;
//   url?: string;
// }

// export interface MessageResponse {
//   user_message: {
//     message_id: string;
//     conversation_id: string;
//     content: string;
//     message_type: string;
//     timestamp: string;
//     user_id: string;
//     sources: null;
//   };
//   ai_message: {
//     message_id: string;
//     conversation_id: string;
//     content: string;
//     message_type: string;
//     timestamp: string;
//     user_id: string;
//     sources?: MessageSource[];
//   };
// }

// export interface ConversationResponse {
//   conversation_id: string;
//   title?: string;
//   created_at: string;
//   user_id?: string;
// }

// // Helper function to get auth headers
// const getAuthHeaders = () => {
//   const token = localStorage.getItem("auth_token");
//   console.log("Using auth token:", token?.substring(0, 10) + "...");

//   return {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
// };

// export const chatService = {
//   async createConversation(): Promise<string> {
//     try {
//       const response = await fetch(`${API_URL}/chat/conversations`, {
//         method: "POST",
//         headers: getAuthHeaders(),
//       });

//       if (!response.ok) {
//         console.error(
//           "Create conversation failed with status:",
//           response.status
//         );
//         throw new Error(`Failed to create conversation: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("Created conversation:", data);
//       return data.conversation_id;
//     } catch (error) {
//       console.error("Error creating conversation:", error);
//       throw error;
//     }
//   },

//   async getConversations(): Promise<ConversationResponse[]> {
//     try {
//       const response = await fetch(`${API_URL}/chat/conversations`, {
//         headers: getAuthHeaders(),
//       });

//       if (!response.ok) {
//         if (response.status === 404) {
//           return []; // Return empty array for 404 response
//         }
//         throw new Error(`Failed to fetch conversations: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error("Error fetching conversations:", error);
//       return []; // Return empty array on error
//     }
//   },

//   async getMessages(conversationId: string): Promise<any[]> {
//     try {
//       const response = await fetch(
//         `${API_URL}/chat/conversations/${conversationId}/messages`,
//         {
//           headers: getAuthHeaders(),
//         }
//       );

//       if (!response.ok) {
//         if (response.status === 404) {
//           return []; // Return empty array for 404 response
//         }
//         throw new Error(`Failed to fetch messages: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error("Error fetching messages:", error);
//       return []; // Return empty array on error
//     }
//   },

//   async sendMessage(
//     conversationId: string,
//     message: string
//   ): Promise<MessageResponse> {
//     try {
//       console.log("Sending message to API:", {
//         content: message,
//         conversation_id: conversationId,
//       });

//       const response = await fetch(`${API_URL}/chat/messages`, {
//         method: "POST",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({
//           content: message,
//           conversation_id: conversationId,
//         }),
//       });

//       if (!response.ok) {
//         console.error("Send message failed with status:", response.status);
//         const errorText = await response.text();
//         console.error("Error response:", errorText);

//         try {
//           const errorData = JSON.parse(errorText);
//           throw new Error(
//             errorData.detail || `Failed to send message: ${response.status}`
//           );
//         } catch (e) {
//           throw new Error(
//             `Failed to send message: ${response.status}. Response: ${errorText}`
//           );
//         }
//       }

//       const responseData = await response.json();
//       console.log("API response:", responseData);
//       return responseData;
//     } catch (error) {
//       console.error(`Error sending message:`, error);
//       throw error;
//     }
//   },

//   async streamMessage(
//     content: string,
//     conversationId: string
//   ): Promise<Response> {
//     try {
//       const response = await fetch(`${API_URL}/chat/messages/stream`, {
//         method: "POST",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({
//           content,
//           conversation_id: conversationId,
//         }),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("Stream error:", errorText);
//         throw new Error(`Failed to stream message: ${response.status}`);
//       }

//       return response;
//     } catch (error) {
//       console.error("Error streaming message:", error);
//       throw error;
//     }
//   },

//   async deleteConversation(conversationId: string): Promise<void> {
//     try {
//       const response = await fetch(
//         `${API_URL}/chat/conversations/${conversationId}`,
//         {
//           method: "DELETE",
//           headers: getAuthHeaders(),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Failed to delete conversation: ${response.status}`);
//       }
//     } catch (error) {
//       console.error("Error deleting conversation:", error);
//       throw error;
//     }
//   },

//   async clearConversation(conversationId: string): Promise<void> {
//     try {
//       const response = await fetch(
//         `${API_URL}/chat/conversations/${conversationId}/messages`,
//         {
//           method: "DELETE",
//           headers: getAuthHeaders(),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Failed to clear conversation: ${response.status}`);
//       }
//     } catch (error) {
//       console.error("Error clearing conversation:", error);
//       throw error;
//     }
//   },

//   async queryRAG(query: string): Promise<any> {
//     try {
//       const response = await fetch(`${API_URL}/rag/query`, {
//         method: "POST",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({ query }),
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to query RAG: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error("Error querying RAG:", error);
//       throw error;
//     }
//   },
// };
