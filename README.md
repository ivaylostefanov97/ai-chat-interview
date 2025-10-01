This project is a Next.js scaffold for an interview exercise: implement a streaming AI chat using the OpenAI SDK, with client-side persistence via localStorage.

### What’s provided

- Basic UI in `src/components/Chat.tsx` that:
- API route at `src/app/api/chat/route.ts` with an edge runtime and an llm stream
- Types in `src/lib/types.ts`

### Setup

1. Install dependencies:

```bash
npm i / yarn
```

2. Create an `.env.local` file with your key:

```bash
echo "OPENAI_API_KEY=" >> .env.local
```

Set `OPENAI_API_KEY=...`.

3. Run the dev server:

```bash
npm run dev
# or npm run dev / yarn dev
```

### Notes

- You may choose models such as `gpt-4o-mini` or similar.

### Server-side streaming guide (example)

Below is a minimal pattern to stream tokens as plain text from the server. Integrate this in `src/app/api/chat/route.ts`.

```ts
const encoder = new TextEncoder();
const readable = new ReadableStream<Uint8Array>({
  async start(controller) {
    try {
      for await (const part of completion) {
        const token = part.choices?.[0]?.delta?.content ?? "";
        if (token) controller.enqueue(encoder.encode(token));
      }
    } finally {
      controller.close();
    }
  },
});

return new Response(readable, {
  headers: { "Content-Type": "text/plain; charset=utf-8" },
});
```

### Client-side streaming guide (example)

In `src/components/Chat.tsx`, use `TextDecoder` to read and append chunks:

```ts
const reader = resp.body!.getReader();
const decoder = new TextDecoder();
```

### Local state vs. persisted state

- While streaming, update React state on each token. Persist periodically or after stream ends.
- Ensure state remains consistent if the user presses Stop/Abort mid-stream.

### Aborting a streaming fetch

Use `AbortController` to allow stopping an in-flight request. Wire the `controller.signal` into `fetch`, keep the controller in a ref, and call `abort()` on Stop.

```ts
// create controller and remember it
const controller = new AbortController();
abortRef.current = controller;

const resp = await fetch("...", {
  ...
  signal: controller.signal,
});

// later, on Stop button click
abortRef.current?.abort();
```

Make sure to set `isStreaming` to false in a `finally` block after your streaming loop completes or aborts.
