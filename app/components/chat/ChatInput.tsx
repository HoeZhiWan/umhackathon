"use client";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

export default function ChatInput({ inputValue, setInputValue, handleSubmit, isLoading }: ChatInputProps) {
  return (
    <form onSubmit={handleSubmit} className="border-t p-2" style={{ backgroundColor: "var(--light)", borderColor: "var(--secondary)" }}>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-md bg-transparent focus:outline-none focus:ring-2"
          style={{ borderColor: "var(--secondary)", color: "var(--foreground)" }}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          style={{ backgroundColor: "var(--primary)", color: "var(--light)" }}
        >
          Send
        </button>
      </div>
    </form>
  );
}
