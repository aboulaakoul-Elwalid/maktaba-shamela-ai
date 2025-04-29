"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { useState, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Prevent hydration mismatches
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false} // Disable system theme to reduce hydration issues
      disableTransitionOnChange
    >
      <AuthProvider>
        <ChatProvider>
          {/* Only show content after mounting */}
          {mounted ? (
            children
          ) : (
            <div style={{ visibility: "hidden" }}>{children}</div>
          )}
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
