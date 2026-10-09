export interface DevicePriceReference {
    id: number;
    modelId: number;
    storageSizeId: number;
    purchasePrice: number;
    sellingPrice: number;
    sellingPriceSale: number;
    sellingPriceWholesale: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    isUsed: boolean;
}
