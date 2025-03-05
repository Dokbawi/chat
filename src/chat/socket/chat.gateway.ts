import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RabbitMQService } from '../services/rabbitmq.service';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '@src/user/services/user.service';
import { WsAuthGuard } from '@src/guards/ws-auth.guard';
import { SocketLoggingInterceptor } from '@src/common/interceptors/socket-logging.interceptor';
import { RoomService } from './../services/room.service';
import { ChatMessage } from '@src/common/interfaces/chat.interface';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
})
@UseGuards(WsAuthGuard)
@UseInterceptors(SocketLoggingInterceptor)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly userService: UserService,
    private readonly roomService: RoomService,
  ) {}
  async handleConnection(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.headers.userid as string;
    const user = await this.userService.userConnected(userId);
    if (user && userId) {
      await this.setupGlobalMessageHandlers(user.userId);
    }
  }

  processMessage(message: any) {
    return {
      ...message,
      processed: true,
      timestamp: new Date(),
    };
  }

  async onModuleInit() {}

  async setupGlobalMessageHandlers(userId: string) {
    await this.rabbitMQService.comsumeChatMessage(userId, this.server);
    await this.rabbitMQService.consumeReadMessage(userId, this.server);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (client.data.consumers) {
      for (const consumer of client.data.consumers) {
        await this.rabbitMQService.cancelConsumer(consumer);
      }
    }
    await this.userService.userDisconnected(userId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; content: string },
  ) {
    const message: ChatMessage = {
      id: uuidv4(),
      roomId: payload.roomId,
      from: client.data.userId,
      content: payload.content,
      timestamp: new Date(),
      readBy: [client.data.userId],
    };

    return this.rabbitMQService.sendMessage(message);
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { messageId: string; roomId: string; readerId: string },
  ) {
    const { roomId, messageId, readerId } = payload;
    const readReceipt = { roomId, messageId, readerId, readAt: new Date() };

    await this.rabbitMQService.sendReadMessage(readReceipt);
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { participants: string[]; type: 'direct' | 'group' },
  ) {
    return this.roomService.createRoom(
      [client.data.userId, ...payload.participants],
      payload.type,
    );
  }
}
