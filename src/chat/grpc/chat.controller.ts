import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Message } from '@src/common/interfaces/message.interface';
import { ChatService } from './chat.service';
import { Observable, Subject } from 'rxjs';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @GrpcMethod('ChatService', 'SendMessage')
  sendMessage(data: Message): Promise<Message> {
    return this.chatService.processMessage(data);
  }

  @GrpcMethod('ChatService', 'StreamMessages')
  streamMessages(data: Message): Observable<Message> {
    return this.chatService.streamMessages(data);
  }
}