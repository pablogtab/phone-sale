import { environment } from '@/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenService {
  generateToken(payload: any) {
    return jwt.sign(payload, environment.token.secret, {
      expiresIn: environment.token.expiresIn as any,
    });
  }

  verifyToken(token: string) {
    try {
      const payload = jwt.verify(token, environment.token.secret);
      return payload;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
