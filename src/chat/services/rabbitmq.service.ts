import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Channel, connect, Connection } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import {
  ChatMessage,
  ChatReadMessage,
} from '@src/common/interfaces/chat.interface';
import { RoomService } from './room.service';
import { Server } from 'socket.io';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private exchanges = new Set<string>();

  constructor(
    @Inject(forwardRef(() => RoomService))
    private roomService: RoomService,

    @Inject('RABBITMQ_CONNECTION')
    private readonly connection: Connection,
    @Inject('RABBITMQ_CHANNEL')
    private readonly channel: Channel,
  ) {}

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  async ensureExchange(exchangeName: string) {
    if (!this.exchanges.has(exchangeName)) {
      await this.channel.assertExchange(exchangeName, 'topic', {
        durable: true,
      });
      this.exchanges.add(exchangeName);
    }
  }

  async sendMessage(message: ChatMessage): Promise<boolean> {
    try {
      await this.ensureExchange('chat_topic');
      const participants = (
        await this.roomService.getRoomParticipants(message.roomId)
      ).filter((participant) => participant !== message.from);

      const result = await Promise.all(
        participants.map(async (userId) => {
          const queueName = `room.${message.roomId}.user.${userId}`;

          return this.channel.publish(
            `chat_topic`,
            queueName,
            Buffer.from(JSON.stringify(message)),
            { persistent: true },
          );
        }),
      );

      return result;
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      return false;
    }
  }

  async sendReadMessage(message: ChatReadMessage): Promise<boolean> {
    try {
      const participants = (
        await this.roomService.getRoomParticipants(message.roomId)
      ).filter((participant) => participant !== message.readerId);

      const result = await Promise.all(
        participants.map(async (userId) => {
          const queueName = `room.${message.roomId}.user.${userId}.read`;

          return this.channel.publish(
            `chat_topic`,
            queueName,
            Buffer.from(JSON.stringify(message)),
            { persistent: true },
          );
        }),
      );

      return result;
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      return false;
    }
  }

  async comsumeChatMessage(userId: string, server: Server) {
    const routingKey = `room.*.user.${userId}`;
    console.log(`메시지 수신 대기: ${routingKey}`);

    await this.consumeMessages(
      routingKey,
      `user.${routingKey}.queue`,
      (message) => {
        console.log('수신된 메시지:', message);

        const processedMessage = {
          ...message,
          processed: true,
          timestamp: new Date(),
        };

        server.emit('receiveMessage', processedMessage);
      },
    );
  }

  async consumeReadMessage(userId: string, server: Server) {
    const routingKey = `room.*.user.${userId}.read`;
    console.log(`메시지 수신 대기: ${routingKey}`);

    await this.consumeMessages(
      routingKey,
      `user.${routingKey}.queue`,
      (message) => {
        const processedMessage = {
          ...message,
          processed: true,
          timestamp: new Date(),
        };

        server.emit('receiveMessage', processedMessage);
      },
    );
  }

  async consumeMessages(
    routingKey: string,
    queueName: string,
    onMessage: (msg: any) => void,
  ) {
    await this.ensureExchange('chat_topic');

    await this.channel.assertQueue(queueName, { durable: true });

    await this.channel.bindQueue(queueName, 'chat_topic', routingKey);
    this.channel.consume(queueName, (msg) => {
      if (msg) {
        const messageContent = JSON.parse(msg.content.toString());
        console.log(`메시지 수신: ${JSON.stringify(messageContent)}`);

        onMessage(messageContent);
        this.channel.ack(msg);
      }
    });
    return;
  }

  async cancelConsumer(consumerTag: string) {
    await this.channel.cancel(consumerTag);
  }

  async createRoomQueue(roomId: string, userId: string): Promise<string> {
    const queueName = `room.${roomId}.user.${userId}`;
    await this.channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        'x-message-ttl': 1000 * 60 * 60 * 24 * 7,
        'x-max-length': 1000,
      },
    });
    return queueName;
  }
}
