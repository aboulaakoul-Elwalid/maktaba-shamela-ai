"use client"; // Required for useState and useEffect

import React, { useState, useEffect } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ConversationSidebar } from "@/components/chat/sidebar/ConversationSidebar";
import { useAuth } from "@/hooks/use-auth"; // To check auth status

export default function ChatPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  // State to hold the ID of the conversation currently being viewed/chatted in
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);

  // Handler passed to the sidebar
  const handleSelectConversation = (id: string | null) => {
    console.log(`[ChatPage] Selecting conversation: ${id}`);
    setActiveConversationId(id);
  };

  // Add loading/auth checks if necessary
  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading authentication...
      </div>
    );
  }

  // Maybe redirect to login if not authenticated, or show limited view
  // if (!isAuthenticated) { ... }

  return (
    <div className="flex h-screen overflow-hidden">
      <ConversationSidebar
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
      />
      <main className="flex-1 flex flex-col">
        {/* Pass the active ID to the chat interface */}
        <ChatInterface
          key={activeConversationId || "new"} // Add key to force re-mount on ID change
          initialConversationId={activeConversationId}
        />
      </main>
    </div>
  );
}
