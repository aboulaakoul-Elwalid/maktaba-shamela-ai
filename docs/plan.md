# Frontend Development Roadmap: Maktaba Shamela AI Chat UI

**Current Date:** April 29, 2025
**Project:** `maktaba-shamela-ai` (Frontend)
**Goal:** Evolve the current chat interface into a robust, real-time application using direct backend communication (SSE via `fetch`) and well-structured state management.

---

## I. Current State Analysis (As of April 29, 2025)

- **UI Foundation:** Shadcn UI, Core chat components (`ChatInterface`, `MessageBubble`, `MessageInput`).
- **State Management:** `AuthContext` (functional but uses mock login), `useChat` (needs streaming logic), Local State in `ChatInterface`.
- **Data Flow (Problematic):**
  1.  Input -> `ChatInterface.handleSendMessage`
  2.  `EventSource` attempts `GET` to FastAPI `/chat/messages/stream`.
  3.  Backend rejects `GET` with `405 Method Not Allowed` because it expects `POST`.
  4.  Authentication uses a mock token, causing backend validation errors (`401`).
- **Key Issues:**
  - Frontend streaming uses `EventSource` (`GET`), but backend requires `POST`.
  - Mock authentication token is invalid.

---

## II. Proposed Development Roadmap

### Phase 1: State Management & Logic Refactoring (Mostly Done)

- **Goal:** Centralize chat-related state and logic.
- **Tasks:**
  - **Enhance `useChat` Hook ([`hooks/use-chat.ts`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\hooks\use-chat.ts)):** (Partially done - history loading added)
    - Move `messages`, `isLoading`, `error` state management.
    - Move the core `sendMessage` logic (including streaming) into `useChat`.
    - Add state for `currentConversationId`, `isLoadingHistory`.
    - Expose necessary state and functions.
  - **Refactor `ChatInterface` ([`src/components/chat/chat-interface.tsx`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat\chat-interface.tsx)):** (Done)
    - Consume `useChat`. Remove local state. Delegate sending.
  - **Integrate `AuthContext`:** (Done - `useChat` reads from `localStorage`)
  - **Define Types:** (Done)

### Phase 2: Implement Direct Backend Streaming (SSE via Fetch POST) & Real Auth

- **Goal:** Fix streaming incompatibility and implement real authentication.
- **Tasks:**
  - **Modify `sendMessage` in `useChat`:**
    - **Replace `EventSource` with `fetch` using `POST`** targeting the FastAPI stream URL (`/chat/messages/stream`).
    - Send `content`, `use_rag`, `conversation_id` (if authenticated) in the **POST request body** (JSON).
    - Include `Authorization: Bearer ${token}` header for authenticated requests.
    - **Manually process the `ReadableStream` response body:**
      - Use `response.body.getReader()` to read `Uint8Array` chunks.
      - Decode chunks to text.
      - Buffer and parse text line-by-line to extract SSE events (`event: ...`, `data: ...`).
      - Update `messages` state incrementally based on `chunk` events.
      - Update the AI message placeholder with `sources`, final `message_id`, and handle `conversation_id` updates based on parsed SSE events.
      - Manage `isLoading` and `error` state based on stream progress and errors.
      - Implement stream cancellation/cleanup logic (e.g., using `AbortController`).
  - **Implement Real Login in `AuthContext`:**
    - Modify the `login` function to make a real `POST` request to the backend `/auth/login` endpoint.
    - Handle the response, storing the _real_ JWT in `localStorage`.
    - Ensure `checkAuth` correctly parses the real token and fetches conversations.
  - **(Keep) Remove Proxy:** Delete `src/app/api/chat/route.ts` (if still present).
  - **Configuration:** Ensure `API_CONFIG.BACKEND_URL` is correct.

### Phase 3: UI/UX Enhancements & Conversation Management

- **Goal:** Improve user feedback and add features for managing conversations and registration.
- **Tasks:**
  - **Implement Registration:**
    - Create a Register UI (e.g., `RegisterDialog.tsx` similar to `LoginDialog.tsx`).
    - Modify the `register` function in `AuthContext` to make a real `POST` request to the backend `/auth/register` endpoint.
    - Handle success (e.g., show message, redirect to login) and errors.
  - **Error Handling:** Display errors from `useChat` and `AuthContext` state (e.g., using `Alert` or `Toast`).
  - **Reference Display:** Ensure `MessageBubble` correctly displays references/sources.
  - **Conversation Sidebar:** (Implemented - needs testing with real data)
    - Test fetching and displaying conversation list (`GET /chat/conversations`).
    - Test selecting conversations and loading history (`GET /chat/conversations/{id}/messages`).
    - Test "New Chat" button functionality.
  - **Scroll Handling:** Refine scroll-to-bottom behavior.

### Phase 4: Testing and Refinement

- **Goal:** Ensure stability, performance, and code quality.
- **Tasks:**
  - Component/Integration Testing.
  - Cross-Browser/Device Testing.
  - Performance Profiling.
  - Code Review & Cleanup.

---

This roadmap provides a structured approach. The immediate next steps are **Phase 2: Modify `sendMessage` to use `fetch` POST for streaming** and **Implement Real Login in `AuthContext**.
