"use client";

import React from "react";
import { useChat } from "@/contexts/ChatContext";
import { ConversationItem } from "./ConversationItem";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ConversationList() {
  const { conversations, currentConversation, selectConversation, isLoading } =
    useChat();

  return (
    <ScrollArea className="flex-1 w-full">
      <div className="space-y-1 p-2">
        {conversations.length === 0 && !isLoading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No conversations yet. Start a new chat!
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === currentConversation}
              onClick={() => selectConversation(conversation.id)}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
}
