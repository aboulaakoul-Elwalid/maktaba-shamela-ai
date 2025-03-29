import { NextRequest } from "next/server";
import { API_CONFIG } from "@/config/api";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return Response.json({ error: "Text is required" }, { status: 400 });
    }

    // Call your FastAPI embed endpoint instead of Mistral directly
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/embed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_CONFIG.API_KEY,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status} ${errorText}`);
      return Response.json(
        { error: "Failed to generate embeddings" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json({ embedding: data.embedding });
  } catch (error) {
    console.error("Error generating embedding:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
