import { CanActivate, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: any,
  ): boolean | any | Promise<boolean> | Observable<boolean> {
    const client: Socket = context.switchToWs().getClient();
    
    if (process.env.NODE_ENV === 'development') {
      const testUserId = client.handshake.headers.userid || 'test-user-1';

      console.log('testUserId : ',testUserId)
      client.data.userId = testUserId;
      return true;
    }

    const token = client.handshake.headers.authorization?.split(' ')[1];
    
    try {
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      return true;
    } catch (err) {
      return false;
    }
  }
}