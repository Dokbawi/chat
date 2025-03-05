import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schemas';

@Module({
  imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    
  ],
  controllers: [],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}