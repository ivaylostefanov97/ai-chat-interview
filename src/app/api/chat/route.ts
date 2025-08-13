export const runtime = "edge";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { ChatMessage } from "@/lib/types";

// NOTE FOR CANDIDATES:
// - Replace the mock streaming with a real OpenAI streaming implementation.
// - Use the OpenAI SDK and stream deltas back to the client.
// - Keep the API compatible with the client: it returns a text stream (text/plain).

function createMockStream(text: string, chunkDelayMs = 80): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks = text.split(/(\s+)/).filter(Boolean);

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, chunkDelayMs));
      }
      controller.close();
    },
  });
}

export async function POST(req: NextRequest) {
  let body: { messages?: Pick<ChatMessage, "role" | "content">[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const history = body?.messages ?? [];
  const userLast = history.filter((m) => m.role === "user").at(-1)?.content ?? "";

  // If OPENAI_API_KEY is not provided, respond with a mock streamed reply
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const stream = createMockStream(
      `[mock] You asked: "${userLast}". Replace this with real OpenAI streaming in the API route.`,
      50,
    );
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // TODO(CANDIDATE): Implement real OpenAI streaming.
  // Suggested approach (pseudocode):
  // import OpenAI from "openai";
  // const client = new OpenAI({ apiKey: apiKey });
  // const response = await client.chat.completions.create({
  //   model: "gpt-4o-mini",
  //   messages: history,
  //   stream: true,
  // });
  // return new Response(response.toReadableStream(), { headers: { "Content-Type": "text/plain" } });

  // Temporary: simple non-streaming fallback using mock but prefixed to indicate key exists.
  const stream = createMockStream(
    `[openai-key-present] Implement streaming with the SDK here. User asked: "${userLast}"`,
    25,
  );
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}


