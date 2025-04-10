// Define types for conversation messages
export interface TextPart {
  text: string;
}

export interface FunctionCallPart {
  functionCall: any;
}

export interface FunctionResponsePart {
  functionResponse: any;
}

export type MessagePart = TextPart | FunctionCallPart | FunctionResponsePart;

export interface ConversationMessage {
  role: string;
  parts: MessagePart[];
}

export interface GeminiResponse {
  type: string;
  message: string;
  functionResults: any[] | null;
  history: ConversationMessage[];
}
