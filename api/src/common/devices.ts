export const DEVICE_STATUSES = {
  available: 'available',
  reserved: 'reserved',
  sold: 'sold',
  repairing: 'repairing',
  damaged: 'damaged',
  lost: 'lost',
  transit: 'transit',
} as const;

export const DEVICE_CONDITIONS = {
  sealed: 'sealed',
  used: 'used',
  openBox: 'openBox',
};

export type DeviceStatus = keyof typeof DEVICE_STATUSES;
export type DeviceCondition = keyof typeof DEVICE_CONDITIONS;
