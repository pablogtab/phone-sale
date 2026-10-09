import { EntitySchema } from 'typeorm';
import { User } from './models';

export const UserEntity = new EntitySchema<User>({
  name: 'User',
  tableName: 'users',
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
    lastname: {
      type: 'text',
      nullable: false,
    },
    role: {
      type: 'enum',
      nullable: false,
      enum: ['user', 'admin'],
      enumName: 'Role',
      default: 'user',
    },
    permissions: {
      type: 'jsonb',
      nullable: false,
      default: {},
    },
    profilePicture: {
      type: 'text',
      nullable: true,
      default: '',
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
    auth: {
      type: 'one-to-many',
      target: 'UserAuth',
      inverseSide: 'user',
      cascade: ['insert', 'update'],
    },
    accountingAccounts: {
      type: 'one-to-many',
      target: 'AccountingAccount',
      inverseSide: 'user',
      cascade: ['insert', 'update'],
    },
    testedDevices: {
      type: 'one-to-many',
      target: 'Device',
      inverseSide: 'testedByUser',
      cascade: ['insert', 'update'],
    },
    deliveredOrders: {
      type: 'one-to-many',
      target: 'Order',
      inverseSide: 'deliveredByUser',
      cascade: ['insert', 'update'],
    },
    events: {
      type: 'one-to-many',
      target: 'Event',
      inverseSide: 'user',
      cascade: ['insert', 'update'],
    },
    orders: {
      type: 'one-to-many',
      target: 'Order',
      inverseSide: 'user',
      cascade: ['insert', 'update'],
    },
    deviceHistory: {
      type: 'one-to-many',
      target: 'DeviceHistory',
      inverseSide: 'user',
      cascade: ['insert', 'update'],
    },
  },
});
