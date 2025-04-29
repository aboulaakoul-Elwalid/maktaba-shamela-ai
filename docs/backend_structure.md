# Arabia RAG API Documentation (Detailed Explanation)

## 1. Introduction

_(This section is straightforward - it just sets the stage.)_

**Base URL:** `http://localhost:8000` (This is the starting address for all API calls when you run the server locally).

## 2. Authentication: Who Are You?

Think of authentication like a security guard at a building entrance. Before letting someone into restricted areas, the guard needs to verify who they are. In web APIs, we often use **Tokens** for this.

### 2.1 Authentication Dependencies: The "Security Guards" in Code

FastAPI's Dependency Injection system is powerful. These functions are automatically run before your endpoint code executes, handling the authentication logic.

- **`get_current_user` (The Strict Guard):**
  - **Job:** Ensures only _valid, logged-in_ users can access an endpoint.
  - **Process:**
    1.  Looks for the `Authorization: Bearer <token>` header in the incoming request.
    2.  If no header or token is found, it immediately stops the request and sends back a `401 Unauthorized` error.
    3.  If a token is found, it tries to **decode** it using the `SECRET_KEY`.
    4.  It **verifies the signature** (was it really issued by us?).
    5.  It **checks the expiration time** (is this token still valid?).
    6.  If decoding, signature, or expiration fails, it stops the request (`401 Unauthorized`).
    7.  If the token is valid, it extracts the user ID (or other identifier) from the token's payload.
    8.  It might (and often should) query the database (like Appwrite `Account.get`) to confirm this user ID still exists and is active.
    9.  If everything checks out, it returns a `UserResponse` object containing the user's details, which the endpoint code can then use.
  - **Use Case:** Protects endpoints that absolutely require a logged-in user (e.g., viewing personal profile, accessing saved conversations).
- **`get_user_or_anonymous` (The Flexible Guard):**
  - **Job:** Allows _both_ logged-in users and anonymous visitors, but tells the endpoint _which_ type of user it is.
  - **Process:**
    1.  It first _tries_ to run the `get_current_user` logic.
    2.  If `get_current_user` succeeds (valid token found), it returns the authenticated `UserResponse` object (just like `get_current_user`).
    3.  If `get_current_user` fails (no token, invalid token, etc.), instead of stopping the request with a 401 error, it _catches_ that failure.
    4.  It then creates a _temporary_ `UserResponse` object specifically for this request. This object will have:
        - A temporary, unique ID (like `user_id="anonymous_..."`).
        - A flag set to `is_anonymous=True`.
    5.  It returns this temporary anonymous `UserResponse` object.
  - **Use Case:** Used for endpoints that should work for everyone but might behave differently based on login status (like your main chat endpoints `/chat/messages` and `/chat/messages/stream`). The endpoint code checks the `is_anonymous` flag to decide whether to save data, fetch history, etc.

### 2.2 Authentication Endpoints: Getting and Using the "ID Card"

_(Located in `app/api/endpoints/auth.py`)_

These are the specific doors users interact with for authentication.

- **`POST /auth/register`**
  - **Purpose:** Allows a new user to create an account. Like filling out a registration form.
  - **How it Works:** Takes email, password, name. Hashes the password securely. Stores the user details in the database (Appwrite). Returns the new user's details (excluding the password).
  - **Why No Auth Needed?** Because the user doesn't have an account yet!
- **`POST /auth/login`**
  - **Purpose:** Allows an existing user to sign in and get their JWT "ID card".
  - **How it Works:** Takes email (`username`) and password. Verifies the password against the stored hash in the database. If correct, it creates a JWT containing the user's ID and an expiration time, signs it with the `SECRET_KEY`, and sends the token back to the user.
  - **Why No Auth Needed?** Because the user is trying to prove who they are to _get_ the token.
- **`GET /auth/users/me`**
  - **Purpose:** Allows a logged-in user to check their own profile details.
  - **How it Works:** Relies entirely on the `get_current_user` dependency. If the dependency successfully verifies the token and gets the user data, this endpoint simply returns that data.
  - **Why Auth Required?** Only the logged-in user should be able to see their own profile. The `get_current_user` guard ensures this.

## 3. Chat API: The Conversation Engine

This is the core of your application, handling the back-and-forth chat interactions.

_(Located in `app/api/endpoints/chat.py`)_

### 3.1 Chat Schemas: Defining the Data Structures

Pydantic schemas define the expected shape of data for requests and responses. They ensure data is valid and make it easy to work with in code.

- **`MessageCreate`**: The blueprint for what the frontend needs to send when posting a message.
  - `content`: The actual text the user typed. Essential.
  - `conversation_id`: Tells the backend which existing chat to add this message to. If it's `null` or missing:
    - **Authenticated User:** The backend might create a _new_ conversation and save the message to it.
    - **Anonymous User:** The backend will _not_ create a conversation; the message is processed but not linked to anything persistent.
- **`ChatResponse`**: The blueprint for the backend's reply in a standard (non-streaming) chat request.
  - `ai_response`, `sources`: The core RAG output.
  - `conversation_id`, `user_message_id`, `ai_message_id`: These will contain actual database IDs _only if_ the user was authenticated and the data was stored. For anonymous users, these will be `null`, confirming nothing was saved.
- **`Source`**: Defines the details we provide about each piece of information the AI used. Helps with transparency and allows linking back to original texts.
- **`Message`**: Represents how a message (user or AI) is structured _in the database_ and when retrieving history. Includes who sent it, when, and any associated sources.
- **`ConversationResponse`**: Represents a conversation entry when listing all available conversations for a logged-in user.

### 3.2 Chat Endpoints: The Doors for Chatting

- **`POST /chat/messages` (Standard Chat)**
  - **Purpose:** The main way to send a message and get a complete AI response back at once.
  - **Auth:** Uses `get_user_or_anonymous` – works for everyone.
  - **Flow (Authenticated User):**
    1.  Receive `MessageCreate` (content, maybe conversation_id).
    2.  `get_user_or_anonymous` provides authenticated `UserResponse`.
    3.  `generate_rag_response` function is called.
    4.  Inside `generate_rag_response`:
        - Checks `is_anonymous` (it's `False`).
        - Creates conversation if `conversation_id` was missing.
        - Fetches message history for the conversation.
        - Stores the incoming user message in the database.
        - Performs RAG (retrieve docs, format context, call LLM).
        - Stores the generated AI response and sources in the database.
        - Updates the conversation's timestamp.
    5.  Return `ChatResponse` containing AI text, sources, and the _database IDs_ for the conversation and messages.
  - **Flow (Anonymous User):**
    1.  Receive `MessageCreate` (content, `conversation_id` is likely missing or ignored).
    2.  `get_user_or_anonymous` provides anonymous `UserResponse` (`is_anonymous=True`).
    3.  `generate_rag_response` function is called.
    4.  Inside `generate_rag_response`:
        - Checks `is_anonymous` (it's `True`).
        - **Skips** creating a conversation.
        - **Skips** fetching message history.
        - **Skips** storing the incoming user message.
        - Performs RAG (retrieve docs, format context, call LLM).
        - **Skips** storing the generated AI response and sources.
        - **Skips** updating any conversation timestamp.
    5.  Return `ChatResponse` containing AI text and sources, but with `conversation_id`, `user_message_id`, and `ai_message_id` set to `null`.
- **`POST /chat/messages/stream` (Streaming Chat via SSE)**
  - **Purpose:** Send a message and get the AI response back piece-by-piece as it's generated, providing a more interactive feel. Uses Server-Sent Events (SSE).
  - **What is SSE?** A simple protocol where the server can push data to the client over a single, long-lived HTTP connection. It's great for things like live updates or streaming text. The client just listens for named events.
  - **Auth:** Uses `get_user_or_anonymous` – works for everyone.
  - **Flow (Authenticated User):**
    1.  Receive `MessageCreate`.
    2.  `get_user_or_anonymous` provides authenticated `UserResponse`.
    3.  `generate_streaming_response` function is called.
    4.  Inside `generate_streaming_response`:
        - Checks `is_anonymous` (`False`).
        - Creates conversation if needed, **yields** `event: conversation_id`.
        - Fetches history.
        - Stores user message.
        - Performs RAG, calls _streaming_ LLM.
        - As LLM generates tokens, **yields** `event: chunk` for each piece.
        - After LLM finishes, **yields** `event: sources`.
        - Stores the complete AI response.
        - **Yields** `event: message_id` with the stored AI message ID.
        - Updates conversation timestamp.
    5.  Finally, **yields** `event: end`.
  - **Flow (Anonymous User):**
    1.  Receive `MessageCreate`.
    2.  `get_user_or_anonymous` provides anonymous `UserResponse` (`is_anonymous=True`).
    3.  `generate_streaming_response` function is called.
    4.  Inside `generate_streaming_response`:
        - Checks `is_anonymous` (`True`).
        - **Skips** creating conversation, does **not** yield `conversation_id`.
        - **Skips** fetching history.
        - **Skips** storing user message.
        - Performs RAG, calls _streaming_ LLM.
        - As LLM generates tokens, **yields** `event: chunk`.
        - After LLM finishes, **yields** `event: sources`.
        - **Skips** storing the AI response, does **not** yield `message_id`.
        - **Skips** updating timestamp.
    5.  Finally, **yields** `event: end`.
- **`POST /chat/conversations` (Create Conversation Explicitly)**
  - **Purpose:** Lets a logged-in user start a new chat thread without sending a message yet.
  - **Auth:** Uses `get_current_user` – strictly requires login.
  - **How it Works:** Calls a storage function (`create_new_conversation`) to create the conversation document in the database, linked to the authenticated user's ID.
- **`GET /chat/conversations` (List Conversations)**
  - **Purpose:** Allows a logged-in user to see their list of saved chat threads.
  - **Auth:** Uses `get_current_user` – strictly requires login.
  - **How it Works:** Queries the database for all conversation documents where the `user_id` matches the authenticated user's ID.
- **`GET /chat/conversations/{conversation_id}/messages` (Get History)**
  - **Purpose:** Allows a logged-in user to retrieve all the messages (user and AI) for one specific conversation they own.
  - **Auth:** Uses `get_current_user` – strictly requires login.
  - **How it Works:**
    1.  Verifies the user is logged in.
    2.  **Crucially, it checks if the requested `conversation_id` actually belongs to _this_ logged-in user.** This prevents users from accessing each other's chats. If ownership fails, it returns a `403 Forbidden` or `404 Not Found` error.
    3.  If ownership is confirmed, it queries the database for all messages linked to that `conversation_id`.

## 4. Core Logic Overview: The Functions Behind the Scenes

These are the key Python functions doing the heavy lifting, called by the endpoint handlers.

- **`generate_rag_response` / `generate_streaming_response`:** The main orchestrators for the chat logic. They coordinate history, storage (conditionally), retrieval, formatting, LLM calls, and response preparation. The key difference is one waits for the full LLM response, the other streams it.
- **`store_message`:** The function responsible for interacting with the database (Appwrite) to save a message. **Critically, it contains the `if is_anonymous:` check to bypass the actual database write operation for anonymous users.**
- **`update_conversation_timestamp`:** Keeps track of when a conversation was last active. Also checks if the conversation ID looks like an anonymous one to avoid trying to update something that doesn't exist persistently.
- **`format_context_and_extract_sources`:** Prepares the retrieved document snippets into a clean text block for the LLM and also extracts the metadata (`Source` objects) needed for the API response.
- **`construct_llm_prompt`:** Builds the final text input that gets sent to the LLM, combining instructions, chat history (if available), retrieved context, and the user's latest query.

## 5. Other APIs (Ingestion, Retrieval - Placeholder)

_(These sections describe potential future or existing APIs for managing the knowledge base itself. Less critical for the immediate chat functionality.)_

## 6. Configuration: Setting Up the Application

_(Located in `app/config/settings.py`)_

This is where you manage all the external details and secrets your application needs to run, like database connection strings, API keys for LLMs and vector stores, and the all-important `SECRET_KEY` for signing JWTs. Using environment variables is standard practice for security and flexibility.

---
