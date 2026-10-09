import { IsPublic } from '@/common/decorators/is-public.decorator';
import { Controller, Get, HttpException, Param, Res } from '@nestjs/common';

import { FileService } from '@/common/files/file.service';
import { Response } from 'express';

@Controller('public')
export class PublicController {
  constructor(private readonly fileService: FileService) {}

  @IsPublic()
  @Get('files/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const file = this.fileService.getFileReadableStream(filename);
    if (!file) {
      throw new HttpException('File not found', 404);
    }
    return res.send(file);
  }

  @IsPublic()
  @Get('/')
  async serverRunning() {
    return 'Server is running';
  }
}
