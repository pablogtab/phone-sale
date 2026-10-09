import { EntitySchema } from 'typeorm';
import { ModelAccesories } from './models';

export const ModelAccesoriesEntity = new EntitySchema<ModelAccesories>({
  name: 'ModelAccesories',
  tableName: 'model_accesories',
  columns: {
    modelId: {
      type: 'integer',
      nullable: false,
      primary: true,
    },
    productId: {
      type: 'integer',
      nullable: false,
      primary: true,
    },
    index: {
      type: 'integer',
      nullable: false,
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
      inverseSide: 'accessories',
    },
    product: {
      type: 'many-to-one',
      target: 'Product',
      joinColumn: {
        name: 'productId',
        referencedColumnName: 'id',
      },
      nullable: false,
      inverseSide: 'modelAccesories',
    },
  },
});
