import { Transactional } from '@/database/transactional';
import { IsNull } from 'typeorm';
import {
  updateEntity,
  removeEntity,
  optionalIn,
  containsText,
} from '@/database/repository-utils';
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateCashAccountDto } from './dto/create-cash-account.dto';
import { UpdateCashAccountDto } from './dto/update-cash-account.dto';
import { DatabaseService } from '../../database/database.service';
import { AccountingAccountsService } from '../accounting-accounts/accounting-accounts.service';
import { SearchCashAccountQueryDto } from './dto/search-cash-account-query.dto';

@Injectable()
export class CashAccountsService implements OnModuleInit {
  constructor(
    private readonly database: DatabaseService,
    private accountingAccountsService: AccountingAccountsService,
  ) {}

  async search(data: SearchCashAccountQueryDto) {
    return await this.database.cashAccount.find({
      where: {
        name: containsText(data.query),
        deletedAt: IsNull(),
        active: data.active,
      },
    });
  }

  async onModuleInit() {
    const entities = await this.database.cashAccount.find({
      where: { deletedAt: IsNull() },
    });
    for (const entity of entities) {
      for (const currency of ['usd', 'ars'] as const) {
        await this.accountingAccountsService.createIfNotExists({
          cashAccountId: entity.id,
          type: 'cash_account',
          currency,
          name: entity.name,
          isAsset: true,
        });
      }
    }
  }

  @Transactional()
  async create(dto: CreateCashAccountDto) {
    const cashAcc = await this.database.cashAccount.save(
      this.database.cashAccount.create({ name: dto.name }),
    );

    await this.accountingAccountsService.createIfNotExists({
      cashAccountId: cashAcc.id,
      type: 'cash_account',
      currency: 'usd',
      name: dto.name,
      isAsset: true,
    });

    await this.accountingAccountsService.createIfNotExists({
      cashAccountId: cashAcc.id,
      type: 'cash_account',
      currency: 'ars',
      name: dto.name,
      isAsset: true,
    });

    return cashAcc;
  }

  async findAll() {
    return await this.database.cashAccount.find({
      where: { deletedAt: IsNull() },
      select: { publicId: true, name: true, active: true },
    });
  }

  async findOne(id: number) {
    const found = await this.database.cashAccount.findOne({
      where: { id: id, deletedAt: IsNull() },
    });

    if (!found)
      throw new NotFoundException(`CashAccount with id <<${id}>> not found`);

    return found;
  }

  async update(uuid: string, dto: UpdateCashAccountDto) {
    const cashAccount = await this.database.cashAccount.findOne({
      where: { publicId: uuid, deletedAt: IsNull() },
    });
    if (!cashAccount)
      throw new NotFoundException(`CashAccount with id <<${uuid}>> not found`);

    const updated = await updateEntity(
      this.database.cashAccount,
      { id: cashAccount.id },
      { name: dto.name, active: dto.active },
    );

    delete updated.id;
    delete updated.deletedAt;

    return updated;
  }

  async remove(uuid: string) {
    const cashAccount = await this.database.cashAccount.findOne({
      where: { publicId: uuid, deletedAt: IsNull() },
    });
    if (!cashAccount)
      throw new NotFoundException(`CashAccount with id <<${uuid}>> not found`);

    await updateEntity(
      this.database.cashAccount,
      { id: cashAccount.id },
      { deletedAt: new Date() },
    );

    return { message: `CashAccount with id <<${uuid}>> removed` };
  }
}
