import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') + '/ws-chat';

export function createNotificationSocket(onNotification: (notif: any) => void) {
    const client = new Client({
        webSocketFactory: () => new SockJS(SOCKET_URL),
        // ❌ ELIMINADO: connectHeaders con Authorization
        // Las cookies se envían automáticamente con SockJS
        onConnect: () => {
            console.log('WebSocket conectado');
            client.subscribe('/user/queue/notifications', (msg) => {
                const parsed = JSON.parse(msg.body);
                onNotification(parsed);
            });
        },
        onStompError: (frame) => {
            console.error('Error STOMP:', frame);
        },
        reconnectDelay: 5000,
    });

    client.activate();
    return client;
}
