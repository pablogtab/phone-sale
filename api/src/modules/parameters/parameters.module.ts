import { Module } from '@nestjs/common';
import { ParametersService } from './parameters.service';
import { ParametersController } from './parameters.controller';

@Module({
  exports: [ParametersService],
  controllers: [ParametersController],
  providers: [ParametersService],
})
export class ParametersModule {}
