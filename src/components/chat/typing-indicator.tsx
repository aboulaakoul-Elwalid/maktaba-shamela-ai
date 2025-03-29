import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";

export function TypingIndicator() {
  return (
    <div className="flex w-full mb-6">
      <div className="flex-shrink-0 mr-3 mt-1">
        <Avatar className="h-8 w-8 border border-border">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10">
            <span className="text-xs font-medium text-primary">A</span>
          </div>
        </Avatar>
      </div>

      <div className="flex flex-col items-start">
        <div className="px-4 py-3 bg-muted text-foreground rounded-xl rounded-bl-none border border-border shadow-sm">
          <div className="flex items-center h-5">
            <div className="flex space-x-1.5">
              <motion.div
                className="w-2 h-2 rounded-full bg-foreground/40"
                animate={{ y: [0, -5, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: 0,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="w-2 h-2 rounded-full bg-foreground/40"
                animate={{ y: [0, -5, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: 0.2,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="w-2 h-2 rounded-full bg-foreground/40"
                animate={{ y: [0, -5, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: 0.4,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </div>
        <span className="text-[11px] text-muted-foreground mt-1 px-2">
          Generating response...
        </span>
      </div>
    </div>
  );
}
