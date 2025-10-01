import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { ChatMessage } from "@/lib/types";
import OpenAI from "openai";

let messageHistory: ChatMessage[] = [];

const callLLM = async (messages: ChatMessage[], id: string) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });
  }

  const client = new OpenAI({ apiKey });

  const completion = await client.responses.create({
    model: "gpt-4o-mini",
    input: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    stream: true,
  });

  let assistantText = "";

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const part of completion) {
          const token = part.type === "response.output_text.delta";
          if (token) {
            assistantText += part.delta;
            controller.enqueue(encoder.encode(part.delta));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET(req: NextRequest) {
  return NextResponse.json(messageHistory);
}

export async function POST(req: NextRequest) {
  let body: { userMessage: ChatMessage, id: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  return NextResponse.json({ message: "Not Implemented" }, { status: 501 });
}