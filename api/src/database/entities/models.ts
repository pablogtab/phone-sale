export const AccountingAccountType = {
  user: 'user',
  bank: 'bank',
  provider: 'provider',
  cash_account: 'cash_account',
  client: 'client',
} as const;
export type AccountingAccountType =
  (typeof AccountingAccountType)[keyof typeof AccountingAccountType];

export const Currency = { usd: 'usd', ars: 'ars' } as const;
export type Currency = (typeof Currency)[keyof typeof Currency];

export const DeviceStatus = {
  available: 'available',
  reserved: 'reserved',
  sold: 'sold',
  repairing: 'repairing',
  damaged: 'damaged',
  lost: 'lost',
  transit: 'transit',
} as const;
export type DeviceStatus = (typeof DeviceStatus)[keyof typeof DeviceStatus];

export const DeviceCondition = {
  sealed: 'sealed',
  openBox: 'openBox',
  used: 'used',
} as const;
export type DeviceCondition =
  (typeof DeviceCondition)[keyof typeof DeviceCondition];

export const DeviceFileType = {
  image: 'image',
  video: 'video',
  pdf: 'pdf',
} as const;
export type DeviceFileType =
  (typeof DeviceFileType)[keyof typeof DeviceFileType];

export const EventType = {
  Sale: 'Sale',
  Deposit: 'Deposit',
  Payment: 'Payment',
  Transfer: 'Transfer',
  Purchase: 'Purchase',
  Service_Payment: 'Service_Payment',
} as const;
export type EventType = (typeof EventType)[keyof typeof EventType];

export const AdjustmentType = {
  depreciation: 'depreciation',
  appreciation: 'appreciation',
} as const;
export type AdjustmentType =
  (typeof AdjustmentType)[keyof typeof AdjustmentType];

export const AdjustmentCategory = {
  battery: 'battery',
  warranty: 'warranty',
  box: 'box',
} as const;
export type AdjustmentCategory =
  (typeof AdjustmentCategory)[keyof typeof AdjustmentCategory];

export const OrderStatus = {
  pending: 'pending',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  deposited: 'deposited',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderPaymentMethod = {
  bank_transfer: 'bank_transfer',
  cash: 'cash',
  device: 'device',
} as const;
export type OrderPaymentMethod =
  (typeof OrderPaymentMethod)[keyof typeof OrderPaymentMethod];

export const OrderType = {
  sale: 'sale',
  faceid: 'faceid',
  wholesale: 'wholesale',
} as const;
export type OrderType = (typeof OrderType)[keyof typeof OrderType];

export const Role = { user: 'user', admin: 'admin' } as const;
export type Role = (typeof Role)[keyof typeof Role];

export type JsonValue = unknown;

export interface AccountingAccount {
  id: number;
  publicId: string;
  name: string;
  type: AccountingAccountType;
  balance: number;
  currency: Currency;
  isAsset: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  bank?: Bank;
  bankId: number | null;
  provider?: Provider;
  providerId: number | null;
  cashAccount?: CashAccount;
  cashAccountId: number | null;
  user?: User;
  userId: number | null;
  client?: Client;
  clientId: number | null;
  transactions?: AccountingTransaction[];
}

export interface AccountingTransaction {
  id: number;
  publicId: string;
  description: string;
  amount: number;
  date: Date;
  exchangeRate: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  accountingAccount?: AccountingAccount;
  accountingAccountId: number;
  eventId: number;
  event?: Event;
  payments?: OrderPayment[];
}

export interface Bank {
  id: number;
  publicId: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  accountingAccounts?: AccountingAccount[];
}

export interface CashAccount {
  id: number;
  publicId: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  accountingAccounts?: AccountingAccount[];
}

export interface Client {
  id: number;
  publicId: string;
  identifier: string | null;
  name: string | null;
  phoneNumber: string | null;
  address: string | null;
  birthDate: string | null;
  instagram: string | null;
  wholesaler: boolean;
  boughtDevices?: Device[];
  accounts?: AccountingAccount[];
  orders?: Order[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface DeviceHistory {
  id: number;
  deviceId: number | null;
  device?: Device;
  userId: number | null;
  user?: User;
  date: Date;
  description: string;
}

export interface DeviceModel {
  id: number;
  name: string;
  index: number;
  devices?: Device[];
  availableStorageSizes?: DeviceStorageSize[];
  availableColors?: DeviceColor[];
  exampleFiles?: DeviceFile[];
  priceReferences?: DevicePriceReference[];
  ModelAdjustment?: ModelAdjustment[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  accessories?: ModelAccesories[];
}

export interface ModelAccesories {
  modelId: number;
  model?: DeviceModel;
  productId: number;
  product?: Product;
  index: number;
}

export interface DeviceStorageSize {
  id: number;
  size: string;
  index: number;
  devices?: Device[];
  deviceModels?: DeviceModel[];
  priceReferences?: DevicePriceReference[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface DeviceColor {
  id: number;
  name: string;
  hex: string;
  devices?: Device[];
  deviceModels?: DeviceModel[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface DeviceFile {
  id: number;
  publicId: string;
  description: string;
  type: DeviceFileType;
  url: string;
  main: boolean;
  index: number;
  deviceModelId: number | null;
  deviceModel?: DeviceModel;
  deviceId: number | null;
  device?: Device;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface EquipmentGrading { id: number; code: string; description: string; index: number; }

export interface Device {
  gradingId?: number | null;
  equipmentGrading?: EquipmentGrading;
  id: number;
  publicId: string;
  description: string;
  internalComments: string | null;
  publicComments: string | null;
  status: DeviceStatus;
  condition: DeviceCondition;
  purchasePrice: number | null;
  depreciation: number | null;
  sellingPrice: number | null;
  batteryCicleCount: number | null;
  batteryHealth: number | null;
  imei: string | null;
  imei2: string | null;
  hasProblem: boolean;
  oficialWarranty: boolean;
  warrantyExpiresAt: string | null;
  modelId: number;
  model?: DeviceModel;
  storageSizeId: number;
  storageSize?: DeviceStorageSize;
  colorId: number;
  color?: DeviceColor;
  originProviderId: number | null;
  originProvider?: Provider;
  soldToClientId: number | null;
  soldToClient?: Client;
  testedByUserId: number | null;
  testedByUser?: User;
  testedAt: Date | null;
  testingComments: string | null;
  files?: DeviceFile[];
  products?: Product[];
  orderPayments?: OrderPayment[];
  deviceHistory?: DeviceHistory[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  technicalServiceProviderId: number | null;
  technicalServiceProvider?: Provider;
  technicalServiceDate: Date | null;
  technicalServiceDescription: string | null;
  technicalServiceHistory: string | null;
}

export interface DevicePriceReference {
  id: number;
  modelId: number;
  model?: DeviceModel;
  storageSizeId: number;
  storageSize?: DeviceStorageSize;
  purchasePrice: number;
  sellingPrice: number;
  sellingPriceSale: number;
  sellingPriceWholesale: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  isUsed: boolean;
}

export interface Event {
  id: number;
  publicId: string;
  description: string;
  type: EventType;
  createdAt: Date;
  userId: number | null;
  user?: User;
  accountingTransactions?: AccountingTransaction[];
  orders?: Order[];
}

export interface ModelAdjustment {
  id: number;
  modelId: number;
  model?: DeviceModel;
  type: AdjustmentType;
  rangeStart: number | null;
  rangeEnd: number | null;
  factor: number;
  description: AdjustmentCategory;
}

export interface OrderPayment {
  id: number;
  publicId: string;
  exchangeRate: number;
  amountUSD: number;
  amountARS: number;
  method: OrderPaymentMethod;
  isDeposit: boolean;
  description: string;
  orderId: number;
  order?: Order;
  transactionId: number;
  transaction?: AccountingTransaction;
  deviceId: number | null;
  device?: Device;
  createdAt: Date;
}

export interface OrderItem {
  id: number;
  exchangeRate: number;
  quantity: number;
  priceUSD: number;
  priceARS: number;
  discount: number;
  total: number;
  isWholesale: boolean;
  orderId: number;
  order?: Order;
  productId: number;
  product?: Product;
  createdAt: Date;
}

export interface Order {
  id: number;
  publicId: string;
  status: OrderStatus;
  exchangeRate: number;
  type: OrderType;
  deliveredByUserId: number | null;
  deliveredByUser?: User;
  userId: number;
  user?: User;
  eventId: number;
  event?: Event;
  clientId: number;
  client?: Client;
  payments?: OrderPayment[];
  items?: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Parameter {
  key: string;
  valueS: string | null;
  valueN: number | null;
  valueB: boolean | null;
  valueJ: JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: number;
  publicId: string;
  code: string;
  description: string;
  unique: boolean;
  stock: number;
  sellingPrice: number;
  costPrice: number;
  deviceId: number | null;
  device?: Device;
  orderItems?: OrderItem[];
  modelAccesories?: ModelAccesories[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Provider {
  id: number;
  publicId: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  technicalService: boolean;
  accountingAccounts?: AccountingAccount[];
  devices?: Device[];
  technicalServiceDevices?: Device[];
}

export interface User {
  id: number;
  publicId: string;
  name: string;
  lastname: string;
  role: Role;
  permissions: Record<string, string[]>;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  auth?: UserAuth[];
  accountingAccounts?: AccountingAccount[];
  testedDevices?: Device[];
  deliveredOrders?: Order[];
  events?: Event[];
  orders?: Order[];
  deviceHistory?: DeviceHistory[];
}

export interface UserAuth {
  id: number;
  userId: number;
  user?: User;
  username: string | null;
  email: string | null;
  hash: string;
  salt: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
