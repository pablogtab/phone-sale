import { ModelAdjustment } from '@/database/entities';

export interface DeviceModelWithAdjustments {
  modelId: number;
  modelName: string;
  modelAdjustments: ModelAdjustment[];
}
