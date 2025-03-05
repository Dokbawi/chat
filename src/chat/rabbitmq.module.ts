import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { connect, Connection, Channel } from 'amqplib';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'RABBITMQ_CONNECTION',
      useFactory: async (configService: ConfigService) => {
        const url = configService.get<string>('RABBITMQ_URL');
        const connection = await connect(url);
        return connection;
      },
      inject: [ConfigService],
    },
    {
      provide: 'RABBITMQ_CHANNEL',
      useFactory: async (connection: Connection) => {
        const channel = await connection.createChannel();
        return channel;
      },
      inject: ['RABBITMQ_CONNECTION'],
    },
  ],
  exports: ['RABBITMQ_CONNECTION', 'RABBITMQ_CHANNEL'],
})
export class RabbitMQModule {}
