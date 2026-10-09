import { EntitySchema } from 'typeorm';
import { OrderPayment } from './models';

export const OrderPaymentEntity = new EntitySchema<OrderPayment>({
  name: 'OrderPayment',
  tableName: 'order_payments',
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
    exchangeRate: {
      type: 'double precision',
      nullable: false,
    },
    amountUSD: {
      type: 'double precision',
      nullable: false,
    },
    amountARS: {
      type: 'double precision',
      nullable: false,
    },
    method: {
      type: 'enum',
      nullable: false,
      enum: ['bank_transfer', 'cash', 'device'],
      enumName: 'OrderPaymentMethod',
    },
    isDeposit: {
      type: 'boolean',
      nullable: false,
    },
    description: {
      type: 'text',
      nullable: false,
    },
    orderId: {
      type: 'integer',
      nullable: false,
    },
    transactionId: {
      type: 'integer',
      nullable: false,
    },
    deviceId: {
      type: 'integer',
      nullable: true,
    },
    createdAt: {
      type: 'timestamptz',
      nullable: false,
      createDate: true,
    },
  },
  relations: {
    order: {
      type: 'many-to-one',
      target: 'Order',
      joinColumn: {
        name: 'orderId',
        referencedColumnName: 'id',
      },
      nullable: false,
      inverseSide: 'payments',
    },
    transaction: {
      type: 'many-to-one',
      target: 'AccountingTransaction',
      joinColumn: {
        name: 'transactionId',
        referencedColumnName: 'id',
      },
      nullable: false,
      inverseSide: 'payments',
    },
    device: {
      type: 'many-to-one',
      target: 'Device',
      joinColumn: {
        name: 'deviceId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'orderPayments',
    },
  },
});
