"use client";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

export default function ChatInput({ inputValue, setInputValue, handleSubmit, isLoading }: ChatInputProps) {
  return (
    <form onSubmit={handleSubmit} className="border-none p-2" style={{ backgroundColor: "var(--light)", borderColor: "var(--secondary)" }}>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border-none rounded-2xl bg-transparent focus:outline-none focus:ring-2 shadow-md"
          style={{ borderColor: "var(--secondary)", color: "var(--foreground)", backgroundColor: "#DADADA25" }}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="px-3 py-1 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-md"
          style={{ backgroundColor: "#3C7B3E", color: "var(--light)" }}
        >
          Send
        </button>
      </div>
    </form>
  );
}
