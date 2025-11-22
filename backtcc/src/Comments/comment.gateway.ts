import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class CommentGateway implements OnGatewayConnection {
    @WebSocketServer() server: Server;

    handleConnection(client: Socket) {
        const { userId } = client.handshake.query as any;
        if (userId) {
            client.join(String(userId));
            console.log(`Socket ${client.id} joined room ${userId}`);
        }
    }

    @SubscribeMessage('register')
    handleRegister(client: Socket, payload: { userId?: string }) {
        if (payload?.userId) {
            client.join(String(payload.userId));
            client.emit('registered', { ok: true, userId: payload.userId });
            console.log(`Socket ${client.id} explicitly joined room ${payload.userId}`);
        }
    }

    sendNotificationToUser(userId: string, notification: any) {
        // Em qualquer lugar do backend (temporário, para teste)
        this.server.emit('notification', {
            id: `test-${Date.now()}`,
            title: 'TESTE BROADCAST',
            body: 'mensagem de teste broadcast',
            data: { type: 'comment', questionId: 1 },
            createdAt: new Date().toISOString()
        });
    }


}