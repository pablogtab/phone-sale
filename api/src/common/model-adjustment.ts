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
