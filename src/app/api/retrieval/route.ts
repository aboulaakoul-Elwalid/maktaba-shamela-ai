import { NextRequest } from "next/server";

interface PineconeMatch {
  id: string;
  score: number;
  metadata: {
    book_name: string;
    section_title: string;
    text: string;
    [key: string]: any;
  };
}

interface PineconeResponse {
  matches: PineconeMatch[];
  namespace: string;
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

    // Get environment variables
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    const pineconeIndexName = process.env.PINECONE_INDEX_NAME;
    const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT;

    if (!pineconeApiKey || !pineconeIndexName || !pineconeEnvironment) {
      console.error("Required Pinecone environment variables are missing");
      return Response.json({ error: "Configuration error" }, { status: 500 });
    }

    // First, get embedding for the query using our embed endpoint
    const embedResponse = await fetch(new URL("/api/embed", req.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: query }),
    });

    if (!embedResponse.ok) {
      return Response.json(
        { error: "Failed to generate query embedding" },
        { status: 500 }
      );
    }

    const { embedding } = await embedResponse.json();

    // Query Pinecone with the embedding
    const pineconeUrl = `https://api.pinecone.io/v1/indexes/${pineconeIndexName}/query`;

    const pineconeResponse = await fetch(pineconeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": pineconeApiKey,
      },
      body: JSON.stringify({
        vector: embedding,
        topK,
        includeMetadata: true,
        namespace: "",
      }),
    });

    if (!pineconeResponse.ok) {
      const errorText = await pineconeResponse.text();
      console.error(
        `Pinecone API error: ${pineconeResponse.status} ${errorText}`
      );
      return Response.json(
        { error: "Failed to query vector database" },
        { status: 500 }
      );
    }

    const data: PineconeResponse = await pineconeResponse.json();

    return Response.json({
      matches: data.matches.map((match) => ({
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
