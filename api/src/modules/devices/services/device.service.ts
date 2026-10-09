import { Transactional } from '@/database/transactional';
import { IsNull } from 'typeorm';
import {
  updateEntity,
  removeEntity,
  optionalIn,
  containsText,
} from '@/database/repository-utils';
import { DatabaseService } from '@/database/database.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Device, DeviceCondition, DeviceStatus } from '@/database/entities';

import { CreateDeviceServiceDto } from '../dtos/create-device-service.dto';
import { DetailedDeviceDto } from '../dtos/detailed-device.dto';
import { SearchDeviceQueryDto } from '../dtos/search-device-query.dto';
import { TestDeviceDto } from '../dtos/test-device.dto';
import { DeviceFileService } from './device-file.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DEVICE_CREATED_EVENT,
  DEVICE_DELETED_EVENT,
  DEVICE_UPDATED_EVENT,
} from '../device.event';
import { TechnicalServiceDto } from '../dtos/technical-service.dto';
import { STATUS_CODES } from 'http';
import { DEVICE_STATUSES } from '@/common/devices';
import { ServiceDetailDto } from '../dtos/service-detail.dto';
import { AccountingAccountTransactionsService } from '@/modules/accounting-accounts/accounting-accounts-transactions.service';
import { UserToken } from '@/auth/dto/token-info.dto';
import { PublicException } from '@/common/public.exception';

@Injectable()
export class DeviceService {
  constructor(
    private eventEmitter: EventEmitter2,
    private database: DatabaseService,
    private deviceFileService: DeviceFileService,
    private accountingTransactions: AccountingAccountTransactionsService,
  ) {}

  async getOne(id: number): Promise<DetailedDeviceDto> {
    const device = await this.database.device.findOne({
      where: { id, deletedAt: IsNull() },
      relations: {
        equipmentGrading: true,
        color: true,
        model: true,
        storageSize: true,
        deviceHistory: { user: true },
        originProvider: true,
        files: true,
        testedByUser: true,
      },
    });

    if (!device || !device.color || !device.model || !device.storageSize) {
      throw new BadRequestException('Device not found');
    }

    device.files = device.files
      .filter((file) => !file.deletedAt)
      .sort((a, b) => a.index - b.index);
    device.deviceHistory = device.deviceHistory.map((entry) => ({
      ...entry,
      user: entry.user
        ? ({ name: entry.user.name } as typeof entry.user)
        : null,
    }));
    const mainPhoto = device.files.find((f) => f.main);
    const aditionalFiles = device.files.filter((f) => !f.main);

    return {
      ...device,
      color: device.color,
      model: device.model,
      storageSize: device.storageSize,
      testedByUser: device.testedByUser?.name,
      mainPhotoUrl: mainPhoto?.url,
      aditionalFiles,
    };
  }

  @Transactional()
  async create(dto: CreateDeviceServiceDto) {
    if (dto.gradingId != null && !(await this.database.equipmentGrading.findOneBy({ id: dto.gradingId }))) {
      throw new BadRequestException('Calificación de equipo inválida');
    }
    const condition: DeviceCondition = dto.condition;
    const status: DeviceStatus = dto.status || 'available';

    const description = await this.getDescription({
      ...dto,
      condition,
      status,
    });

    const created = await this.database.device.save(
      this.database.device.create({
        condition,
        status,
        description: description,
        modelId: dto.modelId,
        storageSizeId: dto.storageSizeId,
        colorId: dto.colorId,
        internalComments: dto.internalComments,
        publicComments: dto.publicComments,
        batteryCicleCount: dto.batteryCicleCount,
        batteryHealth: dto.batteryHealth,
        imei: dto.imei,
        imei2: dto.imei2,
        hasProblem: dto.hasProblem,
        oficialWarranty: dto.oficialWarranty,
        warrantyExpiresAt: dto.warrantyExpiresAt,
        originProviderId: dto.originProviderId,
        purchasePrice: dto.purchasePrice,
        gradingId: condition === "used" ? dto.gradingId ?? null : null,
        depreciation: dto.depreciation,
      }),
    );

    let index = 0;
    if (dto.mainPhotoUrl) {
      await this.deviceFileService.appendFile({
        deviceId: created.id,
        fileUrl: dto.mainPhotoUrl,
        type: 'image',
        description: 'Main photo',
        index: 1,
        main: true,
      });
      index++;
    }

    if (dto.aditionalFiles) {
      await Promise.all(
        dto.aditionalFiles.map(async (file) => {
          await this.deviceFileService.appendFile({
            deviceId: created.id,
            fileUrl: file.url,
            type: file.type,
            description: file.description,
            index: index,
            main: false,
          });
          index++;
        }),
      );
    }

    await this.eventEmitter.emitAsync(DEVICE_CREATED_EVENT, {
      deviceId: created.id,
    });

    return created;
  }

  async getDescription(obj: GetDescriptionDto) {
    const model = await this.database.deviceModel.findOne({
      where: { id: obj.modelId, deletedAt: IsNull() },
    });
    const storageSize = await this.database.deviceStorageSize.findOne({
      where: { id: obj.storageSizeId, deletedAt: IsNull() },
    });
    const color = await this.database.deviceColor.findOne({
      where: { id: obj.colorId, deletedAt: IsNull() },
    });

    if (!model || !storageSize || !color) {
      throw new BadRequestException('Model, storage size or color not found');
    }

    let description = `${model.name} ${storageSize.size} ${color.name}`;

    if (obj.condition === 'sealed') {
      description += ' Sellado';
    } else if (obj.batteryHealth) {
      description += ` ${Math.floor(obj.batteryHealth)}%`;
    }

    if (obj.imei) {
      //last 4 digists
      description += ` (${obj.imei.substring(obj.imei.length - 4)})`;
    }

    return description;
  }

  async getFiltered(dto: SearchDeviceQueryDto) {
    const {
      modelId,
      storageSizeId,
      colorId,
      query /*condition, status, oficialWarranty*/,
    } = dto;
    const devices = await this.database.device.find({
      where: [{ description: containsText(query) }].map((condition) => ({
        ...{
          modelId: optionalIn(modelId),
          storageSizeId: optionalIn(storageSizeId),
          colorId: optionalIn(colorId),
          ...(dto.status ? { status: optionalIn(dto.status) } : {}),
          deletedAt: IsNull(),
        },
        ...condition,
      })),
      relations: { files: true, equipmentGrading: true },
    });

    return devices.map(({ files, ...d }) => ({
      ...d,
      mainPhotoUrl:
        files
          .filter((file) => file.main && !file.deletedAt)
          .sort((a, b) => a.index - b.index)[0]?.url ?? null,
    }));
  }

  async testDevice(dto: TestDeviceDto) {
    const device = await this.database.device.findOne({
      where: { id: dto.deviceId, deletedAt: IsNull() },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    const user = await this.database.user.findOne({
      where: { publicId: dto.testerUserPublicId, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await updateEntity(
      this.database.device,
      { id: device.id },
      { testedAt: new Date(), testedByUserId: user.id },
    );
  }

  async updateDeviceTechnicalService(id: number, dto: TechnicalServiceDto) {
    const device = await this.database.device.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    await updateEntity(
      this.database.device,
      { id },
      {
        status: DEVICE_STATUSES.repairing,
        technicalServiceDescription: dto.technicalServiceDescription,
        technicalServiceDate: dto.technicalServiceDate,
        technicalServiceProviderId: dto.technicalServiceProviderId,
        technicalServiceHistory:
          (device.technicalServiceHistory ?? '') +
          (device.technicalServiceHistory
            ? `\n ${dto.technicalServiceDescription}`
            : dto.technicalServiceDescription),
      },
    );

    return await this.getOne(id);
  }

  @Transactional()
  async updateDevice(id: number, dto: CreateDeviceServiceDto) {
    const device = await this.database.device.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (dto.gradingId != null && !(await this.database.equipmentGrading.findOneBy({ id: dto.gradingId }))) {
      throw new BadRequestException('Calificación de equipo inválida');
    }
    const condition: DeviceCondition = dto.condition;

    const description = await this.getDescription({
      ...dto,
      condition,
      status: device.status,
    });

    await updateEntity(
      this.database.device,
      { id },
      {
        condition,
        description,
        modelId: dto.modelId,
        storageSizeId: dto.storageSizeId,
        colorId: dto.colorId,
        internalComments: dto.internalComments,
        publicComments: dto.publicComments,
        batteryCicleCount: dto.batteryCicleCount,
        batteryHealth: dto.batteryHealth,
        imei: dto.imei,
        imei2: dto.imei2,
        hasProblem: dto.hasProblem,
        oficialWarranty: dto.oficialWarranty,
        warrantyExpiresAt: dto.warrantyExpiresAt,
        originProviderId: dto.originProviderId,
        purchasePrice: dto.purchasePrice,
        gradingId: condition === "used" ? dto.gradingId ?? null : null,
        depreciation: dto.depreciation,
      },
    );

    if (dto.mainPhotoUrl) {
      const files = await this.deviceFileService.getFilesByDeviceId(id);
      const mainPhoto = files.find((f) => f.main);

      if (mainPhoto) {
        await this.deviceFileService.updateFile(mainPhoto.id, {
          fileUrl: dto.mainPhotoUrl,
          type: 'image',
          description: 'Main photo',
          index: 1,
          main: true,
        });
      } else {
        await this.deviceFileService.appendFile({
          deviceId: id,
          fileUrl: dto.mainPhotoUrl,
          type: 'image',
          description: 'Main photo',
          index: 1,
          main: true,
        });
      }
    }

    if (dto.aditionalFiles) {
      const files = await this.deviceFileService.getFilesByDeviceId(id);
      const aditionalFiles = files.filter((f) => !f.main);
      let lastIndex = aditionalFiles.length
        ? aditionalFiles[aditionalFiles.length - 1].index
        : 2;
      await Promise.all(
        dto.aditionalFiles.map(async (file) => {
          await this.deviceFileService.appendFile({
            deviceId: device.id,
            fileUrl: file.url,
            type: file.type,
            description: file.description,
            index: lastIndex,
            main: false,
          });
          lastIndex++;
        }),
      );
    }

    await this.eventEmitter.emitAsync(DEVICE_UPDATED_EVENT, { deviceId: id });

    return await this.getOne(id);
  }

  async deleteMainPhoto(id: number) {
    const file = await this.deviceFileService.getMainFileByDeviceId(id);
    if (!file) {
      throw new NotFoundException('Main photo not found');
    }

    return await this.deviceFileService.deleteFile(file.publicId);
  }

  async deleteAditionalFile(publicId: string) {
    return await this.deviceFileService.deleteFile(publicId);
  }

  async undoTestDevice(id: number) {
    const device = await this.database.device.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return await updateEntity(
      this.database.device,
      { id },
      { testedAt: null, testedByUserId: null, testingComments: null },
    );
  }

  async getDeviceFiles(id: number) {
    return await this.deviceFileService.getFilesByDeviceId(id);
  }

  async canBeDeleted(id: number) {
    const device = await this.database.device.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    //Alguna orden tiene este dispositivo
    const orders = await this.database.order.find({
      where: { items: { product: { deviceId: id } }, deletedAt: IsNull() },
    });

    return orders.length === 0;
  }

  async deleteDevice(id: number) {
    const device = await this.database.device.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    await updateEntity(this.database.device, { id }, { deletedAt: new Date() });

    await this.eventEmitter.emitAsync(DEVICE_DELETED_EVENT, { deviceId: id });
  }

  @Transactional()
  async createServiceDetail(
    id: number,
    dto: ServiceDetailDto,
    user: UserToken,
  ): Promise<DetailedDeviceDto> {
    const device = await this.database.device.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    if (device.status !== DEVICE_STATUSES.repairing) {
      throw new NotFoundException('Device status error');
    }

    const providerId = device.technicalServiceProviderId;

    if (!providerId) {
      throw new BadRequestException('Provider not found');
    }

    const serviceDescription = `Servicio equipo #${device.id} (IMEI: ${device.imei})`;

    await this.accountingTransactions.new(
      {
        accountType: 'provider',
        amount: -dto.serviceCost,
        details: serviceDescription,
        currency: 'usd',
        providerId,
      },
      'Service_Payment',
      user.id,
    );

    await updateEntity(
      this.database.device,
      { id },
      {
        status: DEVICE_STATUSES.available,
        depreciation: dto.depreciation,
        internalComments: dto.internalComments,
        batteryHealth: dto.bateryReplacement ? 100 : device.batteryHealth,
        technicalServiceDescription: null,
        technicalServiceDate: null,
        technicalServiceProviderId: null,
        technicalServiceHistory: dto.technicalServiceDescription,
      },
    );

    return await this.getOne(id);
  }

  async setAsAvailable(id: number) {
    const device = await this.database.device.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (device.status !== DEVICE_STATUSES.transit) {
      throw new PublicException(
        'Sólo se puede marcar como disponible un dispositivo en tránsito',
      );
    }

    await updateEntity(
      this.database.device,
      { id },
      {
        status: DEVICE_STATUSES.available,
        testedAt: null,
        testedByUserId: null,
        testingComments: null,
      },
    );

    await this.eventEmitter.emitAsync(DEVICE_UPDATED_EVENT, { deviceId: id });

    return await this.getOne(id);
  }

  async updateDescription(deviceId: number) {
    const device = await this.database.device.findOne({
      where: { id: deviceId, deletedAt: IsNull() },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    const description = await this.getDescription({
      condition: device.condition,
      status: device.status,
      modelId: device.modelId,
      storageSizeId: device.storageSizeId,
      colorId: device.colorId,
      oficialWarranty: device.oficialWarranty,
      batteryHealth: device.batteryHealth,
      imei: device.imei,
    });

    await updateEntity(this.database.device, { id: deviceId }, { description });

    return description;
  }
}

interface GetDescriptionDto {
  condition: DeviceCondition;
  status: DeviceStatus;
  modelId: number;
  storageSizeId: number;
  colorId: number;
  oficialWarranty: boolean;
  batteryHealth?: number;
  imei?: string;
}
