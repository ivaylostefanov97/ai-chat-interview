"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

function AIMessage({
  message,
  reloadMessage,
}: {
  message: ChatMessage;
  reloadMessage: (id: ChatMessage["id"]) => void;
}) {
  return (
    <div className="text-left">
      <span className="inline-block rounded-lg px-3 py-2 text-sm bg-gray-200 dark:bg-gray-800">
        {message.content}
      </span>
      <br />
      {message.status === "success" && (
        <button
          className="text-xs opacity-60 mt-2 hover:opacity-100 hover:cursor-pointer"
          onClick={() => reloadMessage(message.id)}
        >
          reload
        </button>
      )}
    </div>
  );
}

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="text-right">
      <span className="inline-block rounded-lg px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800">
        {message.content}
      </span>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      loadMessages();
    } catch {
      console.error("Failed to load messages");
    }
  }, []);

  const loadMessages = async () => {
    const resp = await fetch("/api/chat");

    if (!resp.ok) {
      throw new Error("Failed to load messages");
    }

    const data = await resp.json();
    setMessages(data as ChatMessage[]);
  };

  const canSend = useMemo(
    () => input.trim().length > 0 && !isStreaming,
    [input, isStreaming]
  );

  const onSubmit = () => {
    if (!canSend) return;

    setIsStreaming(true);

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: input.trim(),
      status: "success",
    };

    setIsStreaming(false);
  };

  const onStop = () => {};

  const onClear = () => {};

  const reloadMessage = () => {};

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex-1 min-h-[320px] rounded-md border border-black/10 dark:border-white/10 p-4 overflow-y-auto bg-white/50 dark:bg-black/20">
        {messages.length === 0 ? (
          <p className="text-sm opacity-70">Start a conversation below.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "text-right" : "text-left"}
              >
                {m.role === "assistant" ? (
                  <AIMessage message={m} reloadMessage={reloadMessage} />
                ) : (
                  <UserMessage message={m} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <input
          className="flex-1 rounded-md border border-black/10 dark:border-white/10 px-3 py-2 text-sm bg-transparent"
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-md bg-foreground text-background px-4 py-2 text-sm disabled:opacity-50"
        >
          Send
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={!isStreaming}
          className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
        >
          Stop
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md border px-3 py-2 text-sm"
        >
          Clear
        </button>
      </form>
      <p className="text-xs opacity-60">
        Messages persist to localStorage only.
      </p>
    </div>
  );
}
