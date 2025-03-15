class ChatAPI {
    baseURL: string = "https://chatfptu.onrender.com";

    constructor() {

    }

    async isOnline() {
        try {
            const response = await fetch(this.baseURL);
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    async sendMessage(message: string, conversation_id: string) {
        try {
            const response = await fetch(`${this.baseURL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversation_id: conversation_id
                })
            });
            return await response.json();
        } catch (error) {
            throw new Error('Failed to send message');
        }
    }
}

export default ChatAPI;