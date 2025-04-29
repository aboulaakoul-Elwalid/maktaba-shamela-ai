# Application Workflow Analysis

## Overview

The application consists of a Next.js frontend and interacts with a separate FastAPI backend service hosted at `https://server-maktaba-shamela.onrender.com`. The core functionality involves a chat interface where users send messages within conversations, authenticated via JWT Bearer tokens.

## Frontend Components

1.  **Chat API Route (`/api/chat/route.ts`)**:

    - Located at [`src/app/api/chat/route.ts`](c:\Users\walid\vs%20code%20testing\arabia\chat_ui_new\maktaba-shamela-ai\src\app\api\chat\route.ts).
    - Handles `POST` requests to `/api/chat`.
    - **Requires** `message`, `conversationId`, and `token` in the JSON request body.
    - Reads backend URL from [`src/config/api.ts`](c:\Users\walid\vs%20code%20testing\arabia\chat_ui_new\maktaba-shamela-ai\src\config\api.ts).
    - Sends a `POST` request to the backend's `/chat/messages` endpoint.
    - Uses `Authorization: Bearer <token>` header for backend authentication.
    - Sends `{"content": message, "conversation_id": conversationId}` as the body to the backend.
    - Includes error handling and logging.
    - Parses the backend response (expected: `{ "content": "...", "context": [...] }`) and returns `{ "message": ..., "references": ... }` to the client.

2.  **Configuration (`src/config/api.ts`)**:

    - Defines `API_CONFIG.BACKEND_URL` (corrected to `https://server-maktaba-shamela.onrender.com`).
    - `API_CONFIG.API_KEY` is no longer relevant for chat authentication.

3.  **Chat Interface Component (`src/components/chat-interface.tsx` or similar)**:

    - Responsible for rendering the chat UI.
    - Manages message state.
    - **Needs state management** for the user's JWT `token` and the current `conversation_id`. (Placeholders added).
    - Calls the frontend `/api/chat` endpoint, passing the `message`, `conversationId`, and `token`.

4.  **Other API Routes**:
    - [`/api/embed/route.ts`](c:\Users\walid\vs%20code%20testing\arabia\chat_ui_new\maktaba-shamela-ai\src\app\api\embed\route.ts): Likely needs updates for endpoint and authentication if used.
    - [`/api/retrieval/route.ts`](c:\Users\walid\vs%20code%20testing\arabia\chat_ui_new\maktaba-shamela-ai\src\app\api\retrieval\route.ts): Likely needs updates for endpoint and authentication if used.

## Backend Interaction (Actual, based on `test_api.bat`)

- The FastAPI backend is running at `https://server-maktaba-shamela.onrender.com`.
- **Authentication:**
  - `/auth/register` (POST): Registers new users.
  - `/auth/login` (POST): Authenticates users and provides a JWT `access_token`.
  - Subsequent authenticated requests require an `Authorization: Bearer <token>` header.
- **Chat Endpoints:**
  - `/chat/conversations` (POST): Creates a new conversation session. Requires authentication. Returns `{ "conversation_id": "..." }`.
  - `/chat/messages` (POST): Sends a message within a specific conversation. Requires authentication. Expects `{"content": "user message", "conversation_id": "..."}`. Returns the AI's response message (e.g., `{ "id": "...", "conversation_id": "...", "content": "...", "sender": "ai", "context": [...] }`). RAG functionality is handled here.
  - `/chat/conversations/{conversation_id}/messages` (GET): Retrieves all messages for a given conversation. Requires authentication.

## Current Status & Next Steps

- **Issue:** The frontend chat component was not sending the required `conversationId` and `token` to the `/api/chat` route, causing a 400 error.
- **Fix Applied:** Placeholders for `authToken` and `currentConversationId` state were added to [`src/components/chat-interface.tsx`](c:\Users\walid\vs%20code%20testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat-interface.tsx). The `fetch` call within `handleSendMessage` was updated to include these in the request body sent to `/api/chat`.
- **Next Steps:**
  1.  **Implement Real State Management:** Replace the placeholder state variables (`authToken`, `currentConversationId`) in [`src/components/chat-interface.tsx`](c:\Users\walid\vs%20code%20testing\arabia\chat_ui_new\maktaba-shamela-ai\src\components\chat-interface.tsx) with actual logic:
      - Implement user login/authentication to obtain and store the JWT `token`.
      - Implement logic to create a new conversation (call `/chat/conversations`) or retrieve an existing one to get the `conversation_id`.
  2.  **Verify Backend Response Parsing:** Double-check the response parsing logic in [`/api/chat/route.ts`](c:\Users\walid\vs%20code%20testing\arabia\chat_ui_new\maktaba-shamela-ai\src\app\api\chat\route.ts) (lines 53-63) to ensure it correctly extracts `content` and `context` (for references) based on the actual structure returned by the backend's `/chat/messages` endpoint.
  3.  **Address Backend Error:** Remember the backend error `'Chat' object is not callable` still needs to be fixed in the Python backend code.
