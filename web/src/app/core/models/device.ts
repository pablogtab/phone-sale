export interface Device {
    id: number;
    publicId: string;
    description: string;
    internalComments?: string;
    publicComments?: string;
    status: DeviceStatusTranslation;
    condition: DeviceCondition;
    purchasePrice?: number;
    sellingPrice?: number;
    batteryCicleCount?: number;
    batteryHealth?: number;
    imei?: string;
    imei2?: string;
    hasProblem: boolean;
    oficialWarranty: boolean;
    warrantyExpiresAt?: string;
    modelId: number;
    storageSizeId: number;
    colorId: number;
    originProviderId?: number;
    soldToClientId?: number;
    testedByUserId?: number;
    testedAt?: string;
    testingComments?: string;
    createdAt: string;
    updatedAt: string;
    depreciation: number;
    technicalServiceProviderId?: number;
    technicalServiceDate?: Date;
    technicalServiceDescription?: string;
    technicalServiceHistory?: string;
}

export const DEVICE_STATUSES_TRANSLATION = {
    available: 'Disponible',
    reserved: 'Reservado',
    sold: 'Vendido',
    repairing: 'En Reparación',
    damaged: 'Dañado',
    lost: 'Perdido',
    transit: 'En Tránsito',
} as const;

export type DeviceStatusTranslation = keyof typeof DEVICE_STATUSES_TRANSLATION;

export const DEVICE_CONDITIONS = {
    sealed: 'sealed',
    openBox: 'openBox',
    used: 'used',
} as const;

export type DeviceCondition = keyof typeof DEVICE_CONDITIONS;

export const DEVICE_STATUSES = {
    available: 'available',
    reserved: 'reserved',
    sold: 'sold',
    repairing: 'repairing',
    damaged: 'damaged',
    lost: 'lost',
    transit: 'transit',
} as const;

export type DeviceStatus = keyof typeof DEVICE_STATUSES;
