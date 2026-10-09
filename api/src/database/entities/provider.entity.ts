import { EntitySchema } from 'typeorm';
import { Provider } from './models';

export const ProviderEntity = new EntitySchema<Provider>({
  name: 'Provider',
  tableName: 'providers',
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
    technicalService: {
      type: 'boolean',
      nullable: false,
      default: true,
    },
  },
  relations: {
    accountingAccounts: {
      type: 'one-to-many',
      target: 'AccountingAccount',
      inverseSide: 'provider',
      cascade: ['insert', 'update'],
    },
    devices: {
      type: 'one-to-many',
      target: 'Device',
      inverseSide: 'originProvider',
      cascade: ['insert', 'update'],
    },
    technicalServiceDevices: {
      type: 'one-to-many',
      target: 'Device',
      inverseSide: 'technicalServiceProvider',
      cascade: ['insert', 'update'],
    },
  },
});
