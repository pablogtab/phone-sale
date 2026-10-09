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
import { CreateBankDto } from './dto/create-bank.dto';
import { SearchBankQueryDto } from './dto/search-bank-query.dto';
import { UpdateBankDto } from './dto/update-bank.dto';

@Injectable()
export class BanksService implements OnModuleInit {
  constructor(
    private readonly database: DatabaseService,
    private readonly accountingAccountsService: AccountingAccountsService,
  ) {}

  async search(data: SearchBankQueryDto) {
    return await this.database.bank.find({
      where: {
        name: containsText(data.query),
        deletedAt: IsNull(),
        active: data.active,
      },
    });
  }

  async onModuleInit() {
    const entities = await this.database.bank.find({
      where: { deletedAt: IsNull() },
    });
    for (const entity of entities) {
      for (const currency of ['usd', 'ars'] as const) {
        await this.accountingAccountsService.createIfNotExists({
          bankId: entity.id,
          type: 'bank',
          currency,
          name: entity.name,
          isAsset: true,
        });
      }
    }
  }

  @Transactional()
  async create(dto: CreateBankDto) {
    const bank = await this.database.bank.save(
      this.database.bank.create({ name: dto.name }),
    );

    await this.accountingAccountsService.createIfNotExists({
      currency: 'usd',
      bankId: bank.id,
      name: bank.name,
      type: 'bank',
      isAsset: true,
    });
    await this.accountingAccountsService.createIfNotExists({
      currency: 'ars',
      bankId: bank.id,
      name: bank.name,
      type: 'bank',
      isAsset: true,
    });

    return bank;
  }

  async findAll() {
    return await this.database.bank.find({
      where: { deletedAt: IsNull() },
      select: { publicId: true, name: true, active: true },
    });
  }

  async findOne(id: number) {
    const found = await this.database.bank.findOne({
      where: { id: id, deletedAt: IsNull() },
    });

    if (!found) throw new NotFoundException(`Bank with id <<${id}>> not found`);

    return found;
  }

  async update(uuid: string, dto: UpdateBankDto) {
    const bank = await this.database.bank.findOne({
      where: { publicId: uuid, deletedAt: IsNull() },
    });
    if (!bank)
      throw new NotFoundException(`Bank with id <<${uuid}>> not found`);

    const updated = await updateEntity(
      this.database.bank,
      { id: bank.id },
      { name: dto.name, active: dto.active },
    );

    delete updated.id;
    delete updated.deletedAt;

    return updated;
  }

  async remove(uuid: string) {
    const bank = await this.database.bank.findOne({
      where: { publicId: uuid, deletedAt: IsNull() },
    });
    if (!bank)
      throw new NotFoundException(`Bank with id <<${uuid}>> not found`);

    await updateEntity(
      this.database.bank,
      { id: bank.id },
      { deletedAt: new Date() },
    );

    return { message: `Bank with id <<${uuid}>> removed` };
  }
}
