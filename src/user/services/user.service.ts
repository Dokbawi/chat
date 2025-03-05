import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@src/common/interfaces/user.interface';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async userConnected(userId: string): Promise<User> {
    try {
      const user = await this.userModel.findOneAndUpdate(
        { userId },
        {
          lastSeen: new Date(),
          isOnline: true,
        },
        {
          upsert: true,
          new: true,
        },
      );

      if (!user.activeRooms) {
        user.activeRooms = [];
      }

      return user;
    } catch (error) {
      console.error('사용자 연결 처리 실패:', error);
      return {
        _id: userId,
        userId,
        lastSeen: new Date(),
        isOnline: true,
        activeRooms: [],
      } as User;
    }
  }

  async userDisconnected(userId: string): Promise<boolean> {
    try {
      await this.userModel.findOneAndUpdate(
        { userId },
        {
          lastSeen: new Date(),
          isOnline: false,
        },
      );
      return true;
    } catch (error) {
      console.error('사용자 연결 해제 처리 실패:', error);
      return false;
    }
  }
}
