import { NextRequest } from "next/server";
import { API_CONFIG } from "@/config/api";

// Enhanced logging function
function logDebug(label: string, data: any) {
  console.log(`\n==========================================`);
  console.log(`DEBUG [${label}]`);
  console.log(JSON.stringify(data, null, 2));
  console.log(`==========================================\n`);
}

export async function POST(req: NextRequest) {
  try {
    console.log("\n🚀 Chat API called");
    const { message, useRAG = true } = await req.json();
    logDebug("Request", { message, useRAG });

    if (!message) {
      console.log("❌ Error: Message required");
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    // If you've implemented a RAG/chat endpoint in your FastAPI backend:
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/rag/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_CONFIG.API_KEY,
      },
      body: JSON.stringify({
        query: message,
        top_k: 5,
        reranking: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status} ${errorText}`);
      return Response.json(
        { error: "Failed to generate response", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json({
      message: data.response,
      references: data.context
        ? data.context
            .map(
              (ctx: any) =>
                `Book: ${ctx.book_name || "Unknown"}\nSection: ${
                  ctx.section_title || "Unknown"
                }\nContent: ${ctx.text_snippet || "No content"}...`
            )
            .join("\n\n---\n\n")
        : null,
    });
  } catch (error: any) {
    console.error("❌ Unhandled error in chat API:", error);
    logDebug("Unhandled Error", {
      message: error.message,
      stack: error.stack,
    });
    return Response.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}
