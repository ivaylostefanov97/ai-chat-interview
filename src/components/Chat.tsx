"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";

const STORAGE_KEY = "ai-chat:messages:v1";

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

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

  // Persist to localStorage after initial load
  useEffect(() => {
    if (!didInitFromStorage.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore persistence errors
    }
  }, [messages]);

  const canSend = useMemo(() => input.trim().length > 0 && !isStreaming, [input, isStreaming]);

  const onSubmit = useCallback(async () => {
    if (!canSend) return;
    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
        signal: controller.signal,
      });
      if (!resp.ok || !resp.body) {
        // Leave placeholder message; candidates implement streaming read below
        throw new Error("Failed to start stream");
      }
      // TODO(CANDIDATE): Implement streaming read with TextDecoder and incremental UI updates.
      // Example (see README for full snippet):
      // const reader = resp.body.getReader();
      // const decoder = new TextDecoder();
      // for (;;) {
      //   const { value, done } = await reader.read();
      //   if (done) break;
      //   const chunk = decoder.decode(value, { stream: true });
      //   setMessages((prev) => {/* append chunk to last assistant message */});
      // }
    } catch (err) {
      // Optionally surface error to UI
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [canSend, input, messages]);

  const onStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const onClear = useCallback(() => {
    setMessages([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
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


