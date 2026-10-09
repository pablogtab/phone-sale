import { Module } from '@nestjs/common';
import { ModelAdjustmentController } from './model-adjustment.controller';
import { ModelAdjustmentService } from './model-adjustment.service';

@Module({
  controllers: [ModelAdjustmentController],
  providers: [ModelAdjustmentService],
})
export class ModelAdjustmentModule {}
