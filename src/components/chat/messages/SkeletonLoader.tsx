import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  lineCount?: number;
  className?: string;
}

export function SkeletonLoader({
  lineCount = 3,
  className,
}: SkeletonLoaderProps) {
  return (
    <div className={cn("space-y-2 animate-pulse", className)}>
      {Array.from({ length: lineCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-3 rounded bg-muted/60", // Use a slightly transparent muted color
            i === lineCount - 1 ? "w-3/4" : "w-full" // Make last line shorter
          )}
        />
      ))}
    </div>
  );
}
