import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, FlatList, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, PanResponder, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, StatusBar } from "react-native";
import Markdown from "react-native-markdown-display";
import { Stack } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage'; // For persistence
import Icon from 'react-native-vector-icons/MaterialIcons'; // For sidebar and button icons

const API_URL = "https://chatfptu.onrender.com"; // Flask Backend URL

export default function Index() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [serverOnline, setServerOnline] = useState(null);
  const [conversationId, setConversationId] = useState(""); // Store conversation ID
  const [loading, setLoading] = useState(false); // State to handle loading
  const [sidebarVisible, setSidebarVisible] = useState(false); // For sidebar visibility
  const [conversations, setConversations] = useState([]); // To store multiple conversations
  const flatListRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20; // Detect swipe movement
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < -100) {
          setSidebarVisible(false); // Close sidebar on swipe left
        }
      },
    })
  ).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#121212'); // Set background color to match the theme

    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/`);
        setServerOnline(response.status === 200);
      } catch (error) {
        setServerOnline(false);
      }
    };
    checkServerStatus();
    loadConversations(); // Load conversations when the app starts
  }, []);

  // Load conversations from AsyncStorage
  const loadConversations = async () => {
    try {
      const storedConversations = await AsyncStorage.getItem("conversations");
      if (storedConversations) {
        setConversations(JSON.parse(storedConversations));
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  // Save conversations to AsyncStorage
  const saveConversations = async () => {
    try {
      await AsyncStorage.setItem("conversations", JSON.stringify(conversations));
    } catch (error) {
      console.error("Error saving conversations:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !serverOnline) return;

    const userMessage = { role: "user", content: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputText, conversation_id: conversationId }),
      });
      const responseText = await response.text();

      if (!response.ok) throw new Error("Error: " + response.statusText);

      const data = await response.json();
      const botMessage = { role: "bot", content: data.response };
      setMessages((prev) => [...prev, botMessage]);

      // Save this conversation
      const newConversation = { id: conversationId, messages: [...messages, userMessage, botMessage] };
      setConversations((prev) => [...prev, newConversation]);
      saveConversations(); // Save the updated conversations
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleConversationClick = (id) => {
    const selectedConversation = conversations.find(conv => conv.id === id);
    setConversationId(id);
    setMessages(selectedConversation ? selectedConversation.messages : []);
  };

  const handleAddConversation = () => {
    const newConversationId = `conversation_${Date.now()}`;
    setConversationId(newConversationId);
    setMessages([]);
    setConversations(prev => [
      ...prev,
      { id: newConversationId, messages: [] }
    ]);
    saveConversations();
  };

  const handleRemoveConversation = (id) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    saveConversations();
    if (conversationId === id) {
      setConversationId('');
      setMessages([]);
    }
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Use different behavior for iOS and Android
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <Stack.Screen options={{ header: () => null }} />
          {serverOnline === false && <Text style={styles.offlineText}>Server Offline</Text>}

          <View style={styles.header}>
            <TouchableOpacity onPress={toggleSidebar}>
              <Icon name={sidebarVisible ? "close" : "menu"} size={30} color="#1e90ff" />
            </TouchableOpacity>
          </View>

          {/* Sidebar */}
          {sidebarVisible && (
            <View
              {...panResponder.panHandlers}
              style={styles.sidebar}
            >
              <Text style={styles.sidebarTitle}>Conversations</Text>
              <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View>
                    <TouchableOpacity onPress={() => handleConversationClick(item.id)} style={styles.sidebarItem}>
                      <Text style={styles.sidebarItemText}>Conversation {item.id}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveConversation(item.id)} style={styles.removeButton}>
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              <TouchableOpacity onPress={handleAddConversation} style={styles.addButton}>
                <Text style={styles.addButtonText}>Add New Conversation</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Main Chat Interface */}
          {messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <Image source={require("../assets/images/chatfptu.png")} style={styles.logo} />
              <Text style={styles.welcomeText}>ChatFPTU</Text>
              <Text style={styles.instructions}>Ask a question below</Text>
            </View>
          )}

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={[styles.messageBubble, item.role === "user" ? styles.userBubble : styles.botBubble]}>
                <Markdown style={item.role === "user" ? styles.userText : styles.botText}>{item.content}</Markdown>
                {item.role === "bot" && (
                  <TouchableOpacity onPress={handleSpeechToText} style={styles.sttButton}>
                    <Icon name="mic" size={24} color="#ffffff" />
                  </TouchableOpacity>
                )}
                {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
              </View>
            )}
          />

          {loading && <ActivityIndicator size="large" color="#1e90ff" style={styles.loadingIndicator} />}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              editable={serverOnline && !loading}
            />
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="volume-up" size={30} color="#1e90ff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={sendMessage} disabled={!serverOnline || loading} style={styles.iconButton}>
              <Icon name="send" size={30} color="#1e90ff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#121212", marginTop: Platform.OS === 'ios' ? 20 : 0 },
  offlineText: { color: "#ff5252", textAlign: "center", marginBottom: 10 },
  welcomeContainer: { alignItems: "center", justifyContent: "center", marginTop: 50, marginBottom: 20 },
  logo: { width: 150, height: 150, marginBottom: 20 },
  welcomeText: { fontSize: 24, color: "#ffffff", fontWeight: "bold", marginBottom: 10 },
  instructions: { color: "#888", fontSize: 16 },
  inputContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: { flex: 1, borderWidth: 1, padding: 10, borderRadius: 25, marginRight: 10, backgroundColor: "#333", color: "#ffffff", borderColor: "#555" },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#1f7a8c", borderRadius: 15, padding: 12, marginVertical: 5, maxWidth: "80%" },
  botBubble: { alignSelf: "flex-start", backgroundColor: "#37474f", borderRadius: 15, padding: 12, marginVertical: 5, maxWidth: "80%" },
  userText: { color: "#ffffff" },
  botText: { color: "#ffffff" },
  image: { width: 200, height: 200, marginTop: 10, borderRadius: 10, alignSelf: "center" },
  loadingIndicator: { marginTop: 20 },
  sidebar: {
    position: "absolute", top: 0, left: 0, width: "70%", height: "100%", backgroundColor: "#222", padding: 20, zIndex: 1000,
  },
  sidebarTitle: { fontSize: 22, color: "#fff", marginBottom: 10 },
  sidebarItem: { padding: 10, backgroundColor: "#333", borderRadius: 5, marginVertical: 5 },
  sidebarItemText: { color: "#fff" },
  removeButton: { padding: 10, backgroundColor: "#ff5252", borderRadius: 5, marginTop: 5 },
  removeButtonText: { color: "#fff" },
  addButton: { backgroundColor: "#1e90ff", padding: 15, borderRadius: 25, marginTop: 20 },
  addButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  iconButton: { marginHorizontal: 10 },
  sttButton: { marginTop: 10, alignSelf: "flex-end" },
  header: { paddingVertical: 20, alignItems: "flex-start" },
});
