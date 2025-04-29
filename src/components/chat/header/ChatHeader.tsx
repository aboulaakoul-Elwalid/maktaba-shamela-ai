import React from "react";
import { Sun, Moon, BookOpen, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // Use Shadcn Switch

interface ChatHeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  useRAG: boolean;
  toggleRAG: () => void;
  onMenuOpen: () => void;
  title?: string; // Optional title override
}

export function ChatHeader({
  isDarkMode,
  toggleDarkMode,
  useRAG,
  toggleRAG,
  onMenuOpen,
  title = "زرياب", // Default title
}: ChatHeaderProps) {
  return (
    <header
      className={cn(
        "border-b border-border/50 z-10 relative backdrop-blur-sm",
        "bg-background/90" // Slightly transparent background
      )}
    >
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between h-14">
        {" "}
        {/* Fixed height */}
        {/* Left Side: Menu Toggle (Mobile) & Logo/Title */}
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuOpen}
            className="md:hidden mr-2 text-foreground/80 hover:text-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo and Title */}
          <div className="flex items-center cursor-default">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mr-2.5 shadow",
                "bg-gradient-to-br from-primary via-primary/80 to-primary/70 text-primary-foreground"
              )}
            >
              <span className="font-arabic text-base font-medium">ز</span>
            </div>
            <div>
              <h1 className="text-base font-semibold font-arabic tracking-wide text-primary">
                {title}
              </h1>
              <p className="text-[11px] -mt-1 text-muted-foreground">
                Islamic Wisdom Guide
              </p>
            </div>
          </div>
        </div>
        {/* Right Side: RAG Toggle (Desktop) & Dark Mode Toggle */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* RAG Toggle - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <label
              htmlFor="rag-toggle"
              className="text-xs font-medium text-muted-foreground flex items-center cursor-pointer"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Sources
            </label>
            <Switch
              id="rag-toggle"
              checked={useRAG}
              onCheckedChange={toggleRAG}
              aria-label={
                useRAG ? "Sources Mode Enabled" : "Sources Mode Disabled"
              }
            />
          </div>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="text-foreground/80 hover:text-foreground"
            aria-label={
              isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
