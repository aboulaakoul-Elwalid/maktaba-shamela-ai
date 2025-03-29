// src/hooks/use-chat.ts
import { useState, useCallback } from "react";
import type { Message } from "@/types";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string, useRAG: boolean) => {
    setIsLoading(true);
    try {
      // Example implementation
      const newMessage: Message = { role: "user", content };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Here you would typically call an API with the content and useRAG parameters
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
  };
}
