// "use client";

// import { useRouter } from "next/navigation";
// import { PlusIcon } from "@/components/icons";
// import { SidebarHistory } from "@/components/sidebar-history";
// import { SidebarUserNav } from "@/components/sidebar-user-nav";
// import { Button } from "@/components/ui/button";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenu,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import Link from "next/link";
// import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
// import { useChat } from "@/contexts/ChatContext";
// import { Moon, Sun, Sparkles } from "lucide-react";
// import { useTheme } from "@/components/ui/theme-provider";

// // Make the User interface more flexible to accommodate different auth providers
// interface User {
//   id?: string;
//   name?: string;
//   email?: string;
//   image?: string;
//   [key: string]: any; // Allow additional properties from auth providers
// }

// export function AppSidebar({ user }: { user?: User | null }) {
//   const router = useRouter();
//   const { setOpenMobile } = useSidebar();
//   const {
//     createNewConversation, // FIXED: changed from createConversation
//     useRAG,
//     toggleRAG,
//     isCreatingConversation, // Added loading state for button
//   } = useChat();
//   const { setTheme, theme } = useTheme();

//   const handleNewChat = async () => {
//     try {
//       // Prevent double clicks
//       if (isCreatingConversation) return;

//       const newChatId = await createNewConversation();
//       if (newChatId) {
//         router.push(`/chat/${newChatId}`);
//         setOpenMobile(false);
//       }
//     } catch (error) {
//       console.error("Failed to create new conversation:", error);
//     }
//   };

//   const toggleTheme = () => {
//     setTheme(theme === "dark" ? "light" : "dark");
//   };

//   // Safely check if user exists and has valid data
//   const hasUser = !!user && (user.id || user.email || user.name);

//   return (
//     <Sidebar className="group-data-[side=left]:border-r-0">
//       <SidebarHeader>
//         <SidebarMenu>
//           <div className="flex flex-row justify-between items-center">
//             <Link
//               href="/"
//               onClick={() => {
//                 setOpenMobile(false);
//               }}
//               className="flex flex-row gap-3 items-center"
//             >
//               <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
//                 Ziryab
//               </span>
//             </Link>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   type="button"
//                   className="p-2 h-fit"
//                   onClick={handleNewChat}
//                   disabled={isCreatingConversation}
//                 >
//                   <PlusIcon />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent align="end">New Chat</TooltipContent>
//             </Tooltip>
//           </div>
//         </SidebarMenu>
//       </SidebarHeader>

//       <SidebarContent>
//         <SidebarHistory user={user} />
//       </SidebarContent>

//       <SidebarFooter>
//         <div className="px-3 py-2">
//           {/* Settings Options */}
//           <div className="space-y-2 mb-3">
//             {/* Theme Toggle */}
//             <div className="flex items-center justify-between py-1">
//               <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                 {theme === "dark" ? (
//                   <Moon className="h-4 w-4" />
//                 ) : (
//                   <Sun className="h-4 w-4" />
//                 )}
//                 <span>Theme</span>
//               </div>
//               <Button variant="ghost" size="sm" onClick={toggleTheme}>
//                 {theme === "dark" ? "Dark" : "Light"}
//               </Button>
//             </div>

//             {/* RAG Toggle */}
//             <div className="flex items-center justify-between py-1">
//               <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                 <Sparkles className="h-4 w-4" />
//                 <span>Knowledge Base</span>
//               </div>
//               <Button variant="ghost" size="sm" onClick={toggleRAG}>
//                 {useRAG ? "On" : "Off"}
//               </Button>
//             </div>
//           </div>

//           {hasUser && <SidebarUserNav user={user} />}
//         </div>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }

// "use client";

// import { useRouter } from "next/navigation"; // Keep for potential non-chat navigation
// import { PlusIcon } from "@/components/icons";
// import { SidebarHistory } from "@/components/sidebar-history"; // Assuming this path is correct
// import { SidebarUserNav } from "@/components/sidebar-user-nav"; // Assuming this path is correct
// import { Button } from "@/components/ui/button"; // Assuming this path is correct
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenu,
//   useSidebar,
// } from "@/components/ui/sidebar"; // Assuming this path is correct
// import Link from "next/link";
// import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"; // Assuming relative path
// import { useChat } from "@/contexts/ChatContext"; // Use the verified context
// import { Moon, Sun, Sparkles } from "lucide-react";
// import { useTheme } from "next-themes"; // Use next-themes hook

// // User interface (keep flexible)
// interface User {
//   id?: string;
//   name?: string;
//   email?: string;
//   image?: string;
//   [key: string]: any;
// }

// export function AppSidebar({ user }: { user?: User | null }) {
//   const router = useRouter(); // Keep for potential future non-chat links
//   const { setOpen: setSidebarOpen } = useSidebar(); // Get sidebar state setter

//   // Get required state and actions from ChatContext
//   const {
//     conversations,
//     currentConversationId,
//     isConversationsLoading, // To potentially show loading in history
//     createNewConversation, // Use the context action
//     useRAG,
//     toggleRAG,
//     isCreatingConversation, // Disable button while creating
//   } = useChat();

//   const { setTheme, theme } = useTheme();

//   const handleNewChat = async () => {
//     console.log("[AppSidebar] New Chat clicked.");
//     if (isCreatingConversation) return; // Prevent double clicks

//     try {
//       // Call the context action - it handles state update & selection
//       const newChatId = await createNewConversation();

//       // **Routing is now handled by the Page component watching currentConversationId**
//       // We don't navigate here anymore.
//       // if (newChatId) {
//       //   // router.push(`/chat/${newChatId}`); // REMOVED
//       // }

//       setSidebarOpen(false); // Close mobile sidebar if open
//     } catch (error) {
//       // Error is already handled and toasted within the context
//       console.error("[AppSidebar] createNewConversation failed:", error);
//     }
//   };

//   const toggleTheme = () => {
//     setTheme(theme === "dark" ? "light" : "dark");
//   };

//   const hasUser = !!user && (user.id || user.email || user.name);

//   return (
//     // Using Sidebar component from ui/sidebar
//     <Sidebar className="group-data-[side=left]:border-r-0">
//       <SidebarHeader>
//         <SidebarMenu>
//           <div className="flex flex-row justify-between items-center">
//             {/* Link to home or base chat page */}
//             <Link
//               href="/chat" // Link to base chat page
//               onClick={() => setSidebarOpen(false)}
//               className="flex flex-row gap-3 items-center"
//             >
//               <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
//                 Ziryab {/* Or your App Name */}
//               </span>
//             </Link>
//             {/* New Chat Button */}
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   type="button"
//                   className="p-2 h-fit"
//                   onClick={handleNewChat}
//                   disabled={isCreatingConversation} // Disable while creating
//                   aria-label="New Chat"
//                 >
//                   <PlusIcon />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent align="end">New Chat</TooltipContent>
//             </Tooltip>
//           </div>
//         </SidebarMenu>
//       </SidebarHeader>

//       <SidebarContent>
//         {/* Pass necessary props from context to SidebarHistory */}
//         <SidebarHistory
//           userId={user?.id || "anonymous"} // Pass user ID for potential filtering if needed later
//           conversations={conversations}
//           currentConversationId={currentConversationId}
//           isLoading={isConversationsLoading}
//         />
//       </SidebarContent>

//       <SidebarFooter>
//         <div className="px-3 py-2">
//           {/* Settings Options */}
//           <div className="space-y-2 mb-3">
//             {/* Theme Toggle */}
//             <div className="flex items-center justify-between py-1">
//               <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                 {theme === "dark" ? (
//                   <Moon className="h-4 w-4" />
//                 ) : (
//                   <Sun className="h-4 w-4" />
//                 )}
//                 <span>Theme</span>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8"
//                 onClick={toggleTheme}
//                 aria-label="Toggle Theme"
//               >
//                 {theme === "dark" ? (
//                   <Sun className="h-4 w-4" />
//                 ) : (
//                   <Moon className="h-4 w-4" />
//                 )}
//               </Button>
//             </div>

//             {/* RAG Toggle */}
//             <div className="flex items-center justify-between py-1">
//               <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                 <Sparkles className="h-4 w-4" />
//                 <span>Knowledge Base</span>
//               </div>
//               <Button variant="ghost" size="sm" onClick={toggleRAG}>
//                 {useRAG ? "On" : "Off"}
//               </Button>
//             </div>
//           </div>

//           {/* User Navigation */}
//           {hasUser && <SidebarUserNav user={user} />}
//         </div>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }

"use client";

import { useRouter } from "next/navigation";
import { PlusIcon } from "@/components/icons";
import { SidebarHistory } from "@/components/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useChat } from "@/contexts/ChatContext";
import { Sparkles } from "lucide-react";
import { ClientSafeThemeToggle } from "./ui/client-safe-theme";

// Make the User interface more flexible
interface User {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  [key: string]: any; // Allow additional properties
}

export function AppSidebar({ user }: { user?: User | null }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const { createNewConversation, useRAG, toggleRAG, isCreatingConversation } =
    useChat();

  const handleNewChat = async () => {
    try {
      // Prevent double clicks
      if (isCreatingConversation) return;

      const newChatId = await createNewConversation();
      if (newChatId) {
        router.push(`/chat/${newChatId}`);
        setOpenMobile(false);
      }
    } catch (error) {
      console.error("Failed to create new conversation:", error);
    }
  };

  // Safely check if user exists and has valid data
  const hasUser = !!user && (user.id || user.email || user.name);

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>{/* Header content remains the same */}</SidebarHeader>

      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>

      <SidebarFooter>
        <div className="px-3 py-2">
          {/* Replace the theme toggle with client-safe version */}
          <div className="space-y-2 mb-3">
            {/* Theme Toggle - NOW USING CLIENT-SAFE COMPONENT */}
            <ClientSafeThemeToggle />

            {/* RAG Toggle */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>Knowledge Base</span>
              </div>
              <Button variant="ghost" size="sm" onClick={toggleRAG}>
                {useRAG ? "On" : "Off"}
              </Button>
            </div>
          </div>

          {hasUser && <SidebarUserNav user={user} />}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
