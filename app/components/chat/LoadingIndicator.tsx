"use client";

export default function LoadingIndicator() {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--primary)" }}></div>
      <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s]" style={{ backgroundColor: "var(--primary)" }}></div>
      <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.4s]" style={{ backgroundColor: "var(--primary)" }}></div>
    </div>
  );
}
