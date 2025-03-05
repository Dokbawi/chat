import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ChatRoom extends Document {
  @Prop({ required: true, unique: true })
  roomId: string;

  @Prop({ type: [String], required: true })
  participants: string[];

  @Prop({ required: true, enum: ['direct', 'group'] })
  type: string;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);