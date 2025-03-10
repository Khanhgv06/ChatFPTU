import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    return (
        <View style={[styles.container, isCollapsed ? styles.collapsed : styles.expanded]}>
            <View style={styles.menuItems}>
                
                <TouchableOpacity style={styles.menuItem}>
                    <Icon source="chat-plus" size={24} color="white" />
                    {!isCollapsed && <Text style={styles.menuText}>New chat</Text>}
                </TouchableOpacity>
                <View style={styles.separator} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2a2a2a',
        height: '100%',
        borderRightWidth: 1,
        borderRightColor: '#3a3a3a',
    },
    collapsed: {
        width: 60,
    },
    expanded: {
        width: 260,
    },
    menuItems: {
        padding: 16,
    },
    menuItem: {
        paddingTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    menuText: {
        color: 'white',
        fontSize: 16,
    },  
    separator: {
        height: 1,
        backgroundColor: '#CCCCCC',
    },
});
