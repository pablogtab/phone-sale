import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { Response } from 'express';

import { CreateDeviceDto } from '../dtos/create-device.dto';
import { DeviceService } from '../services/device.service';
import { FileService } from '@/common/files/file.service';
import { CreateDeviceServiceDto } from '../dtos/create-device-service.dto';
import { SearchDeviceQueryDto } from '../dtos/search-device-query.dto';
import { TestDeviceDto } from '../dtos/test-device.dto';
import { DeviceFileService } from '../services/device-file.service';
import { TechnicalServiceDto } from '../dtos/technical-service.dto';
import { DeviceHistoryService } from '../services/device-history.service';
import { UserToken } from '@/auth/dto/token-info.dto';
import { User } from '@/common/decorators/user.decorator';
import { ServiceDetailDto } from '../dtos/service-detail.dto';
import { ProvidersService } from '@/modules/providers/providers.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DEVICE_UPDATED_EVENT } from '../device.event';

@Controller('devices/devices')
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly fileService: FileService,
    private deviceFileService: DeviceFileService,
    private deviceHistoryService: DeviceHistoryService,
    private readonly providerService: ProvidersService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Post('set-as-available/:id')
  async setAsAvailable(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserToken,
  ) {
    const device = await this.deviceService.setAsAvailable(id);

    await this.deviceHistoryService.create({
      description: 'Dispositivo marcado como disponible',
      date: new Date(),
      id: null,
      userId: user.id,
      deviceId: device.id,
    });
  }

  @Post('test-device')
  async testDevice(@Body() dto: TestDeviceDto, @User() user: UserToken) {
    const ret = await this.deviceService.testDevice(dto);
    await this.deviceHistoryService.create({
      description: 'Marcó el dispositivo como testeado',
      date: new Date(),
      id: null,
      userId: user.id,
      deviceId: dto.deviceId,
    });

    return ret;
  }

  @Post('undo-test-device/:id')
  async undoTestDevice(@Param('id', ParseIntPipe) id: number) {
    return await this.deviceService.undoTestDevice(id);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainPhoto', maxCount: 1 },
      { name: 'aditionalFiles', maxCount: 4 },
    ]),
  )
  async create(
    @Body() dto: CreateDeviceDto,
    @UploadedFiles()
    files: {
      mainPhoto?: Express.Multer.File[];
      aditionalFiles?: Express.Multer.File[];
    },
    @Res() res: Response,
    @User() user: UserToken,
  ) {
    let obj: CreateDeviceServiceDto = {
      ...dto,
    };
    await this.uploadFilesAndAppendInfo(
      obj,
      files,
      dto.aditionalFilesDescriptions,
    );
    const created = await this.deviceService.create(obj);
    await this.deviceHistoryService.create({
      description: `Dispositivo ingresado al sistema`,
      date: new Date(),
      id: null,
      userId: user.id,
      deviceId: created.id,
    });
    return res.json(created);
  }

  @Get('files/:id')
  async getDeviceFiles(@Param('id') id: string) {
    return await this.deviceService.getDeviceFiles(+id);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.deviceService.getOne(+id);
  }

  @Get()
  async getFiltered(@Query() query: SearchDeviceQueryDto) {
    return await this.deviceService.getFiltered(query);
  }

  @Patch(':id/technicalService')
  async updateDeviceTechnicalService(
    @Res() res: Response,
    @Body() dto: TechnicalServiceDto,
    @User() user: UserToken,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const obj: TechnicalServiceDto = {
      ...dto,
    };
    const device = await this.deviceService.updateDeviceTechnicalService(
      +id,
      obj,
    );
    await this.deviceHistoryService.create({
      description: `Dispositivo enviado al servicio tecnico. Fecha: ${new Date(dto.technicalServiceDate).toLocaleDateString()}`,
      date: new Date(),
      id: null,
      userId: user.id,
      deviceId: device.id,
    });
    return res.json(device);
  }

  @Patch(':id/technicalService/detail')
  async updateDeviceTechnicalDetailService(
    @Res() res: Response,
    @Body() dto: ServiceDetailDto,
    @User() user: UserToken,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const obj: ServiceDetailDto = {
      ...dto,
    };
    const device = await this.deviceService.getOne(id);
    const provider = await this.providerService.findOneById(
      device.technicalServiceProviderId,
    );
    const logDescription = `${provider.name} realiza la reparación \n Costo: ${dto.serviceCost} \n Descripción: ${dto.technicalServiceDescription}`;
    const deviceDetail = await this.deviceService.createServiceDetail(
      +id,
      obj,
      user,
    );

    await this.eventEmitter.emitAsync(DEVICE_UPDATED_EVENT, { deviceId: id });
    await this.deviceHistoryService.create({
      description: logDescription,
      date: new Date(),
      id: null,
      userId: user.id,
      deviceId: device.id,
    });
    return res.json(deviceDetail);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainPhoto', maxCount: 1 },
      { name: 'aditionalFiles', maxCount: 4 },
    ]),
  )
  async update(
    @Res() res: Response,
    @Body() dto: CreateDeviceDto,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles()
    files: {
      mainPhoto?: Express.Multer.File[];
      aditionalFiles?: Express.Multer.File[];
    },
  ) {
    const obj: CreateDeviceServiceDto = {
      ...dto,
    };
    await this.uploadFilesAndAppendInfo(
      obj,
      files,
      dto.aditionalFilesDescriptions,
    );
    const device = await this.deviceService.updateDevice(+id, obj);

    return res.json(device);
  }

  @Delete('main-photo/:id')
  async deleteMainPhoto(@Param('id', ParseIntPipe) id: number) {
    return await this.deviceService.deleteMainPhoto(id);
  }

  @Delete('aditional-file/:uuid')
  async deleteAditionalFile(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.deviceService.deleteAditionalFile(uuid);
  }

  @Put('file-indexes/:uuid')
  async updateFileIndexes(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() files: { publicId: string; index: number }[],
  ) {
    return await this.deviceFileService.updateDeviceFileIndexes(uuid, files);
  }

  private async uploadFilesAndAppendInfo(
    obj: CreateDeviceServiceDto,
    files: {
      mainPhoto?: Express.Multer.File[];
      aditionalFiles?: Express.Multer.File[];
    },
    fileDescriptions: string[],
  ) {
    delete obj['aditionalFilesDescriptions'];

    if (files.mainPhoto) {
      const mainPhoto = await this.fileService.uploadFile(files.mainPhoto[0], {
        allowedTypes: 'image',
        optimizeImage: true,
      });
      obj.mainPhotoUrl = mainPhoto.url;
    }

    if (files.aditionalFiles) {
      const aditionalFiles = await Promise.all(
        files.aditionalFiles.map(async (file) => {
          return await this.fileService.uploadFile(file, {
            allowedTypes: 'any',
            optimizeImage: false,
          });
        }),
      );

      obj.aditionalFiles = aditionalFiles.map((file, index) => ({
        url: file.url,
        description: fileDescriptions?.[index] ?? '',
        type: file.mimetype.includes('image')
          ? 'image'
          : file.mimetype.includes('video')
            ? 'video'
            : 'pdf',
      }));
    }
  }
}
