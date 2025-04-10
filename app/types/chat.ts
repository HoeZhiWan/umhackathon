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

// Define different types of client action parameters
export interface DataWindowActionParams {
  visualization_type: 'chart' | 'graph' | 'stats';
  title?: string;
  id?: string;
}

export interface LanguageSwitchActionParams {
  language_code: string;
}

// Union type for all possible parameter types
export type ClientActionParams = DataWindowActionParams | LanguageSwitchActionParams;

// Interface for client actions in function results
export interface ClientAction {
  type: "ADD_DATA_WINDOW" | "SWITCH_LANGUAGE" | string;
  params: ClientActionParams;
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
