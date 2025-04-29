# Frontend Development Roadmap: Maktaba Shamela AI Chat UI

**Current Date:** April 29, 2025

**Project:** `maktaba-shamela-ai` (Frontend)

**Goal:** Evolve the current chat interface into a robust, real-time application using direct backend communication (SSE) and well-structured state management.

---

## I. Current State Analysis (As of April 29, 2025)

- **UI Foundation:**
  - Shadcn UI components are integrated ([`src/components/ui/`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\ui)).
  - Core chat components exist:
    - [`ChatInterface`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat\chat-interface.tsx): Main chat view, currently holds significant state and logic.
    - [`MessageBubble`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat\message-bubble.tsx): Displays individual messages.
    - [`MessageInput`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat\message-input.tsx): Handles user input and RAG toggle.
- **State Management:**
  - `AuthContext` ([`src/contexts/`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\contexts)): Manages user authentication (token, user data). Seems functional.
  - `ChatContext` ([`src/contexts/`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\contexts)) & `useChat` ([`hooks/use-chat.ts`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\hooks\use-chat.ts)): Intended for chat state but currently minimal; core logic resides in `ChatInterface`.
  - Local State (`useState` in [`ChatInterface`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat\chat-interface.tsx)): Manages `messages`, `isLoading`, input values, scroll state.
- **Data Flow (Problematic):**
  1.  Input -> `ChatInterface.handleSendMessage`
  2.  `fetch` to Next.js API route `/api/chat` ([`src/app/api/chat/route.ts`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\app\api\chat\route.ts))
  3.  `/api/chat` proxies request to FastAPI (`/chat/messages`)
  4.  `/api/chat` waits for _complete_ JSON response from FastAPI.
  5.  `/api/chat` sends complete JSON back to `ChatInterface`.
  6.  `ChatInterface` updates `messages` state with the full AI response.
- **Key Issue:** The `/api/chat` proxy prevents real-time streaming, causing UI lag and adding unnecessary overhead.

---

## II. Proposed Development Roadmap

### Phase 1: State Management & Logic Refactoring

- **Goal:** Centralize chat-related state and logic, making `ChatInterface` primarily responsible for rendering and user interaction delegation.
- **Tasks:**
  - **Enhance `useChat` Hook ([`hooks/use-chat.ts`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\hooks\use-chat.ts)):**
    - Move `messages`, `isLoading`, `error` state management from `ChatInterface` into `useChat`.
    - Move the core `handleSendMessage` logic (including the future `EventSource` implementation) into `useChat`.
    - Add state for `currentConversationId`.
    - Expose necessary state and functions (e.g., `messages`, `isLoading`, `error`, `sendMessage`, `currentConversationId`, `setCurrentConversationId`).
  - **Refactor `ChatInterface` ([`src/components/chat/chat-interface.tsx`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat\chat-interface.tsx)):**
    - Consume the enhanced `useChat` hook.
    - Remove local state for `messages`, `isLoading`, `error`.
    - Delegate message sending to the `sendMessage` function from `useChat`.
    - Pass necessary props (like `isLoading`) down to `MessageInput`.
  - **Integrate `AuthContext`:** Ensure `useChat` can access the `authToken` from `AuthContext` for API calls.
  - **Define Types:** Solidify TypeScript types for `Message`, `Source`, `Conversation` in [`types/`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\types). Ensure `Message` includes `references`.

### Phase 2: Implement Direct Backend Streaming (SSE)

- **Goal:** Replace the proxy API call with direct `EventSource` communication to the FastAPI streaming endpoint.
- **Tasks:**
  - **Verify Backend:** Confirm FastAPI endpoint (`/chat/messages/stream`) is ready and handles SSE events (`chunk`, `sources`, `conversation_id`, `message_id`, `error`, `end`) and token authentication (likely via query parameter) as described in [`backend_structure.md`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\docs\backend_structure.md).
  - **Modify `sendMessage` in `useChat`:**
    - Remove the `fetch` call to `/api/chat`.
    - Add user message and AI placeholder to `messages` state immediately.
    - Instantiate `EventSource` targeting the FastAPI stream URL (including query params for `content`, `conversationId`, `token`).
    - Implement `EventSource` listeners (`onopen`, `onerror`, `addEventListener` for `chunk`, `sources`, `conversation_id`, `message_id`, `error`, `end`).
    - Update `messages` state incrementally based on `chunk` events.
    - Update the AI message placeholder with `sources`, final `message_id` (optional), and handle `conversation_id` updates.
    - Manage `isLoading` and `error` state based on SSE events.
    - Implement `EventSource` cleanup (`sse.close()`) using `useRef` and `useEffect` within the hook.
  - **Remove Proxy:** Delete `src/app/api/chat/route.ts`.
  - **Configuration:** Ensure `API_CONFIG.BACKEND_URL` in [`src/config/api.ts`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\config\api.ts) is correct.

### Phase 3: UI/UX Enhancements & Conversation Management

- **Goal:** Improve user feedback and add features for managing conversations.
- **Tasks:**
  - **Error Handling:** Display errors from the `error` state (e.g., using Shadcn `Toast` via [`hooks/use-toast.ts`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\hooks\use-toast.ts) or an `Alert` within the chat).
  - **Reference Display:** Ensure [`MessageBubble`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat\message-bubble.tsx) correctly displays references/sources, potentially linking them.
  - **(Optional) Conversation Sidebar:**
    - Create a new component (e.g., `ConversationList`) potentially using [`Sidebar`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\ui\sidebar.tsx).
    - Fetch conversation list (`GET /chat/conversations`) for logged-in users (requires new function in `useChat` or a separate hook).
    - Allow users to select a conversation, updating `currentConversationId` in `useChat`.
    - Implement fetching message history (`GET /chat/conversations/{id}/messages`) when a conversation is selected.
    - Add a "New Chat" button (potentially calling `POST /chat/conversations`).
  - **Scroll Handling:** Refine scroll-to-bottom behavior and the "New messages" indicator in [`ChatInterface`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat\chat-interface.tsx).

### Phase 4: Testing and Refinement

- **Goal:** Ensure stability, performance, and code quality.
- **Tasks:**
  - **Component Testing:** Add unit tests for key components and hooks (e.g., `useChat`, `MessageBubble`).
  - **Integration Testing:** Test the end-to-end flow (input -> SSE -> UI update) for both anonymous and authenticated users.
  - **Cross-Browser/Device Testing:** Verify layout and functionality on different screen sizes (using [`hooks/use-mobile.tsx`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\hooks\use-mobile.tsx) where relevant).
  - **Performance Profiling:** Check for rendering bottlenecks, especially during streaming updates.
  - **Code Review & Cleanup:** Refactor code for clarity, consistency, and adherence to best practices.

---

This roadmap provides a structured approach. We can adjust priorities and tasks within each phase as development progresses. The next logical step is to start **Phase 1: State Management & Logic Refactoring**.
