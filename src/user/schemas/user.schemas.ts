import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ default: Date.now })
  lastSeen: Date;

  @Prop({ default: false })
  isOnline: boolean;

  @Prop({ type: [String], default: [] })
  activeChats: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);