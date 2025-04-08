import ChatInterface from "../components/ChatInterface";

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-8">Chat Assistant</h1>
      <ChatInterface />
    </div>
  );
}
