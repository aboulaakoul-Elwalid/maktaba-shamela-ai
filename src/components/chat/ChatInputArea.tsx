import React, { useRef, useEffect } from "react";
import { Send, Loader2, BookOpen, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputAreaProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  conversationId: string | null;
  useRAG: boolean;
  onNewChat: () => void; // Added handlers for desktop buttons
  onClearChat: () => void;
}

export function ChatInputArea({
  input,
  setInput,
  handleSubmit,
  handleKeyDown,
  isLoading,
  conversationId,
  useRAG,
  onNewChat,
  onClearChat,
}: ChatInputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset
      const scrollHeight = textareaRef.current.scrollHeight;
      // Use min-height defined in class (52px) + scrollHeight, capped at max-height (120px)
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div
      className={cn(
        "border-t px-4 pt-4 pb-3 md:pb-4 relative z-10 backdrop-blur-sm",
        "bg-background/95 border-border/50 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
      )}
    >
      {/* Desktop Buttons (New Chat, Clear Chat) */}
      <div className="hidden md:flex items-center justify-center mb-3 space-x-3">
        <Button
          variant="ghost" // Custom variant or style directly
          size="sm"
          onClick={onNewChat}
          disabled={isLoading}
          className="text-xs text-primary hover:bg-primary/10"
        >
          <Plus className="h-3 w-3 mr-1" />
          New Chat
        </Button>
        <Button
          variant="outline" // Use standard outline
          size="sm"
          onClick={onClearChat}
          disabled={isLoading}
          className="text-xs"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear Chat
        </Button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative flex items-end">
          {" "}
          {/* Use flex to align button */}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isLoading
                ? "Ziryab is thinking..."
                : useRAG
                ? "Ask about Islamic wisdom (sources enabled)..."
                : "Ask about Islamic traditions..."
            }
            className={cn(
              "min-h-[52px] max-h-[120px] pr-12 pl-4 py-3 rounded-xl resize-none",
              "transition-all duration-200 text-sm md:text-base font-sans",
              "bg-background/80 dark:bg-muted/40 border border-input focus:border-primary focus:ring-1 focus:ring-ring",
              "placeholder:text-muted-foreground/60",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
            rows={1}
            disabled={isLoading || !conversationId}
            aria-label="Chat input"
          />
          {/* Send Button */}
          <Button
            type="submit"
            size="icon"
            className={cn(
              "absolute right-2.5 bottom-[9px] h-9 w-9 rounded-full transition-all duration-200",
              "flex items-center justify-center shadow-sm",
              input.trim() && !isLoading
                ? "bg-primary text-primary-foreground hover:bg-primary/90 scale-100"
                : "bg-muted text-muted-foreground scale-95 cursor-not-allowed"
            )}
            disabled={!input.trim() || isLoading || !conversationId}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* RAG Mode Indicator Text (Below Input) */}
        <div className="mt-2 text-[11px] text-center flex items-center justify-center text-muted-foreground/80">
          <BookOpen
            className={cn(
              "h-2.5 w-2.5 mr-1 inline",
              useRAG ? "text-primary" : ""
            )}
          />
          <span>{useRAG ? "Sources mode on" : "Standard mode"}</span>
          <span className="mx-1.5 opacity-50">·</span>
          <span>Ziryab AI</span>
        </div>
      </form>
    </div>
  );
}
