import { EntitySchema } from 'typeorm';
import { EquipmentGrading } from './models';
export const EquipmentGradingEntity = new EntitySchema<EquipmentGrading>({
  name: 'EquipmentGrading',
  tableName: 'equipment_grading',
  columns: {
    id: { type: 'integer', primary: true, generated: true },
    code: { type: 'varchar', unique: true },
    description: { type: 'varchar' },
    index: { type: 'integer' },
  },
});
