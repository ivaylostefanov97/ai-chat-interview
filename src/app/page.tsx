import Chat from "@/components/Chat";

export default function Home() {

  return (
    <div className="font-sans min-h-screen p-8 sm:p-12">
      <main className="mx-auto max-w-2xl flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">AI Chat</h1>
        <p className="text-sm opacity-70">
          Your task: implement server-side OpenAI streaming and improve the UI/UX.
        </p>
        <Chat />
      </main>
    </div>
  );
}
