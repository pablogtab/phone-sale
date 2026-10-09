import { EntitySchema } from 'typeorm';
import { AccountingTransaction } from './models';

export const AccountingTransactionEntity =
  new EntitySchema<AccountingTransaction>({
    name: 'AccountingTransaction',
    tableName: 'accounting_transactions',
    columns: {
      id: {
        type: 'integer',
        nullable: false,
        primary: true,
        generated: true,
      },
      publicId: {
        type: 'uuid',
        nullable: false,
        unique: true,
        generated: 'uuid',
      },
      description: {
        type: 'text',
        nullable: false,
      },
      amount: {
        type: 'double precision',
        nullable: false,
      },
      date: {
        type: 'timestamptz',
        nullable: false,
      },
      exchangeRate: {
        type: 'double precision',
        nullable: false,
      },
      createdAt: {
        type: 'timestamptz',
        nullable: false,
        createDate: true,
      },
      updatedAt: {
        type: 'timestamptz',
        nullable: false,
        updateDate: true,
      },
      deletedAt: {
        type: 'timestamptz',
        nullable: true,
      },
      accountingAccountId: {
        type: 'integer',
        nullable: false,
      },
      eventId: {
        type: 'integer',
        nullable: false,
      },
    },
    relations: {
      accountingAccount: {
        type: 'many-to-one',
        target: 'AccountingAccount',
        joinColumn: {
          name: 'accountingAccountId',
          referencedColumnName: 'id',
        },
        nullable: false,
        inverseSide: 'transactions',
      },
      event: {
        type: 'many-to-one',
        target: 'Event',
        joinColumn: {
          name: 'eventId',
          referencedColumnName: 'id',
        },
        nullable: false,
        inverseSide: 'accountingTransactions',
      },
      payments: {
        type: 'one-to-many',
        target: 'OrderPayment',
        inverseSide: 'transaction',
        cascade: ['insert', 'update'],
      },
    },
  });
