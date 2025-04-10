"use client";
import { Message } from "../../types/chat";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div 
      className={`mb-4 ${message.sender === 'user' ? 'ml-auto text-right' : 'mr-auto'}`}
    >
      <div 
        className={`inline-block p-3 rounded-lg max-w-[80%] ${
          message.sender === 'user' 
            ? 'rounded-tr-none' 
            : message.sender === 'system'
              ? 'italic'
              : 'rounded-tl-none'
        }`}
        style={{
          backgroundColor: message.sender === 'user' ? "var(--secondary)" : "var(--light)",
          color: message.sender === 'user' ? "var(--light)" : "var(--dark)"
        }}
      >
        {message.text}
      </div>
      <div className="text-xs mt-1" style={{ color: "var(--light)" }}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
