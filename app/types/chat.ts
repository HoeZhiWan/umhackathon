// Message interface for chat messages
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
  _rawData?: any; // Optional raw data property
}

// Interface for Gemini's conversation format
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Interface for client actions in function results
export interface ClientAction {
  type: string;
  params: {
    visualization_type: 'chart' | 'graph' | 'stats';
    title?: string;
    id?: string;
  };
}

// Interface for function results
export interface FunctionResult {
  id?: string;
  window_type?: 'chart' | 'graph' | 'stats';
  title?: string;
  clientAction?: ClientAction;
  [key: string]: any;
}

// Interface for API response
export interface ChatApiResponse {
  message: string;
  history?: GeminiMessage[];
  functionResults?: FunctionResult[];
  timestamp?: string;
  suggestedPrompts?: string[]; // Add suggested prompts to the API response
}
