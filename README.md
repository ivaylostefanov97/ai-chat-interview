This project is a Next.js scaffold for an interview exercise: implement a streaming AI chat using the OpenAI SDK, with client-side persistence via localStorage.

### What’s provided

- Basic UI in `src/components/Chat.tsx` that:
  - Persists messages to localStorage
  - Calls an API endpoint and renders streamed text chunks into the assistant message
- API route at `src/app/api/chat/route.ts` with an edge runtime and a mock stream
- Types in `src/lib/types.ts`

### Your task

1. Implement server-side streaming in `src/app/api/chat/route.ts` using the OpenAI SDK and return a text/plain stream of tokens.
2. Implement client-side streaming consumption in `src/components/Chat.tsx` with `TextDecoder`, updating UI incrementally.
3. Keep persistence in localStorage and decide how to synchronize state during streaming.

### Setup

1. Install dependencies:

```bash
yarn
# or: npm i / yarn
```

2. Create an `.env.local` file with your key:

```bash
echo "OPENAI_API_KEY=" >> .env.local
```

Set `OPENAI_API_KEY=...`.

3. Run the dev server:

```bash
pnpm dev
# or npm run dev / yarn dev
```

### Notes

- The API route is configured for `runtime = "edge"`.
- You may choose models such as `gpt-4o-mini` or similar.
- Keep the API response as a text stream (`text/plain`) for simplicity.

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

If no `OPENAI_API_KEY` is set, you can fall back to a mock stream (already included) to simulate tokens.

### Client-side streaming guide (example)

In `src/components/Chat.tsx`, use `ReadableStreamDefaultReader` and `TextDecoder` to read and append chunks to the last assistant message:

```ts
const reader = resp.body.getReader();
const decoder = new TextDecoder();

for (;;) {
  const { value, done } = await reader.read();
  if (done) break;
  const text = decoder.decode(value, { stream: true });
}
```

### Local state vs. persisted state

- While streaming, update React state on each token. Persist periodically or after stream ends.
- Ensure state remains consistent if the user presses Stop/Abort mid-stream.
