import { EntitySchema } from 'typeorm';
import { CashAccount } from './models';

export const CashAccountEntity = new EntitySchema<CashAccount>({
  name: 'CashAccount',
  tableName: 'cash_accounts',
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
    active: {
      type: 'boolean',
      nullable: false,
      default: true,
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
  },
  relations: {
    accountingAccounts: {
      type: 'one-to-many',
      target: 'AccountingAccount',
      inverseSide: 'cashAccount',
      cascade: ['insert', 'update'],
    },
  },
});
