import { environment } from '@/config';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import * as fs from 'fs';
import { basename, join } from 'path';
import sharp, { Sharp } from 'sharp';
import * as mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  fileServiceBaseUrl: string = environment.fileSystem.baseUrl;

  constructor() {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }

    if (!fs.existsSync('uploads/files')) {
      fs.mkdirSync('uploads/files');
    }
  }

  async deleteFile(filename: string): Promise<void> {
    const path = this.resolveFilename(filename);
    if (!fs.existsSync(path)) {
      throw new NotFoundException('File not found');
    }

    fs.unlinkSync(path);
  }

  async uploadFile(
    file: Express.Multer.File,
    opts: UploadFileOptions = { allowedTypes: 'any', optimizeImage: true },
  ): Promise<{ url: string; mimetype: string }> {
    const allowedTypes: AllowedTypes[] = Array.isArray(opts.allowedTypes)
      ? opts.allowedTypes
      : [opts.allowedTypes ?? 'any'];

    if (!file) {
      throw new BadRequestException('File not found');
    }

    const fileType = file.mimetype.split('/')[0] as AllowedTypes;

    if (!allowedTypes.includes('any')) {
      if (!allowedTypes.includes(fileType)) {
        throw new BadRequestException(
          `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        );
      }
    }

    let buffer = file.buffer;

    if (opts.optimizeImage && fileType === 'image') {
      const image = await this.optimizeImage(buffer);
      buffer = await image.toBuffer();
      file.size = buffer.length;
    }

    const extension = mime.extension(file.mimetype);
    if (extension === false) {
      throw new BadRequestException('Invalid file type');
    }

    const mimetype = file.mimetype;

    const url = await this.saveFile(buffer, extension);

    return {
      url,
      mimetype,
    };
  }

  private async saveFile(buffer: Buffer, extension: string): Promise<string> {
    const fileUrl = `${new Date().getTime()}-${uuidv4()}.${extension}`;
    fs.writeFileSync(`uploads/files/${fileUrl}`, buffer);
    return fileUrl;
  }

  private async optimizeImage(buffer: Buffer): Promise<Sharp> {
    const image = sharp(buffer);
    const meta = await image.metadata();
    const { format } = meta;

    const config = {
      jpeg: { quality: 70 },
      webp: { quality: 70 },
      png: { compressionLevel: 9 },
    };

    if (!['jpeg', 'webp', 'png'].includes(format)) {
      throw new BadRequestException('Supported image formats: JPEG, PNG, WebP');
    }
    let optimizedImage = image[format](config[format])
      .resize(600, undefined, { withoutEnlargement: true })
      .rotate();

    // Por alguna razon, se rotan las imagenes, asi que se corrige la rotacion
    optimizedImage = optimizedImage.withMetadata({
      exif: { IFD0: { Software: 'MyApp' } },
    });

    return optimizedImage;
  }

  private resolveFilename(filename: string) {
    if (
      !filename ||
      basename(filename) !== filename ||
      filename.includes('\\') ||
      filename === '.' ||
      filename === '..'
    ) {
      throw new BadRequestException('Invalid filename');
    }
    return join('uploads', 'files', filename);
  }

  getFileReadableStream(filename: string) {
    const path = this.resolveFilename(filename);
    if (!fs.existsSync(path)) {
      throw new NotFoundException('File not found');
    }

    return fs.readFileSync(path);
  }
}

interface UploadFileOptions {
  optimizeImage?: boolean;
  allowedTypes?: AllowedTypes[] | AllowedTypes;
}

type AllowedTypes = 'image' | 'video' | 'audio' | 'document' | 'any';
