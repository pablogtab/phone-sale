import { EntitySchema } from 'typeorm';
import { Parameter } from './models';

export const ParameterEntity = new EntitySchema<Parameter>({
  name: 'Parameter',
  tableName: 'parameter',
  columns: {
    key: {
      type: 'text',
      nullable: false,
      primary: true,
    },
    valueS: {
      type: 'text',
      nullable: true,
    },
    valueN: {
      type: 'double precision',
      nullable: true,
    },
    valueB: {
      type: 'boolean',
      nullable: true,
    },
    valueJ: {
      type: 'jsonb',
      nullable: true,
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
  },
  relations: {},
});
