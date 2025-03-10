import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { Conversation } from './Conversations';

interface SidebarProps {
    conversations: Conversation[];
    isCollapsed: boolean;
    clearMsg: () => void;
    newChat: () => void;
}

const Sidebar = ({ conversations, isCollapsed, clearMsg, newChat }: SidebarProps) => {
    return (
        <View style={[styles.container, isCollapsed ? styles.collapsed : styles.expanded]}>
            <View style={styles.menuItems}>
                <TouchableOpacity style={styles.menuItem} onPress={newChat}>
                    <Icon source="chat-plus" size={24} color="white" />
                    {!isCollapsed && <Text style={styles.menuText}>New chat</Text>}
                </TouchableOpacity>
                <View style={styles.separator} />
                {conversations.map((conversation) => (
                    <TouchableOpacity key={conversation.conversationId} style={styles.menuItem}>
                        {!isCollapsed && <Text style={styles.menuText}>ID: {conversation.conversationId}</Text>}
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.clearChatsItem} onPress={clearMsg}>
                    <Icon source="trash-can-outline" size={24} color="red" />
                    {!isCollapsed && <Text style={styles.clearChatsText}>Clear chats</Text>}
                </TouchableOpacity>
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
        flexDirection: 'column',
        paddingBottom: 16, 
    },
    collapsed: {
        width: 60,
    },
    expanded: {
        width: 260,
    },
    menuItems: {
        flex: 1, 
        justifyContent: 'flex-start',
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
    clearChatsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 'auto',
    },
    clearChatsText: {
        color: 'red',
        fontSize: 16,
    },
});

export default Sidebar;