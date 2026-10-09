import { Transactional } from '@/database/transactional';
import { IsNull } from 'typeorm';
import {
  updateEntity,
  removeEntity,
  optionalIn,
  containsText,
} from '@/database/repository-utils';
import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '../../database/database.service';
import { AuthService } from '../../auth/auth.service';
import { PublicUserDto } from './dto/public-user.dto';
import { AccountingAccountsService } from '../accounting-accounts/accounting-accounts.service';
import { SearchUserQueryDto } from './dto/search-user-query.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    private database: DatabaseService,
    private authService: AuthService,
    private accountingAccountsService: AccountingAccountsService,
  ) {}

  async onModuleInit() {
    const users = await this.database.user.find({
      where: { deletedAt: IsNull(), accountingAccounts: { id: IsNull() } },
    });
    for (const user of users) {
      for (const currency of ['usd', 'ars'] as const) {
        await this.accountingAccountsService.createIfNotExists({
          userId: user.id,
          type: 'user',
          currency,
          name: `${user.name} ${user.lastname}`,
          isAsset: false,
        });
      }
    }
  }

  async search(data: SearchUserQueryDto) {
    const users = await this.database.user.find({
      where: [
        { name: containsText(data.query) },
        { lastname: containsText(data.query) },
      ].map((condition) => ({ ...{ deletedAt: IsNull() }, ...condition })),
    });

    return users;
  }

  @Transactional()
  async create(data: CreateUserDto) {
    const existsUsername = await this.authService.existsUsername(data.username);

    if (existsUsername) {
      throw new HttpException(
        `Username '${data.username}' already exists`,
        400,
      );
    }

    const user = await this.database.user.save(
      this.database.user.create({
        name: data.name,
        lastname: data.lastname,
        permissions: data.permissions,
      }),
    );

    await this.authService
      .generateUserLoginWithUsername(user.id, data.username, data.password)
      .catch((err) => {
        removeEntity(this.database.user, { id: user.id });
        throw err;
      });
    await this.accountingAccountsService.createIfNotExists({
      userId: user.id,
      type: 'user',
      currency: 'usd',
      name: `${user.name} ${user.lastname}`,
      isAsset: false,
    });
    await this.accountingAccountsService.createIfNotExists({
      userId: user.id,
      type: 'user',
      currency: 'ars',
      name: `${user.name} ${user.lastname}`,
      isAsset: false,
    });

    return user;
  }

  async update(data: UpdateUserDto) {
    const user = await updateEntity(
      this.database.user,
      { id: data.id },
      {
        name: data.name,
        lastname: data.lastname,
        permissions: data.permissions,
      },
    );

    return user;
  }

  async getPublicUser(publicId: string): Promise<PublicUserDto> {
    const user = await this.database.user.findOne({
      where: { publicId: publicId },
    });
    if (!user) {
      throw new HttpException(`User not found`, 404);
    }

    return user;
  }

  async getUserById(id: number) {
    return await this.database.user.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async updateProfilePicture(userId: string, profilePicture: string) {
    await updateEntity(
      this.database.user,
      { publicId: userId },
      { profilePicture },
    );
  }

  async getFullUserByPublicId(publicId: string) {
    const user = await this.database.user.findOne({
      where: { publicId: publicId, deletedAt: IsNull() },
    });
    if (!user) {
      throw new HttpException(`User not found`, 404);
    }

    return user;
  }
}
