import React from 'react';
import { Text, TouchableOpacity, View} from 'react-native';
import { Icon } from 'react-native-paper';

interface HeaderProps {
    onToggle: () => void;
}

const Header = ({ onToggle }: HeaderProps) => (
    <View style={{ 
        height: 60, 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16,
    }}>
        <TouchableOpacity onPress={onToggle}>
            <Icon source="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ 
            color: 'white', 
            fontSize: 20, 
            fontWeight: 'bold',
            marginLeft: 16 
        }}>
            ChatFPTU
        </Text>
    </View>
);

export default Header;