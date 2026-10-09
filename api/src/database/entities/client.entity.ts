import { EntitySchema } from 'typeorm';
import { Client } from './models';

export const ClientEntity = new EntitySchema<Client>({
  name: 'Client',
  tableName: 'clients',
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
    identifier: {
      type: 'text',
      nullable: true,
      default: '',
    },
    name: {
      type: 'text',
      nullable: true,
      default: '',
    },
    phoneNumber: {
      type: 'text',
      nullable: true,
      default: '',
    },
    address: {
      type: 'text',
      nullable: true,
      default: '',
    },
    birthDate: {
      type: 'text',
      nullable: true,
      default: '',
    },
    instagram: {
      type: 'text',
      nullable: true,
      default: '',
    },
    wholesaler: {
      type: 'boolean',
      nullable: false,
      default: false,
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
    boughtDevices: {
      type: 'one-to-many',
      target: 'Device',
      inverseSide: 'soldToClient',
      cascade: ['insert', 'update'],
    },
    accounts: {
      type: 'one-to-many',
      target: 'AccountingAccount',
      inverseSide: 'client',
      cascade: ['insert', 'update'],
    },
    orders: {
      type: 'one-to-many',
      target: 'Order',
      inverseSide: 'client',
      cascade: ['insert', 'update'],
    },
  },
});
