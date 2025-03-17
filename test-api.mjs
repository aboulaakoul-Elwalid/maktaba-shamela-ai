// Note: Using .mjs extension to allow top-level await

import fetch from "node-fetch";

async function testChatApi() {
  console.log("🔍 Testing Chat API...");

  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Tell me about Islamic prayer customs",
        useRAG: true,
      }),
    });

    console.log(`📊 Status: ${response.status}`);

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Success!");
      console.log("\n📝 AI Response:");
      console.log(data.message);

      if (data.references) {
        console.log("\n📚 References:");
        console.log(data.references);
      }
    } else {
      console.log("❌ Error:");
      console.log(data);
    }
  } catch (error) {
    console.error("❌ Failed to connect to API:", error.message);
  }
}

// Execute the test
testChatApi();
