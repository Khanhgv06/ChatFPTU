import { useState, useCallback, useEffect } from 'react';
import { loadConversations, saveConversations, addConversation } from '../components/Conversations';
import { Message, Conversation } from '../components/Conversations';
import ChatAPI from '../ChatAPI';

const chat = new ChatAPI();

const useChat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);

    const fetchConversations = useCallback(async () => {
        const loadedConversations = await loadConversations();
        setConversations(loadedConversations);

        if (loadedConversations.length > 0) {
            const lastConversation = loadedConversations[loadedConversations.length - 1];
            setConversationId(lastConversation.conversationId);
            setMessages(lastConversation.messages);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const sendMessage = useCallback(
        async (text: string, currentConversationId: string) => {
            setMessages((prev) => [...prev, { content: text, role: 'user' }]);
            setIsLoading(true);

            try {
                const response = await chat.sendMessage(text, currentConversationId);

                if (!currentConversationId) {
                    setConversationId(response.conversation_id);
                }

                const newConversationId = currentConversationId || response.conversation_id;
                const assistantMessage: Message = {
                    content: response.answer,
                    role: 'assistant'
                };

                setMessages((prev) => [...prev, assistantMessage]);

                const updatedConversation: Conversation = {
                    conversationId: newConversationId,
                    messages: [
                        ...messages,
                        { content: text, role: 'user' },
                        assistantMessage
                    ]
                };

                setConversations((prev) => {
                    const updatedConversations = prev.map((conv) =>
                        conv.conversationId === newConversationId ? updatedConversation : conv
                    );
                    return updatedConversations.some(conv => conv.conversationId === newConversationId)
                        ? updatedConversations
                        : [...prev, updatedConversation];
                });

                await addConversation(updatedConversation);
            } catch (error) {
                console.error('Failed to send message:', error);
            } finally {
                setIsLoading(false);
            }
        },
        [conversationId, messages]
    );

    const resetMessages = useCallback(async () => {
        setMessages([]);
        setConversationId('');
        await saveConversations([]);
    }, []);

    const useConversation = useCallback((convId: string) => {
        const selectedConversation = conversations.find(conv => conv.conversationId === convId);
        if (selectedConversation) {
            setConversationId(selectedConversation.conversationId);
            setMessages(selectedConversation.messages);
        }
    }, [conversations]);

    const clearAllConversations = useCallback(async () => {
        setConversations([]);
        setMessages([]);
        setConversationId('');
        await saveConversations([]);
    }, []);

    const getCurrentConversation = useCallback(() => {
        return conversations.find(conv => conv.conversationId === conversationId) || null;
    }, [conversations, conversationId]);

    return { 
        conversations,
        messages, 
        conversationId, 
        isLoading, 
        sendMessage, 
        resetMessages,
        useConversation,
        clearAllConversations,
        getCurrentConversation,
        saveConversations
    };
};

export default useChat;
