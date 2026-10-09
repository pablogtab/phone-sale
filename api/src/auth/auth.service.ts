import { IsNull } from 'typeorm';
import { PermissionConfig } from '@/common';
import { PublicException } from '@/common/public.exception';
import { HttpException, Injectable } from '@nestjs/common';
import { createPassword, verifyPassword } from './password';

import { DatabaseService } from '../database/database.service';
import { TokenInfo } from './dto/token-info.dto';

@Injectable()
export class AuthService {
  constructor(private database: DatabaseService) {}

  async getUserData(userId: number): Promise<TokenInfo> {
    const user = await this.database.user.findOne({ where: { id: userId } });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return {
      id: user.id,
      lastname: user.lastname,
      name: user.name,
      permissions: user.permissions as PermissionConfig,
      role: user.role,
      userId: user.publicId,
    };
  }

  async generateUserLoginWithUsername(
    userId: number,
    username: string,
    password: string,
  ) {
    if (await this.existsUsername(username)) {
      throw new HttpException('Username already exists', 400);
    }

    const { salt, hash: hashedPassword } = await createPassword(password);

    await this.database.userAuth.save(
      this.database.userAuth.create({
        username,
        hash: hashedPassword,
        salt: salt,
        userId,
      }),
    );
  }

  async validateUsernameAndPassword(username: string, password: string) {
    const userAuth = await this.database.userAuth.findOne({
      where: {
        deletedAt: IsNull(),
        active: true,
        username,
        user: { deletedAt: IsNull() },
      },
    });

    if (!userAuth) {
      throw new PublicException('Username or password incorrect');
    }

    const valid = await verifyPassword(password, userAuth.salt, userAuth.hash);

    if (!valid) {
      throw new PublicException('Username or password incorrect');
    }

    return userAuth;
  }

  async existsUsername(username: string) {
    const userAuth = await this.database.userAuth.findOne({
      where: { deletedAt: IsNull(), username },
    });
    return !!userAuth;
  }
}
