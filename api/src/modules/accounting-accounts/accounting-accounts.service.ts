import { IsNull } from 'typeorm';
import {
  updateEntity,
  removeEntity,
  optionalIn,
  containsText,
} from '@/database/repository-utils';
import { HttpException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateAccountingAccountDto } from './dto/create-accounting-account.dto';
import { AccountingAccountType, Currency } from '@/database/entities';
import { GetAccountingAccountsQuery } from './dto/get-accounting-accounts-query.dto';
import { GetAccountingTransactionsQuery } from './dto/get-accounting-transactions-query.dto';

@Injectable()
export class AccountingAccountsService {
  constructor(private database: DatabaseService) {}

  async findAll(query: GetAccountingAccountsQuery) {
    const { key } = getIdByType(query.type, query);

    return await this.database.accountingAccount.find({
      where: [{ name: containsText(query.query) }].map((condition) => ({
        ...{
          type: query.type,
          deletedAt: IsNull(),
          ...(query.entityId && key ? { [key]: query.entityId } : {}),
        },
        ...condition,
      })),
      order: { name: 'asc' },
    });
  }

  async createIfNotExists(data: CreateAccountingAccountDto) {
    const account = await this.getAccountByType(data);
    if (account) {
      return account;
    }

    return await this.database.accountingAccount.save(
      this.database.accountingAccount.create({
        name: data.name,
        currency: data.currency,
        type: data.type,
        bankId: data.bankId,
        providerId: data.providerId,
        cashAccountId: data.cashAccountId,
        userId: data.userId,
        clientId: data.clientId,
        isAsset: data.isAsset,
      }),
    );
  }

  async getAccountByEntityId(data: {
    entityId: number;
    type: AccountingAccountType;
    currency: Currency;
  }) {
    const { key } = getIdByType(data.type, data);

    if (!key) {
      throw new HttpException('Invalid key', 400);
    }

    return await this.database.accountingAccount.findOne({
      where: {
        [key]: data.entityId,
        currency: data.currency,
        deletedAt: IsNull(),
      },
    });
  }

  async getAccountByType(data: {
    type: AccountingAccountType;
    currency: Currency;
    bankId?: number;
    providerId?: number;
    cashAccountId?: number;
    userId?: number;
    clientId?: number;
  }) {
    const { id, key } = getIdByType(data.type, data);

    if (!id || !key) {
      throw new HttpException('Invalid id', 400);
    }

    return await this.database.accountingAccount.findOne({
      where: { [key]: id, currency: data.currency, deletedAt: IsNull() },
    });
  }

  async getAccountById(id: number) {
    return await this.database.accountingAccount.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async updateAccountBalance(accountId: number, amount: number) {
    return await this.database.accountingAccount.increment(
      { id: accountId },
      'balance',
      amount,
    );
  }

  async findTransactions(query: GetAccountingTransactionsQuery) {
    const { key } = getIdByType(query.type, query);

    const transactions = await this.database.accountingTransaction.find({
      where: {
        accountingAccount: {
          type: query.type,
          [key]: query.entityId,
          ...(query.currency ? { currency: optionalIn(query.currency) } : {}),
        },
      },
      relations: { event: { orders: true }, accountingAccount: true },
      take: query.limit,
      order: {
        createdAt: 'desc',
      },
    });

    return transactions.map((t) => ({
      accountingAccountId: t.accountingAccountId,
      amount: t.amount,
      createdAt: t.createdAt,
      date: t.date,
      eventId: t.eventId,
      description: t.description,
      event: {
        type: t.event.type,
        description: t.event.description,
        order: t.event.orders?.[0],
      },
      currency: t.accountingAccount.currency,
    }));
  }
}

function getIdByType(
  type: AccountingAccountType,
  data: {
    type: AccountingAccountType;
    bankId?: number;
    providerId?: number;
    cashAccountId?: number;
    userId?: number;
    clientId?: number;
  },
): { id: number; key: string } {
  switch (type) {
    case AccountingAccountType.bank:
      return { id: data.bankId, key: 'bankId' };
    case AccountingAccountType.provider:
      return { id: data.providerId, key: 'providerId' };
    case AccountingAccountType.cash_account:
      return { id: data.cashAccountId, key: 'cashAccountId' };
    case AccountingAccountType.user:
      return { id: data.userId, key: 'userId' };
    case AccountingAccountType.client:
      return { id: data.clientId, key: 'clientId' };
    default:
      return { id: null, key: null };
  }
}
