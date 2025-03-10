import { Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import InputBox from './components/InputBox';
import ChatMessages from './components/ChatMessages';
import ChatAPI from './ChatAPI';
import { Stack } from 'expo-router';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

const chat = new ChatAPI();

export default function App() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [messages, setMessages] = useState([]);
    const [conversationId, setConversationId] = useState('');

    const handleSendMessage = async (text: string) => {
        if (text.trim() === '') return;

        setMessages(prev => [...prev, { sender: 'user', text }]);

        try {
            const response = await chat.sendMessage(text, conversationId);

            if (!conversationId) setConversationId(response.conversation_id);

            setMessages(prev => [...prev, { sender: 'assistant', text: response.answer }]);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
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
                            <View style={{ flex: 1 }}>
                                <ChatMessages messages={messages} />
                            </View>
                            <InputBox onSendMessage={handleSendMessage} />
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
