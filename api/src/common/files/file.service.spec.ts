import { BadRequestException, NotFoundException } from '@nestjs/common';
import sharp, { Sharp } from 'sharp';
import { FileService } from './file.service';

describe('uploaded files', () => {
  const service = new FileService();
  it('rejects filenames outside the upload directory', async () => {
    expect(() => service.getFileReadableStream('../.env')).toThrow(
      BadRequestException,
    );
    await expect(service.deleteFile('..\\.env')).rejects.toThrow(
      BadRequestException,
    );
  });
  it('reports missing files', () => {
    expect(() =>
      service.getFileReadableStream('missing-test-file.png'),
    ).toThrow(NotFoundException);
  });
  it('optimizes an image, preserves its MIME type and reads it back', async () => {
    const buffer = await sharp({
      create: { width: 800, height: 400, channels: 3, background: '#194f3d' },
    })
      .png()
      .toBuffer();
    const result = await service.uploadFile({
      buffer,
      mimetype: 'image/png',
      size: buffer.length,
    } as Express.Multer.File);
    try {
      expect(result.mimetype).toBe('image/png');
      const meta = await sharp(
        service.getFileReadableStream(result.url),
      ).metadata();
      expect(meta.width).toBe(600);
      expect(meta.height).toBe(300);
    } finally {
      await service.deleteFile(result.url);
    }
  });
});
