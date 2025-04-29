"use client";

import React from "react";
import { ChatProvider } from "@/contexts/ChatContext";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import IslamicPattern from "@/components/shared/islamic-pattern";
import ParchmentTexture from "@/components/chat/parchment-texture";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

export function ChatLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ChatProvider>
        <SidebarProvider>
          <div className="flex h-[100dvh] w-full overflow-hidden">
            {/* Sidebar - visible on desktop, hidden on mobile by default */}
            <AppSidebar user={user} />

            {/* Main content area */}
            <div className="relative flex flex-col flex-1 overflow-hidden">
              {/* Background Elements */}
              <div className="absolute inset-0 pointer-events-none z-[-1] opacity-5">
                <IslamicPattern />
              </div>
              <div className="absolute inset-0 pointer-events-none z-[-1] opacity-15 mix-blend-overlay">
                <ParchmentTexture />
              </div>

              {/* Render the page content */}
              {children}
            </div>
          </div>
        </SidebarProvider>
      </ChatProvider>
    </ThemeProvider>
  );
}
