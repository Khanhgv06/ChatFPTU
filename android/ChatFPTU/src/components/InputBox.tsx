import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { IconButton, Snackbar } from 'react-native-paper';
import ChatAPI from '../ChatAPI';

const chat = new ChatAPI();

const InputBox = ({ onSendMessage, helpTextIn }) => {
    const [text, setText] = useState('');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (helpTextIn) {
            setText(helpTextIn);
        }
    }, [helpTextIn]);
    
    const handleSendPress = async () => {
        if (text.trim() === '') return;
        onSendMessage(text);
        setText('');
    };

    const handleMicPress = () => {
        setVisible(true);
    };
    return (
        <View style={styles.inputContainer}>
            <IconButton
                icon="microphone"
                onPress={handleMicPress}
                style={styles.micButton}
                iconColor="#fff"
            />
            
            <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Message ChatFPTU"
                style={styles.textInput}
                placeholderTextColor="#808080"
            />
            
            <IconButton
                icon="send"
                onPress={handleSendPress}
                style={styles.sendButton}
                iconColor="#fff"
            />
            <Snackbar
                visible={visible}
                onDismiss={() => setVisible(false)}
                duration={2000}
            >
                Speech-to-text is not supported yet.
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    textInput: {
        flex: 1,
        height: 45,
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 15,
        backgroundColor: '#2a2a2a',
        color: '#fff',
    },
    micButton: { marginRight: 10, padding: 5 },
    sendButton: { marginLeft: 10, padding: 5 },
});

export default InputBox;
