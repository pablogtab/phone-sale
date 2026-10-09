import { EntitySchema } from 'typeorm';
import { Event } from './models';

export const EventEntity = new EntitySchema<Event>({
  name: 'Event',
  tableName: 'events',
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
    type: {
      type: 'enum',
      nullable: false,
      enum: [
        'Sale',
        'Deposit',
        'Payment',
        'Transfer',
        'Purchase',
        'Service_Payment',
      ],
      enumName: 'EventType',
    },
    createdAt: {
      type: 'timestamptz',
      nullable: false,
      createDate: true,
    },
    userId: {
      type: 'integer',
      nullable: true,
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'userId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'events',
    },
    accountingTransactions: {
      type: 'one-to-many',
      target: 'AccountingTransaction',
      inverseSide: 'event',
      cascade: ['insert', 'update'],
    },
    orders: {
      type: 'one-to-many',
      target: 'Order',
      inverseSide: 'event',
      cascade: ['insert', 'update'],
    },
  },
});
