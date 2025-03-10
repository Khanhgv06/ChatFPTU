import { View, SafeAreaView, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { Stack } from 'expo-router';
import InputBox from './components/InputBox';
import ChatMessages from './components/ChatMessages';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HelpButtons from './components/HelpButtons';
import useChat from './hooks/UseChat';
import { Conversation, loadConversations, saveConversations, addConversation, clearConversations } from './components/Conversations';

const App = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [helpText, setHelpText] = useState('');
    const { messages, conversationId, isLoading, sendMessage, resetMessages } = useChat();
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        const fetchConversations = async () => {
            const loadedConversations = await loadConversations();
            setConversations(loadedConversations);
        };

        fetchConversations();
    }, []);    

    const handleSendMessage = useCallback(
        async (text: string) => {
            if (text.trim()) {
                await sendMessage(text, conversationId);
            }
        },
        [sendMessage, conversationId]
    );

    const addNewConversation = async (newConversation: Conversation) => {
        await addConversation(newConversation);
        const updatedConversations = await loadConversations();
        setConversations(updatedConversations);
    };

    
    const clearAllConversations = async () => {
        await clearConversations();
        setConversations([]);
        resetMessages();
    };

    const setInputText = useCallback((input: string) => setHelpText(input), []);
    const newChat = () => {
        setIsCollapsed(!isCollapsed)
    }
    return (
        <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
            <Stack.Screen options={{ headerShown: false, statusBarStyle: 'dark' }} />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    {!isCollapsed && (
                        <Sidebar conversations={conversations} isCollapsed={isCollapsed} clearMsg={clearAllConversations} newChat={newChat}/>
                    )}
                    <TouchableOpacity 
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPress={() => !isCollapsed && setIsCollapsed(true)}
                    >
                        <View style={{ flex: 1 }}>
                            <Header onToggle={() => setIsCollapsed(!isCollapsed)} />
                            
                            {messages.length === 0 && (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 30 }}>
                                    <HelpButtons setInputText={setInputText} />
                                </View>
                            )}

                            <View style={{ flex: 1 }}>
                                <ChatMessages messages={messages} />
                            </View>

                            {isLoading && (
                                <View style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                                    <ActivityIndicator size="large" color="#fff" />
                                    <Text style={{ color: '#fff', marginTop: 10 }}>Waiting for response...</Text>
                                </View>
                            )}

                            <InputBox onSendMessage={handleSendMessage} helpTextIn={helpText} />
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

export default App;