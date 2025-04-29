import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api"; // Assuming API_CONFIG is correctly set up

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, useRAG, conversationId } = body;

    if (!message) {
      return NextResponse.json(
        { detail: "Message content is required" },
        { status: 400 }
      );
    }

    // --- Check for authentication token ---
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1]; // Extract token after "Bearer "
    const isAnonymous = !token;

    console.log("DEBUG [Proxy Request]");
    console.log({
      message: message,
      useRAG: useRAG,
      conversationId: conversationId, // The ID from the frontend (can be null)
      tokenProvided: !!token,
      isAnonymous: isAnonymous,
    });
    // ------------------------------------

    // Construct the backend URL
    const backendUrl = `${API_CONFIG.BACKEND_URL}/chat/messages`; // Target the non-streaming endpoint for the proxy

    // Prepare headers for the backend request
    const backendHeaders: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Prepare body for the backend request
    const backendBody: {
      content: string;
      use_rag: boolean;
      conversation_id?: string | null; // Backend expects snake_case
      token?: string; // Send token only if authenticated
    } = {
      content: message,
      use_rag: useRAG ?? true, // Default to true if not provided
    };

    if (isAnonymous) {
      // For anonymous users, DO NOT send conversationId (unless maybe starting one?)
      // Let the backend handle creating a new conversation if conversationId is omitted/null
      // Do not send token
      console.log("Proxying as ANONYMOUS to:", backendUrl);
    } else {
      // For authenticated users, include conversationId if provided by frontend
      // and include the token in the body (or header, depending on backend expectation)
      console.log("Proxying as AUTHENTICATED to:", backendUrl);
      if (conversationId) {
        backendBody.conversation_id = conversationId;
      }
      // Assuming backend expects token in the body for this endpoint
      // If it expects it in header, adjust accordingly
      backendBody.token = token;
    }

    // Make the request to the backend
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: backendHeaders,
      body: JSON.stringify(backendBody),
    });

    // Forward the backend response status and body
    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error(
        `❌ Backend Error (${backendResponse.status}):`,
        responseData
      );
      return NextResponse.json(responseData, {
        status: backendResponse.status,
      });
    }

    console.log(
      `✅ Backend OK (${backendResponse.status}), Proxying response.`
    );
    return NextResponse.json(responseData, { status: backendResponse.status });
  } catch (error: any) {
    console.error("❌ Error in /api/chat proxy route:", error);
    return NextResponse.json(
      { detail: error.message || "Internal Server Error in proxy" },
      { status: 500 }
    );
  }
}
