export class ModelAdjustment {
    id: number;
    modelId: number;
    type: AdjustmentType;
    rangeStart: number;
    rangeEnd: number;
    factor: number;
    description: AdjustmentCategory;
}

export const ADJUSTMENT_TYPES = {
    depreciation: 'depreciation',
    appreciation: 'appreciation',
};

export const ADJUSTMENT_CATEGORIES = {
    battery: 'battery',
    warranty: 'warranty',
    box: 'box',
};

export type AdjustmentType = keyof typeof ADJUSTMENT_TYPES;
export type AdjustmentCategory = keyof typeof ADJUSTMENT_CATEGORIES;

export interface DeviceModelWithAdjustments {
    modelId: number;
    modelName: string;
    modelAdjustments: ModelAdjustment[];
}
