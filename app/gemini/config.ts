import { getFunctionDeclarations } from "./function-declarations";

// System instructions for Gemini
export const SYSTEM_INSTRUCTION = `You are a helpful assistant with access to functions.
You can call functions multiple times to gather all the information you need before answering.
When you have enough information, provide a comprehensive answer based on all function results.
Do not include raw function call details in your responses to the user.`;

// Model configuration
export const MODEL_NAME = 'gemini-2.0-flash';

// Configuration for the Gemini model
export const getGeminiConfig = () => ({
  systemInstruction: SYSTEM_INSTRUCTION,
  tools: [
    {
      functionDeclarations: getFunctionDeclarations()
    }
  ]
});
