import { EntitySchema } from 'typeorm';
import { ModelAdjustment } from './models';

export const ModelAdjustmentEntity = new EntitySchema<ModelAdjustment>({
  name: 'ModelAdjustment',
  tableName: 'model_adjustment',
  columns: {
    id: {
      type: 'integer',
      nullable: false,
      primary: true,
      generated: true,
    },
    modelId: {
      type: 'integer',
      nullable: false,
    },
    type: {
      type: 'enum',
      nullable: false,
      enum: ['depreciation', 'appreciation'],
      enumName: 'AdjustmentType',
    },
    rangeStart: {
      type: 'integer',
      nullable: true,
    },
    rangeEnd: {
      type: 'integer',
      nullable: true,
    },
    factor: {
      type: 'double precision',
      nullable: false,
    },
    description: {
      type: 'enum',
      nullable: false,
      enum: ['battery', 'warranty', 'box'],
      enumName: 'AdjustmentCategory',
    },
  },
  relations: {
    model: {
      type: 'many-to-one',
      target: 'DeviceModel',
      joinColumn: {
        name: 'modelId',
        referencedColumnName: 'id',
      },
      nullable: false,
      inverseSide: 'ModelAdjustment',
    },
  },
});
