"use client";

import React, { useRef, useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { MessageBubble } from "./messages/MessageBubble";
import { MessageInput } from "./input/message-input";
import { TypingIndicator } from "./messages/TypingIndicator";
import GeometricPattern from "../shared/geometric-pattern";
import { motion } from "framer-motion";
import { useChat } from "@/hooks/use-chat";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { LoginDialog } from "@/contexts/LoginDialog";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterDialog } from "@/components/auth/RegisterDialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { AlertCircle } from "lucide-react";

// Define props for ChatInterface
interface ChatInterfaceProps {
  initialConversationId: string | null;
}

export function ChatInterface({ initialConversationId }: ChatInterfaceProps) {
  const {
    messages,
    isLoading,
    isLoadingHistory,
    error,
    sendMessage,
    currentConversationId,
    setActiveConversationId,
  } = useChat(initialConversationId);

  const { isAuthenticated, user, logout, isLoading: authIsLoading } = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isAtBottom]);

  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceFromBottom < 100);
  };

  return (
    <motion.div
      className="flex flex-col h-full bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="border-b border-border py-3 px-4 flex items-center justify-between bg-background/80 backdrop-blur-sm z-10 sticky top-0">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-md overflow-hidden mr-3">
            <GeometricPattern />
          </div>
          <h1 className="font-semibold text-lg">Ziryab</h1>
        </div>
        <div className="flex items-center gap-2">
          {authIsLoading ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.email || user?.name || "User"}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <LoginDialog />
              <RegisterDialog />
            </>
          )}
        </div>
      </header>

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        className="flex-1 overflow-hidden relative"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, var(--background) 0%, var(--muted) 100%)",
          backgroundSize: "100% 100%",
        }}
      >
        {isLoadingHistory && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <ScrollArea
          className="h-full px-4 pt-6 pb-2"
          onScroll={handleScroll}
          ref={scrollAreaRef}
        >
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => {
              const validReferences = message.sources
                ?.map((s) => s.title)
                .filter((title): title is string => typeof title === "string");

              return (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  isUser={message.role === "user"}
                  references={validReferences}
                  timestamp={
                    message.timestamp ? new Date(message.timestamp) : undefined
                  }
                  isLast={index === messages.length - 1}
                />
              );
            })}

            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

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
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              New messages
            </button>
          </div>
        )}
      </div>

      <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
    </motion.div>
  );
}
