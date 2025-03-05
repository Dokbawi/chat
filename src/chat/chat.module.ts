import { Module } from '@nestjs/common';
import { ChatGateway } from './socket/chat.gateway';
import { RabbitMQService } from './services/rabbitmq.service';
import { UserModule } from '@src/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '@src/user/services/user.service';
import { WsAuthGuard } from '@src/guards/ws-auth.guard';
import { RoomService } from './services/room.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '@src/user/schemas/user.schemas';
import { ChatRoomSchema } from './schemas/chatroom.schema';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'ChatRoom', schema: ChatRoomSchema },
    ]),

    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [],
  providers: [
    ChatGateway,
    RabbitMQService,
    UserService,
    WsAuthGuard,
    RoomService,
  ],
  exports: [RabbitMQService],
})
export class ChatModule {}
