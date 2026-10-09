import { Transactional } from '@/database/transactional';
import { HttpException, Injectable } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service';
import { EventService } from '../events/event.service';
import { UsersService } from '../users/users.service';
import { AccountingAccountsService } from './accounting-accounts.service';
import { SimpleTransactionDto } from './dto/simple-transaction.dto';
import { TransferTransactionDto } from './dto/transfer-transaction.dto';
import { ValidateTransactionDto } from './dto/validate-transaction.dto';
import { OrderPaymentTransactionDto } from './dto/order-payment-transaction.dto';
import { EventType } from '@/database/entities';

@Injectable()
export class AccountingAccountTransactionsService {
  constructor(
    private userService: UsersService,
    private eventService: EventService,
    private database: DatabaseService,
    private accountsService: AccountingAccountsService,
  ) {}

  @Transactional()
  async simpleTransaction(data: SimpleTransactionDto, userPublicId: string) {
    const account = await this.accountsService.getAccountByType({
      ...data,
      type: data.accountType,
    });
    if (!account) {
      throw new HttpException('Invalid account', 400);
    }
    const user = await this.userService.getFullUserByPublicId(userPublicId);

    const event = await this.eventService.create({
      description: data.details,
      type: 'Transfer',
      userId: user.id,
    });
    const isValid = await this.validateTransaction({
      ...data,
      description: data.details ? data.details : 'Transferencia interna',
      accountId: account.id,
      eventId: event.id,
    });

    if (!isValid) {
      throw new HttpException('Invalid transaction', 400);
    }

    const transaction = await this.database.accountingTransaction.save(
      this.database.accountingTransaction.create({
        amount: data.amount,
        accountingAccountId: account.id,
        date: new Date(),
        description: data.details,
        eventId: event.id,
        exchangeRate: 1,
      }),
    );

    await this.accountsService.updateAccountBalance(account.id, data.amount);

    return transaction;
  }

  @Transactional()
  async transferTransaction(
    data: TransferTransactionDto,
    userPublicId: string,
  ) {
    const origin = await this.accountsService.getAccountByEntityId({
      currency: data.origin.currency,
      entityId: data.origin.entityId,
      type: data.origin.type,
    });
    const destination = await this.accountsService.getAccountByEntityId({
      entityId: data.destination.entityId,
      currency: data.destination.currency,
      type: data.destination.type,
    });

    if (!origin || !destination) {
      throw new HttpException('Invalid accounts', 400);
    }

    const user = await this.userService.getFullUserByPublicId(userPublicId);

    const event = await this.eventService.create({
      description: data.details,
      type: 'Transfer',
      userId: user.id,
    });

    if (data.origin.currency !== data.destination.currency) {
      let amountOrigin = data.origin.amount;
      if (data.destination.currency === 'ars') {
        amountOrigin = data.origin.amount * data.exchangeRate;
      } else {
        amountOrigin = data.origin.amount / data.exchangeRate;
      }
      if (rounding(amountOrigin) !== rounding(data.destination.amount)) {
        throw new HttpException('Invalid amount 1', 400);
      }
    } else {
      if (data.origin.amount !== data.destination.amount) {
        throw new HttpException('Invalid amount 2', 400);
      }
    }

    const validateOrigin = await this.validateTransaction({
      accountId: origin.id,
      amount: -data.origin.amount,
      currency: data.origin.currency,
      description: data.details ? data.details : 'Transferencia interna',
      eventId: event.id,
    });

    const validateDestination = await this.validateTransaction({
      accountId: destination.id,
      amount: data.destination.amount,
      currency: data.destination.currency,
      description: data.details ? data.details : 'Transferencia interna',
      eventId: event.id,
    });

    if (!validateOrigin || !validateDestination) {
      throw new HttpException('Invalid transaction', 400);
    }

    await this.database.transaction(async (database) => {
      await database.accountingTransaction.save(
        database.accountingTransaction.create({
          amount: -data.origin.amount,
          accountingAccountId: origin.id,
          date: new Date(),
          description: data.details,
          eventId: event.id,
          exchangeRate: data.exchangeRate,
        }),
      );
      await database.accountingTransaction.save(
        database.accountingTransaction.create({
          amount: data.destination.amount,
          accountingAccountId: destination.id,
          date: new Date(),
          description: data.details,
          eventId: event.id,
          exchangeRate: data.exchangeRate,
        }),
      );
    });

    await this.accountsService.updateAccountBalance(
      origin.id,
      -data.origin.amount,
    );
    await this.accountsService.updateAccountBalance(
      destination.id,
      data.destination.amount,
    );

    return;
  }

  async validateTransaction(data: ValidateTransactionDto) {
    const account = await this.accountsService.getAccountById(data.accountId);
    if (!account || account.currency !== data.currency) {
      throw new HttpException('Invalid account', 400);
    }

    const event = await this.eventService.getEventById(data.eventId);
    if (!event) {
      throw new HttpException('Invalid event', 400);
    }

    if (!data.description) {
      throw new HttpException('Invalid description', 400);
    }

    return true;
  }

  @Transactional()
  async orderTransactions(data: OrderPaymentTransactionDto) {
    const account = await this.accountsService.getAccountByType({
      ...data,
      type: data.accountType,
    });
    if (!account) {
      throw new HttpException('Invalid account', 400);
    }

    const isValid = await this.validateTransaction({
      ...data,
      accountId: account.id,
      eventId: data.eventId,
    });

    if (!isValid) {
      throw new HttpException('Invalid transaction', 400);
    }

    const amount = data.amount;

    const transaction = await this.database.accountingTransaction.save(
      this.database.accountingTransaction.create({
        amount: amount,
        accountingAccountId: account.id,
        date: new Date(),
        description: data.description,
        eventId: data.eventId,
        exchangeRate: data.exchangeRate,
      }),
    );

    await this.accountsService.updateAccountBalance(account.id, amount);

    return transaction;
  }

  @Transactional()
  async cancelTransaction(transactionId: number) {
    const transaction = await this.database.accountingTransaction.findOne({
      where: { id: transactionId },
    });
    if (!transaction) {
      return;
    }
    //generate a counter transaction

    const newTransaction = {
      amount: -transaction.amount,
      accountingAccountId: transaction.accountingAccountId,
      date: new Date(),
      description: 'Cancela ' + transaction.description,
      eventId: transaction.eventId,
      exchangeRate: transaction.exchangeRate,
    };

    await this.database.accountingTransaction.save(
      this.database.accountingTransaction.create(newTransaction),
    );
    await this.accountsService.updateAccountBalance(
      transaction.accountingAccountId,
      -transaction.amount,
    );

    return;
  }

  @Transactional()
  async new(data: SimpleTransactionDto, eventType: EventType, userId: number) {
    const event = await this.eventService.create({
      description: data.details,
      type: eventType,
      userId: userId,
    });
    return await this.customTransaction(data, event.id);
  }

  @Transactional()
  async customTransaction(data: SimpleTransactionDto, eventId: number) {
    const account = await this.accountsService.getAccountByType({
      ...data,
      type: data.accountType,
    });
    if (!account) {
      throw new HttpException('Invalid account', 400);
    }

    const isValid = await this.validateTransaction({
      ...data,
      accountId: account.id,
      eventId: eventId,
      description: data.details,
    });

    if (!isValid) {
      throw new HttpException('Invalid transaction', 400);
    }

    const transaction = await this.database.accountingTransaction.save(
      this.database.accountingTransaction.create({
        amount: data.amount,
        accountingAccountId: account.id,
        date: new Date(),
        description: data.details,
        eventId: eventId,
        exchangeRate: 1,
      }),
    );

    await this.accountsService.updateAccountBalance(account.id, data.amount);

    return transaction;
  }
}

function rounding(value: number, digits: number = 2) {
  return Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
}
