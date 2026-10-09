export interface Product {
    id: number;
    publicId: string;
    code: string;
    description: string;
    unique: boolean;
    sellingPrice: number;
    costPrice: number;
    stock: number;
    deviceId: number;
    createdAt: string;
    updatedAt: string;
}
