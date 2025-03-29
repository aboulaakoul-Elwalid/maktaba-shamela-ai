"use client";

import React, { useRef, useEffect, useState } from "react";

import { ScrollArea } from "../ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { TypingIndicator } from "./typing-indicator";
import GeometricPattern from "../shared/geometric-pattern";
import { motion } from "framer-motion";

// Message type definition
interface Message {
  id: string;
  content: string;
  isUser: boolean;
  references?: string[];
  timestamp?: Date;
}

export function ChatInterface() {
  // Sample initial welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Welcome to Ziryab. How can I help you with Islamic studies today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Handle sending a new message
  const handleSendMessage = async (content: string, useRAG: boolean) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Make API call to get response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, useRAG }),
      });

      const data = await response.json();

      // Add AI response with references if available
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          content: data.response,
          isUser: false,
          references: data.references ? [data.references] : undefined,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          content:
            "Sorry, there was an error processing your request. Please try again.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isAtBottom]);

  // Monitor scroll position
  const handleScroll = () => {
    if (!scrollAreaRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Consider "at bottom" if within 100px of the bottom
    setIsAtBottom(distanceFromBottom < 100);
  };

  return (
    <motion.div
      className="flex flex-col h-[100dvh] bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <header className="border-b border-border py-3 px-4 flex items-center justify-between bg-background/80 backdrop-blur-sm z-10 sticky top-0">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-md overflow-hidden mr-3">
            <GeometricPattern />
          </div>
          <h1 className="font-semibold text-lg">Ziryab</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          Islamic Studies Assistant
        </div>
      </header>

      {/* Messages Container */}
      <div
        className="flex-1 overflow-hidden relative"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, var(--background) 0%, var(--muted) 100%)",
          backgroundSize: "100% 100%",
        }}
      >
        <ScrollArea
          className="h-full px-4 pt-6 pb-2"
          onScroll={handleScroll}
          ref={scrollAreaRef}
        >
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                content={message.content}
                isUser={message.isUser}
                references={message.references}
                timestamp={message.timestamp}
                isLast={index === messages.length - 1}
              />
            ))}

            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* "New messages" indicator when not at bottom */}
        {!isAtBottom && messages.length > 2 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <button
              className="h-8 shadow-lg border border-border animate-bounce bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm flex items-center"
              onClick={() => {
                setIsAtBottom(true);
                if (messagesEndRef.current) {
                  messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              New messages
            </button>
          </div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </motion.div>
  );
}
