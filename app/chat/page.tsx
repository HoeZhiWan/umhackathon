"use client"

import { useState } from "react";
import ChatInterface from "../components/ChatInterface";
import MerchantSelector from "../components/MerchantSelector";

export default function ChatPage() {
  const [merchantId, setMerchantId] = useState("merchant_1"); // Default merchant

  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <div className="w-full max-w-2xl flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Chat Assistant</h1>
        <MerchantSelector 
          currentMerchantId={merchantId}
          onMerchantChange={setMerchantId}
        />
      </div>
      <ChatInterface merchantId={merchantId} />
    </div>
  );
}
