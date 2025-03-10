export interface Message {
  content: string;
  role: 'user' | 'assistant';
}

export interface Conversation {
  conversationId: string;
  messages: Message[];
}