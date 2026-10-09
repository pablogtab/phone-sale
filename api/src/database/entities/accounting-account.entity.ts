import { EntitySchema } from 'typeorm';
import { AccountingAccount } from './models';

export const AccountingAccountEntity = new EntitySchema<AccountingAccount>({
  name: 'AccountingAccount',
  tableName: 'accounting_accounts',
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
    name: {
      type: 'text',
      nullable: false,
    },
    type: {
      type: 'enum',
      nullable: false,
      enum: ['user', 'bank', 'provider', 'cash_account', 'client'],
      enumName: 'AccountingAccountType',
    },
    balance: {
      type: 'double precision',
      nullable: false,
      default: 0,
    },
    currency: {
      type: 'enum',
      nullable: false,
      enum: ['usd', 'ars'],
      enumName: 'Currency',
    },
    isAsset: {
      type: 'boolean',
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
    bankId: {
      type: 'integer',
      nullable: true,
    },
    providerId: {
      type: 'integer',
      nullable: true,
    },
    cashAccountId: {
      type: 'integer',
      nullable: true,
    },
    userId: {
      type: 'integer',
      nullable: true,
    },
    clientId: {
      type: 'integer',
      nullable: true,
    },
  },
  relations: {
    bank: {
      type: 'many-to-one',
      target: 'Bank',
      joinColumn: {
        name: 'bankId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'accountingAccounts',
    },
    provider: {
      type: 'many-to-one',
      target: 'Provider',
      joinColumn: {
        name: 'providerId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'accountingAccounts',
    },
    cashAccount: {
      type: 'many-to-one',
      target: 'CashAccount',
      joinColumn: {
        name: 'cashAccountId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'accountingAccounts',
    },
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'userId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'accountingAccounts',
    },
    client: {
      type: 'many-to-one',
      target: 'Client',
      joinColumn: {
        name: 'clientId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'accounts',
    },
    transactions: {
      type: 'one-to-many',
      target: 'AccountingTransaction',
      inverseSide: 'accountingAccount',
      cascade: ['insert', 'update'],
    },
  },
});
