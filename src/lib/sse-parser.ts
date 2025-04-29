interface SSEEventData {
  event: string;
  data: string;
}

interface SSEParserOptions {
  onData: (data: SSEEventData) => void;
  onError: (error: Error) => void;
  onClose: () => void;
}

/**
 * Reads a ReadableStream and parses Server-Sent Events (SSE).
 * Handles text decoding, line buffering, and event/data extraction.
 *
 * @param reader - The ReadableStreamDefaultReader obtained from response.body.getReader().
 * @param decoder - A TextDecoder instance (e.g., new TextDecoder()).
 * @param options - Callbacks for handling data, errors, and stream closure.
 */
export async function parseSSE(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  options: SSEParserOptions
): Promise<void> {
  let buffer = "";
  let currentEvent = "message"; // Default event type if not specified
  let currentData = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        // Process any remaining buffer content if stream ends unexpectedly
        if (buffer.trim()) {
          console.warn("Stream ended with unprocessed buffer:", buffer);
          // Optionally try to process the last bit if it forms a complete message
        }
        break; // Exit loop when stream is done
      }

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process lines in the buffer
      let lineEndIndex;
      while ((lineEndIndex = buffer.indexOf("\n")) >= 0) {
        const line = buffer.substring(0, lineEndIndex).trim();
        buffer = buffer.substring(lineEndIndex + 1); // Remove processed line from buffer

        if (line === "") {
          // Empty line: dispatch event if data exists
          if (currentData) {
            options.onData({ event: currentEvent, data: currentData.trim() });
            currentData = ""; // Reset data
            currentEvent = "message"; // Reset event type
          }
        } else if (line.startsWith("event:")) {
          currentEvent = line.substring("event:".length).trim();
        } else if (line.startsWith("data:")) {
          // Append data, adding newline if data already exists
          currentData +=
            (currentData ? "\n" : "") + line.substring("data:".length).trim();
        } else if (line.startsWith("id:")) {
          // Optional: handle id field if needed
          // console.log("SSE ID:", line.substring("id:".length).trim());
        } else if (line.startsWith("retry:")) {
          // Optional: handle retry field if needed
          // console.log("SSE Retry:", line.substring("retry:".length).trim());
        } else if (line.startsWith(":")) {
          // Comment line, ignore
        } else {
          console.warn("Ignoring unsupported SSE line:", line);
        }
      }
    }
    // Stream finished normally
    options.onClose();
  } catch (error: any) {
    // Handle errors during reading or processing
    options.onError(error);
  } finally {
    // Ensure reader is released (though usually handled by stream closing)
    // reader.releaseLock(); // Be cautious with manual releaseLock
  }
}
