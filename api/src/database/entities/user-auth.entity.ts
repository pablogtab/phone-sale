import { EntitySchema } from 'typeorm';
import { UserAuth } from './models';

export const UserAuthEntity = new EntitySchema<UserAuth>({
  name: 'UserAuth',
  tableName: 'user_auths',
  columns: {
    id: {
      type: 'integer',
      nullable: false,
      primary: true,
      generated: true,
    },
    userId: {
      type: 'integer',
      nullable: false,
    },
    username: {
      type: 'text',
      nullable: true,
    },
    email: {
      type: 'text',
      nullable: true,
    },
    hash: {
      type: 'text',
      nullable: false,
    },
    salt: {
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
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'userId',
        referencedColumnName: 'id',
      },
      nullable: false,
      inverseSide: 'auth',
    },
  },
});
