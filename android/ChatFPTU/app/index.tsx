import React, { useState } from "react";
import { View, TextInput, Button, FlatList, Text, Image, StyleSheet, ScrollView } from "react-native";

export default function Index() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { role: "user", content: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    try {
      const response = await fetch("https://chatfptu.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputText }),
      });
      const data = await response.json();

      const botMessage = { 
        role: "bot", 
        content: data.reply, 
        image: null 
      };

      // Check if the bot reply is the specific message
      if (data.reply === "Xin mời bạn xem bản đồ") {
        botMessage.image = "https://chatfptu.onrender.com/map";  // Assign image URL from response
      }

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messageContainer}>
        <FlatList
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, item.role === "user" ? styles.userBubble : styles.botBubble]}>
              <Text style={item.role === "user" ? styles.userText : styles.botText}>{item.content}</Text>
              {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
            </View>
          )}
        />
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f9f9f9" },
  messageContainer: { flex: 1 },
  inputContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    padding: 10, 
    borderRadius: 25, 
    marginRight: 10, 
    backgroundColor: "#ffffff",
    elevation: 2,
  },
  userBubble: { 
    alignSelf: "flex-end", 
    backgroundColor: "#DCF8C6", 
    borderRadius: 15, 
    padding: 12, 
    marginVertical: 5, 
    maxWidth: "80%" 
  },
  botBubble: { 
    alignSelf: "flex-start", 
    backgroundColor: "#E5E5EA", 
    borderRadius: 15, 
    padding: 12, 
    marginVertical: 5, 
    maxWidth: "80%" 
  },
  userText: { color: "#000000" },
  botText: { color: "#000000" },
  image: { 
    width: 200, 
    height: 200, 
    marginTop: 10, 
    borderRadius: 10, 
    alignSelf: "center" 
  },
});
