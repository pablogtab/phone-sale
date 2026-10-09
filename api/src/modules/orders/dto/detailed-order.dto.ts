import {
  Client,
  Device,
  Order,
  OrderItem,
  OrderPayment,
  Product,
} from '@/database/entities';

export interface DetailedOrderDto extends Order {
  client: Client;
  items: (OrderItem & { product?: Product })[];
  payments: (OrderPayment & { device?: Device & { mainPhotoUrl?: string } })[];
}
