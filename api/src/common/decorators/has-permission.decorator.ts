import { PermissionActions, PermissionType } from '@/common';
import { Reflector } from '@nestjs/core';

export type PermissionRequirement = {
  module: PermissionType;
  actions: PermissionActions | PermissionActions[];
};

export const HasPermission = Reflector.createDecorator<
  PermissionRequirement | PermissionRequirement[]
>({
  transform: (data) => {
    if (Array.isArray(data)) {
      return data;
    }
    return [data];
  },
});
