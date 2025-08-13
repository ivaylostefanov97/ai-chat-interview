"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";

const STORAGE_KEY = "ai-chat:messages:v1";

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const didInitFromStorage = useRef(false);

  // Load from localStorage after mount to avoid SSR/client mismatch
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setMessages(JSON.parse(raw) as ChatMessage[]);
      }
    } catch {
      // ignore load errors
    } finally {
      didInitFromStorage.current = true;
    }
  }, []);

  const canSend = useMemo(() => input.trim().length > 0 && !isStreaming, [input, isStreaming]);

  const onSubmit = useCallback(async () => {
    if (!canSend) return;
    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    // TODO(CANDIDATE): Implement fetch with streaming and incremental updates.
    // See README sections:
    // - Client-side streaming guide (TextDecoder)
    // - Aborting a stream (AbortController with fetch)

    // For now, immediately end the simulated streaming session.
    setIsStreaming(false);
  }, [canSend, input, messages]);

  const onStop = useCallback(() => {
    // TODO(CANDIDATE): Abort in-flight fetch using AbortController
  }, []);

  const onClear = useCallback(() => {
    // TODO(CANDIDATE): Clear messages and reset UI
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex-1 min-h-[320px] rounded-md border border-black/10 dark:border-white/10 p-4 overflow-y-auto bg-white/50 dark:bg-black/20">
        {messages.length === 0 ? (
          <p className="text-sm opacity-70">Start a conversation below.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <span className="inline-block rounded-lg px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800">
                  {m.content}
                </span>
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
      <p className="text-xs opacity-60">Messages persist to localStorage only.</p>
    </div>
  );
}


