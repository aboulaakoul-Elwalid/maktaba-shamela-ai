"use client";

import React, { useRef, useEffect, useState } from "react";
// Remove ScrollViewport from import
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { MessageBubble } from "./messages/MessageBubble";
import { MessageInput } from "./input/message-input";
import GeometricPattern from "../shared/geometric-pattern";
import ParchmentTexture from "../shared/parchment-texture";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/hooks/use-chat";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "../ui/button";
import { LoginDialog } from "../auth/LoginDialog";
import { RegisterDialog } from "../auth/RegisterDialog";

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
  } = useChat(initialConversationId);

  const { isAuthenticated, user, logout, isLoading: authIsLoading } = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasScrolledUp, setHasScrolledUp] = useState(false);

  useEffect(() => {
    if (messagesEndRef.current && isAtBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  // Modified handleScroll to work with a standard div
  const handleScroll = () => {
    const viewport = scrollAreaViewportRef.current;
    if (!viewport) return;
    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const bottomThreshold = 100;
    const atBottomNow =
      scrollHeight - scrollTop - clientHeight < bottomThreshold;

    setIsAtBottom(atBottomNow);
    if (!atBottomNow && scrollTop > 100) {
      setHasScrolledUp(true);
    } else if (atBottomNow) {
      setHasScrolledUp(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setIsAtBottom(true);
      setHasScrolledUp(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col h-full bg-background relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ParchmentTexture />
      </div>

      <header className="border-b border-border/50 py-3 px-4 flex items-center justify-between bg-background/80 backdrop-blur-sm z-10 sticky top-0">
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
        <div className="sticky top-[61px] z-10 p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex-1 overflow-hidden relative z-[5]">
        {isLoadingHistory && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Replace the ScrollArea structure with a simple div for scrolling */}
        <div
          ref={scrollAreaViewportRef}
          onScroll={handleScroll}
          className="h-full overflow-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
        >
          <div className="max-w-4xl mx-auto px-4 pt-6 pb-8">
            <AnimatePresence initial={false}>
              {messages.map((message) => {
                const validReferences = message.sources
                  ?.map((s) => s.title)
                  .filter(
                    (title): title is string => typeof title === "string"
                  );

                return (
                  <MessageBubble
                    key={message.id}
                    id={message.id}
                    content={message.content}
                    isUser={message.role === "user"}
                    isLoading={message.isLoading}
                    references={validReferences}
                    timestamp={
                      message.timestamp
                        ? new Date(message.timestamp)
                        : undefined
                    }
                  />
                );
              })}
            </AnimatePresence>

            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {hasScrolledUp && (
          <div className="absolute bottom-4 right-4 z-10">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full shadow-lg h-10 w-10"
              onClick={scrollToBottom}
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      <div className="relative z-10 p-4 bg-background/80 backdrop-blur-sm border-t border-border/50">
        <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </motion.div>
  );
}
