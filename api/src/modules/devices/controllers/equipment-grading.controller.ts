import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
@Controller('equipment-grading')
export class EquipmentGradingController {
  constructor(private readonly db: DatabaseService) {}
  @Get()
  getAll() {
    return this.db.equipmentGrading.find({
      order: { index: 'ASC', id: 'ASC' },
    });
  }
}
