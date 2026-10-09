import { Global, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FileService } from './file.service';

@Global()
@Module({
  imports: [MulterModule.register({ storage: memoryStorage() })],
  providers: [FileService],
  exports: [FileService, MulterModule],
})
export class FilesModule {}
