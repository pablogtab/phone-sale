import { IsNull } from 'typeorm';
import {
  updateEntity,
  removeEntity,
  optionalIn,
  containsText,
} from '@/database/repository-utils';
import { PublicException } from '@/common/public.exception';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { DatabaseService } from '../../database/database.service';
import {
  DEVICE_CREATED_EVENT,
  DEVICE_DELETED_EVENT,
  DEVICE_UPDATED_EVENT,
  DeviceCreatedEvent,
  DeviceUpdatedEvent,
} from '../devices/device.event';
import { SearchProductQueryDto } from './dto/search-product-query.dto';
import { DevicePriceReferenceService } from '../devices/services/device-price-reference.service';
import { Order } from '@/database/entities';
import { CreateProductDto } from './dto/create-product.dto';
import { DeviceService } from '../devices/services/device.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly devicePriceReference: DevicePriceReferenceService,
    private deviceService: DeviceService,
  ) {}

  @OnEvent(DEVICE_UPDATED_EVENT)
  @OnEvent(DEVICE_CREATED_EVENT)
  async handleDeviceUpdatedEvent(
    event: DeviceUpdatedEvent | DeviceCreatedEvent,
  ) {
    const description = await this.deviceService.updateDescription(
      event.deviceId,
    );
    const product = await this.findProductByDeviceId(event.deviceId);
    if (!product) {
      await this.createDeviceProduct(event.deviceId);
    } else {
      const device = await this.database.device.findOne({
        where: { id: event.deviceId, deletedAt: IsNull() },
      });
      if (!device) {
        throw new Error('Device not found');
      }
      await updateEntity(
        this.database.product,
        { id: product.id },
        { description: description },
      );
    }
  }

  @OnEvent(DEVICE_DELETED_EVENT)
  async handleDeviceDeletedEvent(event: DeviceUpdatedEvent) {
    const product = await this.findProductByDeviceId(event.deviceId);
    if (product) {
      await updateEntity(
        this.database.product,
        { id: product.id },
        { deletedAt: new Date() },
      );
    }
  }

  async createDeviceProduct(deviceId: number) {
    const device = await this.database.device.findOne({
      where: { id: deviceId, deletedAt: IsNull() },
    });
    if (!device) {
      throw new Error('Device not found');
    }

    if (!device.originProviderId) return; //Only create product for devices with origin provider

    return this.database.product.save(
      this.database.product.create({
        deviceId,
        code: '123',
        description: device.description,
        unique: true,
      }),
    );
  }

  async findProductByDeviceId(deviceId: number) {
    return this.database.product.findOne({
      where: { deviceId, deletedAt: IsNull() },
    });
  }

  async findProductById(productId: number) {
    const product = await this.database.product.findOne({
      where: { id: productId, deletedAt: IsNull() },
    });
    if (!product) {
      throw new PublicException('Product not found');
    }

    return product;
  }

  async search(query: SearchProductQueryDto) {
    const base = {
      deletedAt: IsNull(),
      unique: query.unique,
      description: containsText(query.query),
    };
    return this.database.product.find({
      where: query.availableOnly
        ? [
            { ...base, deviceId: IsNull() },
            { ...base, device: { status: 'available' } },
          ]
        : base,
    });
  }

  async findProductPrice(productId: number, orderType: Order['type']) {
    const product = await this.findProductById(productId);
    let price = 0;
    if (product.deviceId) {
      const device = await this.database.device.findOne({
        where: { id: product.deviceId },
      });
      const priceReference = await this.devicePriceReference.findPriceReference(
        device.modelId,
        device.storageSizeId,
        device.condition === 'used',
      );
      if (!priceReference) {
        throw new PublicException('Price reference not found');
      }

      switch (orderType) {
        case 'faceid':
          price = priceReference.sellingPrice;
          break;
        case 'sale':
          price = priceReference.sellingPriceSale;
          break;
        case 'wholesale':
          price = priceReference.sellingPriceWholesale;
          break;
      }
    } else {
      price = product.sellingPrice;
    }

    return { price };
  }

  async createProduct(data: CreateProductDto) {
    const product = await this.database.product.save(
      this.database.product.create({
        code: data.code ?? '123',
        description: data.description,
        stock: data.stock,
        sellingPrice: data.sellingPrice,
        costPrice: data.costPrice,
        unique: false,
      }),
    );

    return product;
  }

  async editProduct(data: CreateProductDto, id: number) {
    const product = await this.database.product.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!product) {
      throw new PublicException('Product not found');
    }

    const updatedProduct = await updateEntity(
      this.database.product,
      { id },
      {
        code: data.code ?? '123',
        description: data.description,
        stock: data.stock,
        sellingPrice: data.sellingPrice,
        costPrice: data.costPrice,
        unique: false,
      },
    );

    return updatedProduct;
  }

  async deleteProduct(id: number) {
    const product = await this.database.product.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!product) {
      throw new PublicException('Product not found');
    }

    await updateEntity(
      this.database.product,
      { id },
      { deletedAt: new Date() },
    );

    return product;
  }
}
