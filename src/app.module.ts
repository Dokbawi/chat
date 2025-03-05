import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserModule } from './user/user.module';
import { RabbitMQModule } from './chat/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://admin:password@localhost:27017', {
      dbName: 'chat',
    }),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:password@localhost:5672'],
          queue: 'chat',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    ChatModule,
    UserModule,
    RabbitMQModule,
  ],
})
export class AppModule {}
