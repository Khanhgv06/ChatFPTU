import React, { useState } from "react";
import { View, TextInput, Button, FlatList, Text, Image, StyleSheet } from "react-native";

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

      const botMessage = { role: "bot", content: data.reply, image: data.image || null };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <Text style={item.role === "user" ? styles.userText : styles.botText}>{item.content}</Text>
            {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
          </View>
        )}
      />
      <TextInput
        style={styles.input}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
  userText: { alignSelf: "flex-end", backgroundColor: "#DCF8C6", padding: 10, marginVertical: 5 },
  botText: { alignSelf: "flex-start", backgroundColor: "#E5E5EA", padding: 10, marginVertical: 5 },
  image: { width: 200, height: 200, marginVertical: 5, alignSelf: "center" },
});