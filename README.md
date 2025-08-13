This project is a Next.js scaffold for an interview exercise: implement a streaming AI chat using the OpenAI SDK, with client-side persistence via localStorage.

### What’s provided

- Basic UI in `src/components/Chat.tsx` that:
  - Persists messages to localStorage
  - Calls an API endpoint and renders streamed text chunks into the assistant message
- API route at `src/app/api/chat/route.ts` with an edge runtime and a mock stream
- Types in `src/lib/types.ts`

### Your task

1. Replace the mock streaming in `src/app/api/chat/route.ts` with real OpenAI streaming using the SDK.
2. Improve the client UI/UX and state management in `src/components/Chat.tsx`:
   - Robust stream handling (partial rendering, abort, error states)
   - Better styling and message avatars, timestamps (optional)
3. Keep persistence in localStorage.

### Setup

1. Install dependencies:

```bash
pnpm i
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
