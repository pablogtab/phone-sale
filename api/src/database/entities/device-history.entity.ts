import { EntitySchema } from 'typeorm';
import { DeviceHistory } from './models';

export const DeviceHistoryEntity = new EntitySchema<DeviceHistory>({
  name: 'DeviceHistory',
  tableName: 'device_history',
  columns: {
    id: {
      type: 'integer',
      nullable: false,
      primary: true,
      generated: true,
    },
    deviceId: {
      type: 'integer',
      nullable: true,
    },
    userId: {
      type: 'integer',
      nullable: true,
    },
    date: {
      type: 'timestamptz',
      nullable: false,
    },
    description: {
      type: 'text',
      nullable: false,
    },
  },
  relations: {
    device: {
      type: 'many-to-one',
      target: 'Device',
      joinColumn: {
        name: 'deviceId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'deviceHistory',
    },
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'userId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'deviceHistory',
    },
  },
});
