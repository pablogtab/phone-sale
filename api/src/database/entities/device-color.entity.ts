import { EntitySchema } from 'typeorm';
import { DeviceColor } from './models';

export const DeviceColorEntity = new EntitySchema<DeviceColor>({
  name: 'DeviceColor',
  tableName: 'device_colors',
  columns: {
    id: {
      type: 'integer',
      nullable: false,
      primary: true,
      generated: true,
    },
    name: {
      type: 'text',
      nullable: false,
    },
    hex: {
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
    devices: {
      type: 'one-to-many',
      target: 'Device',
      inverseSide: 'color',
      cascade: ['insert', 'update'],
    },
    deviceModels: {
      type: 'many-to-many',
      target: 'DeviceModel',
      inverseSide: 'availableColors',
    },
  },
});
