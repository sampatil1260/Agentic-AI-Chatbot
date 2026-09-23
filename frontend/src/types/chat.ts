export interface Source {
  productName?: string;
  productCategory?: string;
  productSubCategory?: string;
  score?: number;
  productId?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: Date;
  isError?: boolean;
  queryType?: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  userEmail?: string;
}

export interface ChatResponse {
  answer: string;
  sources?: Source[];
  conversationId: string;
  queryType?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
