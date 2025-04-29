"use client"; // Required for useState and useEffect

import React, { useState, useEffect } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ConversationSidebar } from "@/components/chat/sidebar/ConversationSidebar";
import { useAuth } from "@/hooks/use-auth"; // To check auth status

export default function ChatPage() {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    conversations,
  } = useAuth();
  // State to hold the ID of the conversation currently being viewed/chatted in
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);

  // Effect to set the initial active conversation (e.g., the most recent one)
  // This runs only once after the initial conversation list is loaded
  useEffect(() => {
    if (
      isAuthenticated &&
      conversations.length > 0 &&
      activeConversationId === null
    ) {
      // Default to the first conversation (which should be the most recent due to sorting)
      // setActiveConversationId(conversations[0].id);
      // Or default to null (New Chat) initially:
      setActiveConversationId(null);
    }
    // Only run when auth status or conversations initially load
  }, [isAuthenticated, conversations, activeConversationId]);

  // If auth is still loading, show a loading state for the whole page
  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading Authentication...
      </div>
    );
  }

  // If not authenticated, maybe show a login prompt or redirect
  // if (!isAuthenticated) {
  //   return <div className="flex h-screen items-center justify-center">Please log in to chat.</div>;
  // }
  // For now, we allow anonymous access alongside authenticated, so we show the UI regardless

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Render sidebar only if authenticated */}
      {isAuthenticated && (
        <ConversationSidebar
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId} // Pass the setter function
        />
      )}

      {/* The Chat Interface takes the active ID to load/manage messages */}
      {/* We pass the activeConversationId as a key to force re-mount/re-run useEffect in useChat */}
      {/* OR rely on the useEffect inside useChat triggered by setActiveConversationId */}
      <div className="flex-1 flex flex-col">
        {" "}
        {/* Ensure chat interface takes remaining space */}
        <ChatInterface
          key={activeConversationId}
          initialConversationId={activeConversationId}
        />
      </div>
    </div>
  );
}
