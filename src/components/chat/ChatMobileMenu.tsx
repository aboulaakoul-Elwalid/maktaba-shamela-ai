import React from "react";
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // Use Shadcn Switch

// Assuming user type from AuthContext
interface User {
  email?: string | null;
  // Add other user fields if available
}

interface ChatMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  onNewChat: () => void;
  onClearChat: () => void;
  useRAG: boolean;
  onToggleRAG: () => void;
  isLoading: boolean;
  title?: string;
}

export function ChatMobileMenu({
  isOpen,
  onClose,
  user,
  onLogout,
  onNewChat,
  onClearChat,
  useRAG,
  onToggleRAG,
  isLoading,
  title = "زرياب",
}: ChatMobileMenuProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Menu Panel */}
      <div
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out transform md:hidden shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "bg-card border-r border-border" // Use card background for menu
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                "bg-gradient-to-br from-primary via-primary/80 to-primary/70 text-primary-foreground"
              )}
            >
              <span className="font-arabic text-base font-medium">ز</span>
            </div>
            <span
              id="mobile-menu-title"
              className="font-arabic text-lg font-semibold text-primary"
            >
              {title}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        {/* Menu Content */}
        <div className="p-4 space-y-5 flex flex-col h-[calc(100%-57px)]">
          {" "}
          {/* Adjust height based on header */}
          <div className="space-y-3 flex-grow">
            {" "}
            {/* Buttons and Toggles */}
            {/* New Chat Button */}
            <Button
              variant="default" // Use solid primary button
              className="w-full justify-start px-3 py-2.5"
              onClick={() => {
                onNewChat();
                onClose();
              }} // Close menu on click
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            {/* Clear Conversation Button */}
            <Button
              variant="outline"
              className="w-full justify-start px-3 py-2.5"
              onClick={() => {
                onClearChat();
                onClose();
              }} // Close menu on click
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Conversation
            </Button>
            {/* Sources Mode Toggle Section */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="rag-toggle-mobile"
                  className="text-sm font-medium text-foreground/90 flex items-center"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Sources Mode
                </label>
                <Switch
                  id="rag-toggle-mobile"
                  checked={useRAG}
                  onCheckedChange={() => {
                    onToggleRAG(); /* Keep menu open or close? onClose(); */
                  }}
                  aria-label={
                    useRAG ? "Disable Sources Mode" : "Enable Sources Mode"
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {useRAG ? "Answers use knowledge base" : "Standard chat mode"}
              </p>
            </div>
          </div>
          {/* User Info and Logout Section (at the bottom) */}
          {user && (
            <div className="mt-auto pt-4 border-t border-border">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                  <UserIcon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium truncate text-foreground/90">
                  {user.email || "User"}
                </span>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
