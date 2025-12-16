import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function createChatCursoSocket(
    cursoId: string,
    onMessage: (msg: any) => void,
    onConnected: () => void,
    onTyping?: (data: { userId: string; userName: string; isTyping: boolean }) => void,
    onReadReceipt?: (data: { userId: string; userName: string; messageIds: string[] }) => void
) {
    const client = new Client({
        webSocketFactory: () => new SockJS(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/ws-chat`),
        onConnect: () => {
            // Subscribe to messages
            client.subscribe(`/topic/curso/${cursoId}`, (message) => {
                try {
                    const parsed = JSON.parse(message.body);
                    onMessage(parsed);
                } catch (error) {
                    console.error('Error parseando mensaje WebSocket:', error);
                }
            });

            // Subscribe to typing indicators
            if (onTyping) {
                client.subscribe(`/topic/curso/${cursoId}/typing`, (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        onTyping(data);
                    } catch (error) {
                        console.error('Error parseando typing indicator:', error);
                    }
                });
            }

            // Subscribe to read receipts
            if (onReadReceipt) {
                client.subscribe(`/topic/curso/${cursoId}/read-receipts`, (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        onReadReceipt(data);
                    } catch (error) {
                        console.error('Error parseando read receipt:', error);
                    }
                });
            }

            onConnected();
        },
        reconnectDelay: 5000,
    });

    client.activate();
    return client;
}

// Helper to send typing indicator
export function sendTypingIndicator(
    client: Client,
    cursoId: string,
    userId: string,
    userName: string,
    isTyping: boolean
) {
    client.publish({
        destination: `/app/chat-curso/${cursoId}/typing`,
        body: JSON.stringify({ userId, userName, isTyping }),
    });
}
