import { Module } from '@nestjs/common';
import { ChatController } from './grpc/chat.controller';
import { ChatService } from './grpc/chat.service';
import { ChatGateway } from './socket/chat.gateway';

@Module({
  controllers: [ChatController],
  providers: [ChatService,ChatGateway],
})
export class ChatModule {}