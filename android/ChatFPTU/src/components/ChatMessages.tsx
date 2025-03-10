import React, { useState } from 'react';
import { FlatList, StyleSheet, View, Image, Linking, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';

const ChatMessages = ({ messages }) => {

    const openImageLink = (imageUri) => {
        Linking.openURL(imageUri).catch(err => console.error('An error occurred', err));
    };

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.assistantMessage]}>
                        <Markdown
                            style={markdownStyles}
                            rules={{
                                image: (node) => {
                                    const imageUri = node.attributes.src;
                                    return (
                                        <TouchableOpacity onPress={() => openImageLink(imageUri)} key={imageUri}>
                                            <Image source={{ uri: imageUri }} style={markdownStyles.image} />
                                        </TouchableOpacity>
                                    );
                                },
                            }}
                        >
                            {item.text}
                        </Markdown>
                    </View>
                )}
                style={styles.container}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 10,
    },
    messageContainer: {
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        maxWidth: '80%',
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#007aff',
    },
    assistantMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#2a2a2a',
    },
});

const markdownStyles = StyleSheet.create({
    text: {
        color: '#fff',
    },
    link: {
        color: '#ffcc00',
    },
    strong: {
        fontWeight: 'bold',
    },
    em: {
        fontStyle: 'italic',
    },
    code_block: {
        backgroundColor: '#333',
        padding: 5,
        borderRadius: 5,
        fontFamily: 'monospace',
    },
    image: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginVertical: 5,
    },
});

export default ChatMessages;
