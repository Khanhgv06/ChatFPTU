import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

interface HelpButtonProps {
    setInputText: (input: string) => void;
}

const HelpButtons = ({ setInputText }: HelpButtonProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>What can I help with?</Text>
            <View style={styles.buttonContainer}>
                <Button
                    icon="office-building-marker-outline"
                    mode="outlined"
                    onPress={() => setInputText("Tòa Alpha ở đâu?")}
                    style={styles.button}
                    labelStyle={styles.buttonText}>
                    Tòa Alpha ở đâu?
                </Button>
                <Button
                    icon="credit-card"
                    mode="outlined"
                    onPress={() => setInputText("Cách nạp tiền vào ví FAP?")}
                    style={styles.button}
                    labelStyle={styles.buttonText}>
                    Cách nạp tiền vào ví FAP?
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#fff',
    },
    buttonContainer: {
        width: '100%',
    },
    button: {
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#007bff',
    },
    buttonText: {
        fontSize: 16,
    },
});

export default HelpButtons;
