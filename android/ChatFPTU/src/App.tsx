import { Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import InputBox from './components/InputBox';
import ChatMessages from './components/ChatMessages';
import ChatAPI from './ChatAPI';
import { Stack } from 'expo-router';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HelpButtons from './components/HelpButtons';

const chat = new ChatAPI();

export default function App() {
    
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [messages, setMessages] = useState([]);
    const [conversationId, setConversationId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [helpText, setHelpText] = useState('');

    const handleSendMessage = async (text: string) => {
        if (text.trim() === '') return;

        setMessages(prev => [...prev, { sender: 'user', text }]);
        
        setIsLoading(true);

        try {
            const response = await chat.sendMessage(text, conversationId);

            if (!conversationId) setConversationId(response.conversation_id);

            setMessages(prev => [...prev, { sender: 'assistant', text: response.answer }]);
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setInputText = (input: string) => {
        setHelpText(input);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
            <Stack.Screen options={{ headerShown: false, statusBarStyle: 'dark' }} />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    {!isCollapsed && (
                        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
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
                                <HelpButtons setInputText={setInputText}/>
                            </View>)}

                            <View style={{ flex: 1 }}>
                                <ChatMessages messages={messages} />
                            </View>

                            {isLoading ? (
                                <View style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                                    <ActivityIndicator size="large" color="#fff" />
                                    <Text style={{ color: '#fff', marginTop: 10 }}>Waiting for response...</Text>
                                </View>
                            ) : null}

                            <InputBox onSendMessage={handleSendMessage} helpTextIn={helpText}/>
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
