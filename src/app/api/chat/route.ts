import { NextRequest } from "next/server";

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

    // Check environment variables
    const mistralApiKey = process.env.MISTRAL_API_KEY;
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    const pineconeIndexName = process.env.PINECONE_INDEX_NAME;

    logDebug("Environment Variables", {
      mistralApiKey: mistralApiKey ? "✅ Present" : "❌ Missing",
      pineconeApiKey: pineconeApiKey ? "✅ Present" : "❌ Missing",
      pineconeIndexName,
    });

    if (!mistralApiKey) {
      console.log("❌ Error: Mistral API key missing");
      return Response.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    // Initialize variables for context
    let retrievedContext = "";
    let contextualPrompt = message;

    // If RAG is enabled, retrieve relevant context
    if (useRAG && pineconeApiKey && pineconeIndexName) {
      console.log("🔍 RAG enabled, retrieving context...");
      try {
        // Generate the embed API URL from the current request
        const baseUrl = req.nextUrl.origin;
        const embedUrl = `${baseUrl}/api/embed`;

        logDebug("Embed API URL", { embedUrl });

        console.log("📨 Calling embedding API...");
        const embedResponse = await fetch(embedUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: message }),
        });

        logDebug("Embed Response Status", {
          status: embedResponse.status,
          ok: embedResponse.ok,
        });

        if (embedResponse.ok) {
          const embedData = await embedResponse.json();
          const hasEmbedding = !!embedData.embedding;

          logDebug("Embedding Result", {
            hasEmbedding,
            length: hasEmbedding ? embedData.embedding.length : 0,
          });

          if (hasEmbedding) {
            // Query Pinecone with the embedding
            console.log("📨 Calling Pinecone API...");
            const pineconeUrl = `https://api.pinecone.io/v1/indexes/${pineconeIndexName}/query`;

            const pineconeResponse = await fetch(pineconeUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Api-Key": pineconeApiKey,
              },
              body: JSON.stringify({
                vector: embedData.embedding,
                topK: 5,
                includeMetadata: true,
                namespace: "",
              }),
            });

            logDebug("Pinecone Response Status", {
              status: pineconeResponse.status,
              ok: pineconeResponse.ok,
            });

            if (!pineconeResponse.ok) {
              const errorText = await pineconeResponse.text();
              logDebug("Pinecone Error", { errorText });
            } else {
              const data = await pineconeResponse.json();

              logDebug("Pinecone Results", {
                matchCount: data.matches?.length || 0,
                firstMatch: data.matches?.[0]
                  ? {
                      id: data.matches[0].id,
                      score: data.matches[0].score,
                      metadataFields: Object.keys(
                        data.matches[0].metadata || {}
                      ),
                    }
                  : null,
              });

              // Format retrieved context
              if (data.matches && data.matches.length > 0) {
                retrievedContext = data.matches
                  .map(
                    (match: any) =>
                      `Book: ${
                        match.metadata.book_name || "Unknown"
                      }\nSection: ${
                        match.metadata.section_title || "Unknown"
                      }\nContent: ${
                        match.metadata.text?.substring(0, 300) || "No content"
                      }...\n(Similarity: ${Math.round(
                        (match.score || 0) * 100
                      )}%)`
                  )
                  .join("\n\n---\n\n");

                contextualPrompt = `Please answer this question using the reference information provided below:\n\nQuestion: ${message}\n\nReferences:\n${retrievedContext}\n\nAnswer:`;

                logDebug("Context Created", {
                  contextLength: retrievedContext.length,
                  promptLength: contextualPrompt.length,
                });
              }
            }
          }
        }
      } catch (error: any) {
        console.error("❌ Error during RAG retrieval:", error);
        logDebug("RAG Error", {
          message: error.message,
          stack: error.stack,
        });
      }
    }

    // Call Mistral API for chat completion
    console.log("📨 Calling Mistral chat API...");
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mistralApiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-tiny",
        messages: [
          {
            role: "system",
            content:
              "You are Ziryab, a knowledgeable assistant specializing in Islamic studies and Arabic science.",
          },
          { role: "user", content: contextualPrompt },
        ],
        temperature: 0.7,
      }),
    });

    logDebug("Mistral API Response", {
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Mistral API error: ${response.status} ${errorText}`);
      logDebug("Mistral Error", { errorText });
      return Response.json(
        { error: "Failed to generate response", details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("✅ Successfully generated response");

    return Response.json({
      message: data.choices[0].message.content,
      references: retrievedContext || null,
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
