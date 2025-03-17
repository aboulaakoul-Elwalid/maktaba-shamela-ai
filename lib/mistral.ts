export async function getTextEmbedding(text: string) {
  try {
    const response = await fetch("https://api.mistral.ai/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-embed",
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mistral API error: ${response.status} ${errorText}`);
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}
