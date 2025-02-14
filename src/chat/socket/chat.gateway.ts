import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { ChatService } from '../grpc/chat.service';
import { Message } from '@src/common/interfaces/message.interface';
import { SocketLoggingInterceptor } from '@src/common/interceptors/socket-logging.interceptor';
import { UseInterceptors } from '@nestjs/common';
  
  @WebSocketGateway({
    cors: {
      origin: '*',  
    },
  })
  @UseInterceptors(SocketLoggingInterceptor)
  export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    constructor(private readonly chatService: ChatService) {}
  
    handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('sendMessage')
    async handleMessage(client: Socket, payload: Message) {
      try {
        const processedMessage = await this.chatService.processMessage(payload);
        
        this.server.emit('newMessage', processedMessage);
        
        return processedMessage;
      } catch (error) {
        client.emit('error', { message: 'Failed to process message' });
      }
    }
  
    @SubscribeMessage('startStreaming')
    handleStreamStart(client: Socket, payload: Message) {
      const messageStream = this.chatService.streamMessages(payload);
      
      messageStream.subscribe({
        next: (message: Message) => {
          client.emit('streamMessage', message);
        },
        error: (error) => {
          client.emit('error', { message: 'Stream error occurred' });
        },
      });
    }
  }