import React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";
import { Markdown } from "@/components/ui/markdown";
import { SkeletonLoader } from "./SkeletonLoader";

interface MessageBubbleProps {
  id: string;
  content: string;
  isUser: boolean;
  isLoading?: boolean;
  references?: string[];
  timestamp?: Date;
}

export function MessageBubble({
  id,
  content,
  isUser,
  isLoading = false,
  references,
  timestamp,
}: MessageBubbleProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const bubbleVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.2, delay: 0.1 },
    },
  };

  return (
    <motion.div
      key={id}
      layout
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 mr-3 mt-1 self-start">
          <Avatar className="h-8 w-8 border border-border">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10">
              <span className="text-xs font-medium text-primary">AI</span>
            </div>
          </Avatar>
        </div>
      )}

      <div
        className={cn(
          "flex flex-col max-w-[85%] md:max-w-[75%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "px-4 py-3 rounded-xl shadow-sm relative overflow-hidden",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-muted text-foreground rounded-bl-none border border-border"
          )}
        >
          <AnimatePresence initial={false} mode="wait">
            {isLoading ? (
              <motion.div
                key="loader"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <SkeletonLoader className="w-48" />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Markdown>{content || ""}</Markdown>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {timestamp && !isLoading && (
          <span className="text-[11px] text-muted-foreground mt-1 px-1">
            {new Intl.DateTimeFormat("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }).format(timestamp)}
          </span>
        )}

        {references && references.length > 0 && !isLoading && (
          <Collapsible
            open={isExpanded}
            onOpenChange={setIsExpanded}
            className="mt-2 w-full"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center text-xs px-2 h-6 text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <ChevronUp className="mr-1 h-3 w-3" />
                ) : (
                  <ChevronDown className="mr-1 h-3 w-3" />
                )}
                {isExpanded ? "Hide sources" : "Show sources"} (
                {references.length})
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-1">
              <div className="bg-background/50 rounded-lg border border-border p-2 text-xs">
                <p className="font-medium mb-1 text-muted-foreground">
                  Sources:
                </p>
                <ul className="space-y-1">
                  {references.map((ref, index) => (
                    <li
                      key={index}
                      className="flex items-start text-foreground/80"
                    >
                      <ExternalLink className="h-3 w-3 mr-1.5 mt-0.5 flex-shrink-0 text-primary/70" />
                      <span>{ref}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 ml-3 mt-1 self-start">
          <Avatar className="h-8 w-8 border border-border">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
              <span className="text-xs font-medium">You</span>
            </div>
          </Avatar>
        </div>
      )}
    </motion.div>
  );
}
