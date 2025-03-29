import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface MessageInputProps {
  onSendMessage: (content: string, useRAG: boolean) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function MessageInput({
  onSendMessage,
  placeholder = "Ask about Islamic studies...",
  isLoading = false,
}: MessageInputProps) {
  const [message, setMessage] = React.useState("");
  const [useRAG, setUseRAG] = React.useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    onSendMessage(message.trim(), useRAG);
    setMessage("");
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="border-t border-border bg-background px-4 py-4 shadow-lg"
    >
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="knowledge-base"
              checked={useRAG}
              onCheckedChange={setUseRAG}
            />
            <Label
              htmlFor="knowledge-base"
              className="text-xs text-muted-foreground flex items-center cursor-pointer"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Use knowledge base
            </Label>
          </div>
        </div>

        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            className="min-h-[60px] max-h-[200px] pr-12 py-3 resize-none text-base md:text-sm focus-visible:ring-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className={cn(
              "absolute right-2 bottom-2 h-8 w-8",
              !message.trim() && "opacity-50 cursor-not-allowed"
            )}
            disabled={!message.trim() || isLoading}
          >
            <SendIcon className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>

        <div className="text-[11px] text-center text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </form>
    </motion.div>
  );
}
