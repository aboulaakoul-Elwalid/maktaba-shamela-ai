import { NextRequest } from "next/server";
import { API_CONFIG } from "@/config/api";

interface RetrievalMatch {
  score: number;
  id: string;
  metadata: {
    book_name: string;
    section_title: string;
    text: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { query, topK = 20 } = await req.json();

    if (!query) {
      return Response.json(
        { error: "Query text is required" },
        { status: 400 }
      );
    }

    // Call your FastAPI retrieval endpoint
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/retrieval`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_CONFIG.API_KEY,
      },
      body: JSON.stringify({ query, top_k: topK }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status} ${errorText}`);
      return Response.json(
        { error: "Failed to query vector database" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json({
      matches: data.matches.map((match: any) => ({
        score: match.score,
        id: match.id,
        metadata: {
          book_name: match.metadata.book_name,
          section_title: match.metadata.section_title,
          text: match.metadata.text.substring(0, 500), // Limit text length
        },
      })),
    });
  } catch (error) {
    console.error("Error in retrieval:", error);
    return Response.json(
      { error: "Failed to process retrieval request" },
      { status: 500 }
    );
  }
}
