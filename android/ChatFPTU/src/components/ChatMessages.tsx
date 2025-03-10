import React, { useState } from 'react';
import { FlatList, StyleSheet, View, Image, Modal, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';

const ChatMessages = ({ messages }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const openImage = (imageUri) => {
        setSelectedImage(imageUri);
        setModalVisible(true);
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
                                        <TouchableOpacity onPress={() => openImage(imageUri)} key={imageUri}>
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

            {/* Full-screen Image Modal */}
            <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                <TouchableOpacity style={styles.modalBackground} onPress={() => setModalVisible(false)}>
                    <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} />
                </TouchableOpacity>
            </Modal>
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
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: '90%',
        height: '80%',
        resizeMode: 'contain',
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
