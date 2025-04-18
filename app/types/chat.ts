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
  data?: {
    chartData?: Array<{ name: string; value: number }>;
    lineData?: Array<{ name: string; value: number }>;
    statData?: Array<{ label: string; value: string }>;
    topItems?: Array<{ name: string; count: number }> | string;
    period?: string;
    merchant?: string;
    [key: string]: any; // Allow for additional properties
  };
}

export interface MenuItemWindowActionParams {
  itemName: string;
  cuisineTag: string;
  description?: string;
  imageData?: string;
  imageUrl?: string;
  id?: string;
}

export interface LanguageSwitchActionParams {
  language_code: string;
}

// Union type for all possible parameter types
export type ClientActionParams = DataWindowActionParams | LanguageSwitchActionParams | MenuItemWindowActionParams;

// Interface for client actions in function results
export interface ClientAction {
  type: "ADD_DATA_WINDOW" | "SWITCH_LANGUAGE" | "ADD_MENU_ITEM_WINDOW" | string;
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
