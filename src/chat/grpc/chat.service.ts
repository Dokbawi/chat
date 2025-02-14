import { Injectable } from '@nestjs/common';
import { Message } from '@src/common/interfaces/message.interface';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ChatService {
  private messageSubject = new Subject<Message>();

  async processMessage(data: Message): Promise<Message> {
    return {
      ...data,
      timestamp: Date.now(),
    };
  }

  streamMessages(data: Message): Observable<Message> {
    this.messageSubject.next(data);
    return this.messageSubject.asObservable();
  }
}