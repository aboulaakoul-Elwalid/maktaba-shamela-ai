"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MessageCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useChat } from "@/contexts/ChatContext";

interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: Date;
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const { deleteConversation } = useChat();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Optional confirmation
    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteConversation(conversation.id);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 py-3 rounded-md cursor-pointer hover:bg-muted/50 group",
        isActive && "bg-muted"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <MessageCircle className="h-4 w-4 flex-shrink-0" />
        <div className="truncate flex-1 min-w-0">
          <div className="font-medium truncate">
            {conversation.title || "New Conversation"}
          </div>
          {conversation.lastMessage && (
            <div className="text-xs text-muted-foreground truncate">
              {conversation.lastMessage}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDistanceToNow(new Date(conversation.updatedAt), {
            addSuffix: true,
          })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
}
