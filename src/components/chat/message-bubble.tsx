import React from "react";
import { cn } from "@/lib/utils"; // This is correct if lib is inside src folder
// OR use this if lib is at the root level
// import { cn } from "../../lib/utils";

// Fix these imports by removing the redundant "src"
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion } from "framer-motion";
// You'll need to install framer-motion

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  references?: string[];
  timestamp?: Date;
  isLast?: boolean;
}

export function MessageBubble({
  content,
  isUser,
  references,
  timestamp,
  isLast = false,
}: MessageBubbleProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full mb-6 last:mb-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 mr-3 mt-1">
          <Avatar className="h-8 w-8 border border-border">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10">
              <span className="text-xs font-medium text-primary">A</span>
            </div>
          </Avatar>
        </div>
      )}

      <div
        className={cn("flex flex-col", isUser ? "items-end" : "items-start")}
      >
        <div
          className={cn(
            "px-4 py-3 max-w-[85%] md:max-w-[75%] rounded-xl shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-muted text-foreground rounded-bl-none border border-border"
          )}
        >
          <div className="prose prose-sm dark:prose-invert">{content}</div>
        </div>

        {timestamp && (
          <span className="text-[11px] text-muted-foreground mt-1 px-2">
            {new Intl.DateTimeFormat("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }).format(timestamp)}
          </span>
        )}

        {references && references.length > 0 && (
          <Collapsible
            open={isExpanded}
            onOpenChange={setIsExpanded}
            className="mt-2 w-full max-w-[85%] md:max-w-[75%]"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center text-xs px-2 h-6 text-muted-foreground"
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
              <div className="bg-accent/50 rounded-lg border border-border p-2 text-xs">
                <p className="font-medium mb-1 text-muted-foreground">
                  Sources:
                </p>
                <ul className="space-y-1">
                  {references.map((ref, index) => (
                    <li key={index} className="flex items-start">
                      <ExternalLink className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
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
        <div className="flex-shrink-0 ml-3 mt-1">
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
