Okay, let's re-analyze the current maktaba-shamela-ai project and create a clear plan to implement the direct streaming architecture.

**Current State Analysis (maktaba-shamela-ai)**

1.  **UI Components:** You have successfully integrated the Shadcn UI components into `src/components/ui/`. Core chat components like [`ChatInterface`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat\chat-interface.tsx), [`MessageBubble`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat\message-bubble.tsx), and [`MessageInput`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat\message-input.tsx) exist and seem to handle the basic display structure.
2.  **State Management:**
    - **`AuthContext`:** Manages user authentication state (user data, token, login/logout functions). This seems functional and necessary.
    - **`ChatContext`:** Intended to manage chat state (messages, conversations, loading/error states, RAG toggle, API interactions). It provides hooks like `useChat`.
    - **Local State:** [`ChatInterface`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat\chat-interface.tsx) also uses local `useState` for input fields and potentially UI toggles.
3.  **Data Flow (Current):**
    - User types in [`MessageInput`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat\message-input.tsx).
    - On submit, [`ChatInterface`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat\chat-interface.tsx) likely calls a function from `useChat` (e.g., `sendMessage`).
    - The `sendMessage` function (within `ChatContext`) constructs the user message, updates local state immediately, and then makes a `fetch` request to the Next.js API route `/api/chat` ([`src/app/api/chat/route.ts`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\app\api\chat\route.ts)).
    - The `/api/chat` route acts as a **proxy**, forwarding the request (with auth token if available) to your FastAPI backend (`/chat/messages` or `/chat/anonymous`).
    - `/api/chat` **waits** for the _complete_ JSON response from FastAPI.
    - `/api/chat` sends the complete JSON response back to the frontend (`ChatContext`).
    - `ChatContext` parses the response and updates the `messages` state with the complete AI message.
4.  **Problem:** The use of the `/api/chat` proxy prevents real-time streaming from FastAPI to the UI, leading to perceived lag as the user waits for the full response. It also adds unnecessary overhead (latency, Vercel costs).

**Proposed Solution & Plan**

**Goal:** Implement direct Frontend-to-FastAPI streaming using Server-Sent Events (SSE) via the `EventSource` API, removing the `/api/chat` proxy for chat messages.

**Phase 1: Backend Preparation (Assumption)**

- **(You need to ensure this is done in your FastAPI backend)**
- Create new streaming endpoints in FastAPI (e.g., `/chat/stream/messages` for authenticated users, `/chat/stream/anonymous` for anonymous).
- These endpoints must:
  - Accept necessary parameters (e.g., `conversation_id`, user query).
  - Handle authentication (e.g., read `Authorization: Bearer` header or potentially a token from a query parameter if header passing is difficult with `EventSource`).
  - Perform the RAG process (retrieve context, call LLM).
  - Use FastAPI's `StreamingResponse` with `media_type="text/event-stream"`.
  - `yield` data chunks formatted as SSE events (e.g., `yield f"data: {json.dumps({'type': 'content', 'chunk': '...'})}\n\n"`). Define event types like `content`, `reference`, `error`, `done`.

**Phase 2: Frontend Refactoring (maktaba-shamela-ai)**

1.  **Modify `ChatContext` (or wherever `sendMessage` logic resides):**

    - Locate the function that currently `fetch`es `/api/chat`.
    - **Remove the `fetch` call to `/api/chat`.**
    - **Instantiate `EventSource`:**
      - Construct the URL for your _FastAPI streaming endpoint_ (e.g., `${API_CONFIG.BACKEND_URL}/chat/stream/messages?conversationId=${convId}&query=${encodeURIComponent(userMessageContent)}`).
      - **Authentication:** Since `EventSource` doesn't easily send headers, the simplest (though less ideal) method is often passing the token as a query parameter: `&token=${authToken}`. Ensure your FastAPI endpoint can read this. _Alternatively, investigate libraries that wrap `EventSource` or use WebSockets if query param auth is unacceptable._
      - Create the `EventSource`: `const sse = new EventSource(url);`
    - **Add Event Listeners:**
      - `sse.onopen = () => { setIsLoading(true); /* Clear previous errors */ };`
      - `sse.onerror = (error) => { console.error("SSE Error:", error); setIsLoading(false); setError("Stream connection failed."); sse.close(); };`
      - `sse.addEventListener('message', (event) => { /* Handle generic messages if needed */ });`
      - **Custom Event Listeners (Recommended):** Add listeners based on the event types your backend sends (e.g., `content`, `reference`, `done`, `error_detail`).
        - `sse.addEventListener('content', (event) => { const data = JSON.parse(event.data); appendToLastMessage(data.chunk); });`
        - `sse.addEventListener('reference', (event) => { const data = JSON.parse(event.data); addReferencesToLastMessage(data.references); });`
        - `sse.addEventListener('done', (event) => { setIsLoading(false); sse.close(); });`
        - `sse.addEventListener('error_detail', (event) => { const data = JSON.parse(event.data); setError(data.detail); setIsLoading(false); sse.close(); });`
    - **State Updates:**
      - When starting the stream, add an initial empty AI message placeholder to the `messages` state.
      - The `appendToLastMessage` function needs to find the last AI message in the state and append the `chunk` to its `content`.
      - `addReferencesToLastMessage` should add references similarly.
      - Update `isLoading` and `error` states based on SSE events.
    - **Cleanup:** Store the `sse` instance somewhere (e.g., a `useRef` in the context) so you can explicitly call `sse.close()` if the user navigates away or starts a new message before the stream finishes.

2.  **Remove Next.js Proxy Route:**

    - Delete the file route.ts. It's no longer needed for streaming chat.
    - _(Optional)_ Keep other API routes (like `/api/retrieval` if used elsewhere, or potential future routes for user management) if they serve distinct purposes.

3.  **Adjust UI Components:**
    - [`MessageBubble`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat\message-bubble.tsx): Ensure it renders correctly even when `content` is being updated incrementally.
    - [`TypingIndicator`](c:\Users\walid\vs code testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat\typing-indicator.tsx): Display this component based on the `isLoading` state managed by the `ChatContext` during the stream.

**Implementation Start:**

Let's begin by modifying the `sendMessage` logic. Show me the current implementation within your `ChatContext` (or wherever the call to `/api/chat` happens), and we can start replacing the `fetch` with `EventSource`.
