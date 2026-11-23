export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type BackendStatus = 'online' | 'connecting' | 'offline';

export interface AppSettings {
  backendUrl: string;
  persistChat: boolean;
  soundEnabled: boolean;
  userName: string;
  userEmail: string;
}

export interface Toast {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'error';
}

export interface PromptSuggestion {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  prompt: string;
}
