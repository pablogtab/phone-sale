import { EntitySchema } from 'typeorm';
import { DeviceFile } from './models';

export const DeviceFileEntity = new EntitySchema<DeviceFile>({
  name: 'DeviceFile',
  tableName: 'device_files',
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
      enum: ['image', 'video', 'pdf'],
      enumName: 'DeviceFileType',
    },
    url: {
      type: 'text',
      nullable: false,
    },
    main: {
      type: 'boolean',
      nullable: false,
      default: false,
    },
    index: {
      type: 'integer',
      nullable: false,
      default: 0,
    },
    deviceModelId: {
      type: 'integer',
      nullable: true,
    },
    deviceId: {
      type: 'integer',
      nullable: true,
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
    deviceModel: {
      type: 'many-to-one',
      target: 'DeviceModel',
      joinColumn: {
        name: 'deviceModelId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'exampleFiles',
    },
    device: {
      type: 'many-to-one',
      target: 'Device',
      joinColumn: {
        name: 'deviceId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'files',
    },
  },
});
