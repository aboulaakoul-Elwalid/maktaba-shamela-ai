"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth"; // Custom hook to manage authentication state
import type { Conversation } from "@/types/types";
import { PlusCircle, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils"; // For conditional classes

interface ConversationSidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string | null) => void; // Callback when conversation/new is selected
}

export function ConversationSidebar({
  activeConversationId,
  onSelectConversation,
}: ConversationSidebarProps) {
  const {
    conversations,
    isLoadingConversations,
    conversationsError,
    fetchConversations, // Can be used for a refresh button if needed
  } = useAuth();

  return (
    <div className="flex flex-col h-full bg-muted/40 border-r border-border w-64">
      {/* Header with New Chat button */}
      <div className="p-2 border-b border-border">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => onSelectConversation(null)} // Select "New Chat"
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 p-2">
        {isLoadingConversations && (
          <div className="flex items-center justify-center text-muted-foreground py-4">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </div>
        )}
        {conversationsError && (
          <div className="flex flex-col items-center text-destructive text-sm p-4 text-center">
            <AlertCircle className="h-5 w-5 mb-1" />
            <p>{conversationsError}</p>
            <Button
              variant="link"
              size="sm"
              onClick={fetchConversations}
              className="mt-1"
            >
              Retry
            </Button>
          </div>
        )}
        {!isLoadingConversations &&
          !conversationsError &&
          conversations.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-4 px-2">
              No conversations yet. Start a new chat!
            </div>
          )}
        {!isLoadingConversations &&
          !conversationsError &&
          conversations.map((conv) => (
            <Button
              key={conv.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 mb-1 truncate",
                activeConversationId === conv.id &&
                  "bg-accent text-accent-foreground" // Highlight active
              )}
              onClick={() => onSelectConversation(conv.id)}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span className="truncate flex-1 text-left">{conv.title}</span>
            </Button>
          ))}
      </ScrollArea>

      {/* Optional Footer (e.g., user info, settings) */}
      {/* <div className="p-2 border-t border-border"> ... </div> */}
    </div>
  );
}
