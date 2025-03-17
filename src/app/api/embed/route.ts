import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return Response.json({ error: "Text is required" }, { status: 400 });
    }

    const mistralApiKey = process.env.MISTRAL_API_KEY;
    if (!mistralApiKey) {
      console.error("MISTRAL_API_KEY not found in environment variables");
      return Response.json({ error: "Configuration error" }, { status: 500 });
    }

    // Call Mistral API to get embeddings
    const response = await fetch("https://api.mistral.ai/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mistralApiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-embed",
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mistral API error: ${response.status} ${errorText}`);
      return Response.json(
        { error: "Failed to generate embeddings" },
        { status: 500 }
      );
    }

    const data = await response.json();
    return Response.json({ embedding: data.data[0].embedding });
  } catch (error) {
    console.error("Error generating embedding:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
