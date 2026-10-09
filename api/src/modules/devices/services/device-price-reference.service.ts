import { DatabaseService } from '@/database/database.service';
import { Injectable } from '@nestjs/common';
import { UpsertDevicePriceReferenceDto } from '../dtos/upsert-device-price-reference.dto';

@Injectable()
export class DevicePriceReferenceService {
  constructor(private database: DatabaseService) {}

  async upsert(data: UpsertDevicePriceReferenceDto) {
    await this.database.transaction(async (tx) => {
      await tx.devicePriceReference.clear();
      await tx.devicePriceReference.save(
        tx.devicePriceReference.create(
          data.data.map((d) => ({
            modelId: d.modelId,
            storageSizeId: d.storageSizeId,
            purchasePrice: d.purchasePrice,
            sellingPrice: d.sellingPrice,
            sellingPriceSale: d.sellingPriceSale,
            sellingPriceWholesale: d.sellingPriceWholesale,
            isUsed: d.isUsed,
          })),
        ),
      );
    });

    return { success: true };
  }

  async findPriceReference(
    modelId: number,
    storageSizeId: number,
    isUsed: boolean,
  ) {
    return this.database.devicePriceReference.findOne({
      where: { modelId, storageSizeId, isUsed },
    });
  }
}
