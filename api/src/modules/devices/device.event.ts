export const DEVICE_UPDATED_EVENT = Symbol('DEVICE_UPDATED_EVENT');
export const DEVICE_CREATED_EVENT = Symbol('DEVICE_CREATED_EVENT');
export const DEVICE_DELETED_EVENT = Symbol('DEVICE_DELETED_EVENT');

export class DeviceUpdatedEvent {
  deviceId: number;
}

export class DeviceCreatedEvent {
  deviceId: number;
}

export class DeviceDeletedEvent {
  deviceId: number;
}
