import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  content: string;
  role: 'user' | 'assistant';
}

export interface Conversation {
  conversationId: string;
  messages: Message[];
}

export const loadConversations = async (): Promise<Conversation[]> => {
  const storedConversations = await AsyncStorage.getItem('conversations');
  if (storedConversations) {
    return JSON.parse(storedConversations);
  }
  return [];
};

export const saveConversations = async (conversations: Conversation[]): Promise<void> => {
  try {
    const conversationsString = JSON.stringify(conversations);
    await AsyncStorage.setItem('conversations', conversationsString);
  } catch (error) {
    console.error('Error saving conversations:', error);
  }
};

export const addConversation = async (newConversation: Conversation): Promise<void> => {
  const conversations = await loadConversations(); 
  const updatedConversations = [...conversations, newConversation]; 
  await saveConversations(updatedConversations);
};

export const clearConversations = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('conversations'); 
  } catch (error) {
    console.error('Error clearing conversations:', error);
  }
};
