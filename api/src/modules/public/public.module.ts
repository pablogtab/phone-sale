import { Module } from '@nestjs/common';

import { FilesModule } from '../../common/files/files.module';
import { PublicController } from './public.controller';

@Module({
  controllers: [PublicController],
  imports: [FilesModule],
})
export class PublicModule {}
