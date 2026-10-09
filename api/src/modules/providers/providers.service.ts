import { Transactional } from '@/database/transactional';
import { IsNull } from 'typeorm';
import {
  updateEntity,
  removeEntity,
  optionalIn,
  containsText,
} from '@/database/repository-utils';
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { AccountingAccountsService } from '../accounting-accounts/accounting-accounts.service';
import { DatabaseService } from '../../database/database.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { SearchProviderQueryDto } from './dto/search-provider-query.dto';

@Injectable()
export class ProvidersService implements OnModuleInit {
  constructor(
    private readonly database: DatabaseService,
    private readonly accountingAccountsService: AccountingAccountsService,
  ) {}

  async onModuleInit() {
    const entities = await this.database.provider.find({
      where: { deletedAt: IsNull() },
    });
    for (const entity of entities) {
      for (const currency of ['usd', 'ars'] as const) {
        await this.accountingAccountsService.createIfNotExists({
          providerId: entity.id,
          type: 'provider',
          currency,
          name: entity.name,
          isAsset: false,
        });
      }
    }
  }

  @Transactional()
  async create(dto: CreateProviderDto) {
    const provider = await this.database.provider.save(
      this.database.provider.create({ name: dto.name }),
    );

    await this.accountingAccountsService.createIfNotExists({
      providerId: provider.id,
      type: 'provider',
      currency: 'usd',
      name: dto.name,
      isAsset: false,
    });
    await this.accountingAccountsService.createIfNotExists({
      providerId: provider.id,
      type: 'provider',
      currency: 'ars',
      name: dto.name,
      isAsset: false,
    });

    return provider;
  }

  async findAll() {
    return await this.database.provider.find({
      where: { deletedAt: IsNull() },
      select: { publicId: true, name: true, active: true },
    });
  }

  async findOne(uuid: string) {
    const found = await this.database.provider.findOne({
      where: { publicId: uuid, deletedAt: IsNull() },
    });

    if (!found)
      throw new NotFoundException(`Provider with id <<${uuid}>> not found`);

    return found;
  }

  async findOneById(id: number) {
    const found = await this.database.provider.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!found)
      throw new NotFoundException(`Provider with id <<${id}>> not found`);

    return found;
  }

  async update(uuid: string, dto: UpdateProviderDto) {
    const provider = await this.database.provider.findOne({
      where: { publicId: uuid, deletedAt: IsNull() },
    });
    if (!provider)
      throw new NotFoundException(`Provider with id <<${uuid}>> not found`);

    const updated = await updateEntity(
      this.database.provider,
      { id: provider.id },
      { name: dto.name, active: dto.active },
    );

    return updated;
  }

  async remove(uuid: string) {
    const provider = await this.database.provider.findOne({
      where: { publicId: uuid, deletedAt: IsNull() },
    });
    if (!provider)
      throw new NotFoundException(`Provider with id <<${uuid}>> not found`);

    await updateEntity(
      this.database.provider,
      { id: provider.id },
      { deletedAt: new Date() },
    );

    return { message: `Provider with id <<${uuid}>> removed` };
  }

  async search(data: SearchProviderQueryDto) {
    const providers = await this.database.provider.find({
      where: { deletedAt: IsNull(), name: containsText(data.query) },
      take: 20,
    });

    return providers;
  }
}
