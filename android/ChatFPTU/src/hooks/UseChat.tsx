import { useState, useCallback } from 'react';
import ChatAPI from '../ChatAPI';

const chat = new ChatAPI();

const useChat = () => {
    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
    const [conversationId, setConversationId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = useCallback(
        async (text: string, conversationId: string) => {
            setMessages((prev) => [...prev, { sender: 'user', text }]);
            setIsLoading(true);

            try {
                const response = await chat.sendMessage(text, conversationId);
                if (!conversationId) {
                    setConversationId(response.conversation_id);
                }

                setMessages((prev) => [...prev, { sender: 'assistant', text: response.answer }]);
            } catch (error) {
                console.error('Failed to send message:', error);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    return { messages, conversationId, isLoading, sendMessage };
};

export default useChat;
