import { cn } from "@/lib/utils";

export function ChatLoadingIndicator() {
  return (
    <div className="flex space-x-1.5 items-center h-6">
      <div
        className={cn("w-2 h-2 rounded-full bg-primary animate-pulse-dots")}
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className={cn("w-2 h-2 rounded-full bg-primary animate-pulse-dots")}
        style={{ animationDelay: "200ms" }}
      ></div>
      <div
        className={cn("w-2 h-2 rounded-full bg-primary animate-pulse-dots")}
        style={{ animationDelay: "400ms" }}
      ></div>
    </div>
  );
}
