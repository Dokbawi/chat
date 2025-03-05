import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RabbitMQService } from './rabbitmq.service';
import { v4 as uuidv4 } from 'uuid';
import { ChatRoom } from '@src/common/interfaces/chat.interface';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel('ChatRoom') private roomModel: Model<ChatRoom>,

    @Inject(forwardRef(() => RabbitMQService))
    private rabbitMQService: RabbitMQService,
  ) {}

  async createRoom(
    participants: string[],
    type: 'direct' | 'group',
  ): Promise<ChatRoom> {
    const roomId = uuidv4();
    const room = await this.roomModel.create({
      roomId,
      participants,
      type,
    });

    return room.save();
  }

  async getRoomParticipants(roomId: string): Promise<string[]> {
    const room = await this.roomModel.findOne({ roomId });
    return room?.participants || [];
  }
}
