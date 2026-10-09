import { Transactional } from '@/database/transactional';
import { IsNull } from 'typeorm';
import {
  updateEntity,
  removeEntity,
  optionalIn,
  containsText,
} from '@/database/repository-utils';
import { FindOptionsWhere } from 'typeorm';
import { AccountingAccountType } from '@/common/accounting';
import { CurrencyType } from '@/common/currency';
import { Paginated } from '@/common/dtos/pagination.dto';
import { PARAMETERS_KEYS } from '@/common/parameters';
import { PublicException } from '@/common/public.exception';
import { rounding } from '@/common/utils';
import { Injectable } from '@nestjs/common';
import { Device, Order } from '@/database/entities';

import { AccountingAccountTransactionsService } from '../accounting-accounts/accounting-accounts-transactions.service';
import { AccountingAccountsService } from '../accounting-accounts/accounting-accounts.service';
import { UserToken } from '../../auth/dto/token-info.dto';
import { DatabaseService } from '../../database/database.service';
import { DeviceService } from '../devices/services/device.service';
import { EventService } from '../events/event.service';
import { ParametersService } from '../parameters/parameters.service';
import { ContinueOrderDto } from './dto/continue-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { DetailedOrderDto } from './dto/detailed-order.dto';
import { FindOrdersDto } from './dto/find-orders.dto';
import { OrderPaymentMethod } from '@/common/order';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly database: DatabaseService,
    private readonly eventService: EventService,
    private readonly deviceService: DeviceService,
    private readonly parameters: ParametersService,
    private readonly accountingService: AccountingAccountsService,
    private readonly transactions: AccountingAccountTransactionsService,
  ) {}

  async getDetailedOrderByPublic(
    orderPublicId: string,
  ): Promise<DetailedOrderDto> {
    const order = await this.database.order.findOne({
      where: { publicId: orderPublicId },
      relations: {
        client: true,
        items: { product: { device: { files: true } } },
        payments: { device: { files: true } },
      },
    });

    if (!order) throw new PublicException('Orden no encontrada');
    order.items.forEach((p) => {
      if (p.product.device) {
        p.product.device.files = p.product.device.files.filter(
          (file) => file.main && !file.deletedAt,
        );
        (p.product.device as Device & { mainPhotoUrl?: string }).mainPhotoUrl =
          p.product.device.files[0]?.url;
      }
    });

    return {
      ...order,
      client: order.client,
      items: order.items,
      payments: order.payments,
    };
  }

  @Transactional()
  async create(data: CreateOrderDto, user: UserToken) {
    const client = await this.database.client.findOne({
      where: { id: data.clientId, deletedAt: IsNull() },
    });
    if (!client) {
      throw new PublicException('Cliente no encontrado');
    }

    const products = await this.database.product.find({
      where: { id: optionalIn(data.products.map((p) => p.productId)) },
    });

    if (products.length !== data.products.length) {
      throw new PublicException('Algunos productos no fueron encontrados');
    }

    if (data.deliveredByUserId && data.deliveredByUserId !== user.id) {
      const deliveredByUser = await this.database.user.findOne({
        where: { id: data.deliveredByUserId },
      });
      if (!deliveredByUser) {
        throw new PublicException('Usuario de entrega no encontrado');
      }
    }

    const deviceProducts = products.filter((p) => p.deviceId);

    for (const product of deviceProducts) {
      await this.checkDeviceAvailability(product.deviceId);
    }

    const event = await this.eventService.create({
      type: 'Sale',
      userId: user.id,
      description: 'Orden de venta',
    });

    const totalUSD = rounding(
      data.products.reduce((acc, p) => acc + p.priceUSD * p.quantity, 0),
    );
    const paymentsTotalUSD = rounding(
      data.payments.reduce((acc, p) => acc + p.amountUSD, 0),
    );
    const isDeposit =
      totalUSD > paymentsTotalUSD && paymentsTotalUSD > 0 && !data.credit;
    const isEnded = totalUSD === paymentsTotalUSD || data.credit;

    const nonDeviceTransactions = await this.preprocessNonDevicePayments(
      data,
      event.id,
    );
    const deviceTransactions = await this.preprocessDevicePayments(
      data,
      event.id,
      data.clientId,
      user.userId,
    );

    const createdOrder = await this.database.order.save(
      this.database.order.create({
        client: { id: client.id },
        user: { id: user.id },
        event: { id: event.id },
        exchangeRate: data.exchangeRate,
        status: 'pending',
        type: data.type,
      }),
    );

    await this.applyOrderPaymentTransactions(
      createdOrder,
      [...nonDeviceTransactions, ...deviceTransactions],
      isDeposit,
    );
    await this.appendOrderItems(createdOrder, data.products);

    if (isDeposit) {
      await this.markOrderAsDeposited(createdOrder.id);
    } else if (isEnded) {
      await this.markOrderAsCompleted(createdOrder.id, data.credit);
    }

    if (data.deliveredByUserId) {
      await updateEntity(
        this.database.order,
        { id: createdOrder.id },
        { deliveredByUserId: data.deliveredByUserId },
      );
    }

    return createdOrder;
  }

  @Transactional()
  async continue(publicId: string, data: ContinueOrderDto, user: UserToken) {
    const order = await this.database.order.findOne({
      where: { publicId, deletedAt: IsNull() },
      relations: { client: true, items: true, payments: true },
    });

    if (data.deliveredByUserId !== user.id) {
      const deliveredByUser = await this.database.user.findOne({
        where: { id: data.deliveredByUserId },
      });
      if (!deliveredByUser) {
        throw new PublicException('Usuario de entrega no encontrado');
      }
    }

    if (!order) {
      throw new PublicException('Orden no encontrada');
    }

    if (order.status === 'cancelled' || order.status === 'confirmed') {
      throw new PublicException('La orden no puede ser modificada');
    }

    const payedAmount = order.payments.reduce((acc, p) => acc + p.amountUSD, 0);
    const totalUSD = order.items.reduce(
      (acc, p) => acc + p.priceUSD * p.quantity,
      0,
    );

    const newPaymentsTotalUSD = data.payments.reduce(
      (acc, p) => acc + p.amountUSD,
      0,
    );
    const newItemsTotalUSD = data.products.reduce(
      (acc, p) => acc + p.priceUSD * p.quantity,
      0,
    );
    const newTotalUSD = rounding(totalUSD + newItemsTotalUSD);
    const newPayedAmount = rounding(payedAmount + newPaymentsTotalUSD);

    if (rounding(newTotalUSD - newPayedAmount) !== 0) {
      throw new PublicException('El saldo debe ser 0');
    }

    const nonDeviceTransactions = await this.preprocessNonDevicePayments(
      data,
      order.eventId,
    );
    const deviceTransactions = await this.preprocessDevicePayments(
      data,
      order.eventId,
      order.clientId,
      user.userId,
    );

    await this.applyOrderPaymentTransactions(
      order,
      [...nonDeviceTransactions, ...deviceTransactions],
      false,
    );
    await this.appendOrderItems(order, data.products);
    await this.markOrderAsCompleted(order.id);
    await updateEntity(
      this.database.order,
      { id: order.id },
      { deliveredByUserId: data.deliveredByUserId },
    );

    return order;
  }

  private async applyOrderPaymentTransactions(
    order: Order,
    transactions: PaymentTransactionDto[],
    isDeposit: boolean,
  ) {
    const nonDeviceTransactions = transactions.filter(
      (t) => t.method !== 'device',
    );
    const prefix = `${isDeposit ? 'Seña' : 'Pago'} Orden #${order.id} -> `;
    for (const transaction of transactions) {
      const created = await this.transactions.orderTransactions({
        ...transaction,
        description: prefix + transaction.description,
      });
      transaction.transactionId = created.id;
      await this.database.orderPayment.save(
        this.database.orderPayment.create({
          amountARS: transaction.amountARS,
          amountUSD: transaction.amountUSD,
          exchangeRate: transaction.exchangeRate,
          isDeposit,
          method: transaction.method,
          transaction: { id: transaction.transactionId },
          order: { id: order.id },
          description: transaction.description,
        }),
      );
    }

    for (const trans of nonDeviceTransactions) {
      await this.transactions.orderTransactions({
        accountType: 'client',
        amount: trans.amountUSD,
        currency: 'usd',
        description: prefix + trans.description,
        eventId: order.eventId,
        exchangeRate: trans.exchangeRate,
        clientId: order.clientId,
      });
    }
  }

  private async appendOrderItems(
    order: Order,
    products: CreateOrderDto['products'],
  ) {
    await this.database.orderItem.save(
      this.database.orderItem.create(
        products.map((product) => ({
          orderId: order.id,
          productId: product.productId,
          quantity: product.quantity,
          discount: 0,
          priceARS: product.priceARS,
          priceUSD: product.priceUSD,
          exchangeRate: product.exchangeRate,
          isWholesale: order.type === 'wholesale',
          total: product.priceUSD * product.quantity,
        })),
      ),
    );
  }

  async findOrders(
    query: FindOrdersDto,
  ): Paginated<Order & { clientName: string }> {
    const where: FindOptionsWhere<Order> = {
      deletedAt: IsNull(),
      ...(query.clientId ? { clientId: query.clientId } : {}),
      ...(query.status ? { status: optionalIn(query.status) } : {}),
    };

    const totalRows = await this.database.order.count({ where });

    const orders = await this.database.order.find({
      where,
      order: { createdAt: 'desc' },
      relations: { client: true },
      take: query.limit,
      skip: (query.page - 1) * query.limit,
    });

    return {
      data: orders.map(({ client: c, ...order }) => ({
        ...order,
        clientName: c.name,
      })),
      totalRows,
      totalPages: Math.ceil(totalRows / query.limit),
      page: query.page,
      limit: query.limit,
    };
  }

  @Transactional()
  async cancelOrder(publicId: string, user: UserToken) {
    const order = await this.database.order.findOne({
      where: { publicId, deletedAt: IsNull() },
      relations: { payments: true, items: { product: true } },
    });

    if (!order) {
      throw new PublicException('Orden no encontrada');
    }

    if (order.status === 'cancelled') {
      throw new PublicException('La orden ya fue cancelada');
    }

    const event = await this.database.event.findOne({
      where: { id: order.eventId },
      relations: { accountingTransactions: true },
    });

    if (!event) {
      throw new PublicException('Evento no encontrado');
    }

    const devicePayments = order.payments.filter(
      (p) => p.method === 'device' && p.deviceId,
    );
    for (const payment of devicePayments) {
      const result = await this.deviceService.canBeDeleted(payment.deviceId);
      if (!result) continue;

      await this.deviceService.deleteDevice(payment.deviceId);
    }

    for (const t of event.accountingTransactions) {
      await this.transactions.cancelTransaction(t.id);
    }

    for (const item of order.items.filter((i) => i.product.deviceId)) {
      if (item.product.deviceId) {
        await updateEntity(
          this.database.device,
          { id: item.product.deviceId },
          { status: 'available', soldToClientId: null, sellingPrice: null },
        );
      }
    }

    for (const product of order.items.filter((i) => !i.product.deviceId)) {
      await this.database.product.increment(
        { id: product.productId },
        'stock',
        product.quantity,
      );
    }

    await updateEntity(
      this.database.order,
      { id: order.id },
      { status: 'cancelled' },
    );

    return { publicId };
  }

  private async checkDeviceAvailability(deviceId: number) {
    const device = await this.database.device.findOne({
      where: { id: deviceId },
    });
    if (!device) {
      throw new PublicException('Dispositivo no encontrado');
    }

    if (device.status !== 'available') {
      throw new PublicException(
        'Dispositivo no disponible: ' + device.description,
      );
    }
  }

  private async preprocessNonDevicePayments(
    data: UpdateOrderDto,
    eventId: number,
  ): Promise<PaymentTransactionDto[]> {
    const nonDevicePayments = data.payments.filter(
      (p) => p.method !== 'device',
    );
    if (!nonDevicePayments.length) {
      return [];
    }
    const transactions = await Promise.all(
      nonDevicePayments.map(async (payment) => {
        let type: AccountingAccountType;

        switch (payment.method) {
          case 'cash':
            type = 'cash_account';
            break;
          case 'bank_transfer':
            if (payment.bankId) type = 'bank';
            else if (payment.providerId) type = 'provider';
            else if (payment.userId) type = 'user';
            break;
        }

        const account = await this.accountingService.getAccountByType({
          type,
          currency: payment.currency,
          bankId: payment.bankId,
          providerId: payment.providerId,
          cashAccountId: payment.cashAccountId,
          userId: payment.userId,
        });

        if (!account) {
          throw new PublicException('Cuenta no encontrada');
        }

        return {
          accountId: account.id,
          amount:
            payment.currency === 'ars' ? payment.amountARS : payment.amountUSD,
          currency: payment.currency,
          eventId: eventId,
          description: payment.description,
          cashAccountId: payment.cashAccountId,
          providerId: payment.providerId,
          bankId: payment.bankId,
          userId: payment.userId,
          accountType: type,
          transactionId: null as number,
          amountUSD: payment.amountUSD,
          amountARS: payment.amountARS,
          exchangeRate: payment.exchangeRate,
          method: payment.method,
        };
      }),
    );

    for (const transaction of transactions) {
      await this.transactions.validateTransaction(transaction);
    }

    return transactions;
  }

  private async preprocessDevicePayments(
    data: UpdateOrderDto,
    eventId: number,
    clientId: number,
    userPublicId: string,
  ): Promise<PaymentTransactionDto[]> {
    const devicePayments = data.payments.filter((p) => p.method === 'device');
    if (!devicePayments.length) {
      return [];
    }
    const takenProvider = await this.parameters.findOne(
      PARAMETERS_KEYS.taken_provider_id,
    );

    if (!takenProvider || !takenProvider.valueN) {
      throw new PublicException("Proveedor 'Tomado' no configurado");
    }

    const account = await this.accountingService.getAccountByType({
      currency: 'usd',
      type: 'client',
      clientId: clientId,
    });

    if (!account) {
      throw new PublicException('Cuenta no encontrada');
    }

    const transactions = await Promise.all(
      devicePayments.map(async (payment) => {
        const toCreateDevice = payment.device;
        if (!toCreateDevice) {
          throw new PublicException('Dispositivo del pago no encontrado');
        }

        toCreateDevice.purchasePrice = payment.amountUSD;
        toCreateDevice.originProviderId = takenProvider.valueN;

        const device = await this.deviceService.create(toCreateDevice);
        if (toCreateDevice.hasBeenTested) {
          await this.deviceService.testDevice({
            deviceId: device.id,
            testerUserPublicId: userPublicId,
          });
        }

        return {
          amount: payment.amountUSD,
          currency: 'usd' as CurrencyType,
          eventId: eventId,
          description: payment.description,
          accountType: 'client' as AccountingAccountType,
          transactionId: null as number,
          amountUSD: payment.amountUSD,
          amountARS: payment.amountARS,
          exchangeRate: payment.exchangeRate,
          method: payment.method,
          device: device,
          clientId: clientId,
          accountId: account.id,
        };
      }),
    );

    for (const transaction of transactions) {
      await this.transactions.validateTransaction(transaction);
    }

    return transactions;
  }

  private async markOrderAsCompleted(orderId: number, credit?: boolean) {
    const order = await this.database.order.findOne({
      where: { id: orderId },
      relations: { items: { product: { device: true } } },
    });

    if (!order) {
      throw new PublicException('Orden no encontrada');
    }

    if (order.status === 'confirmed') {
      return;
    }

    const totalUSDOrder = rounding(
      order.items.reduce((acc, i) => acc + i.priceUSD * i.quantity, 0),
    );

    const deviceProducts = order.items.filter((i) => i.product.device);
    const products = order.items.filter((i) => !i.product.device);

    for (const product of deviceProducts) {
      await updateEntity(
        this.database.device,
        { id: product.product.device.id },
        {
          status: 'sold',
          sellingPrice: product.priceUSD ?? 0,
          soldToClientId: order.clientId,
        },
      );
    }

    await this.transactions.orderTransactions({
      accountType: 'client',
      amount: -totalUSDOrder,
      currency: 'usd',
      description: 'Venta Orden #' + orderId + (credit ? ' (Crédito)' : ''),
      clientId: order.clientId,
      eventId: order.eventId,
      exchangeRate: order.exchangeRate,
    });

    await this.database.transaction(async (client) => {
      for (const product of products) {
        await client.product.decrement(
          { id: product.productId },
          'stock',
          product.quantity,
        );
      }
    });

    return await updateEntity(
      this.database.order,
      { id: orderId },
      { status: 'confirmed' },
    );
  }

  private async markOrderAsDeposited(orderId: number) {
    const order = await this.database.order.findOne({
      where: { id: orderId },
      relations: { items: { product: { device: true } } },
    });

    if (!order) {
      throw new PublicException('Orden no encontrada');
    }

    if (order.status === 'deposited') {
      return;
    }

    const deviceProducts = order.items.filter((i) => i.product.device);

    for (const product of deviceProducts) {
      await updateEntity(
        this.database.device,
        { id: product.product.device.id },
        { status: 'reserved' },
      );
    }

    await updateEntity(
      this.database.order,
      { id: orderId },
      { status: 'deposited' },
    );
  }
}

interface PaymentTransactionDto {
  accountId: number;
  amount: number;
  currency: CurrencyType;
  eventId: number;
  description: string;
  cashAccountId?: number;
  providerId?: number;
  bankId?: number;
  userId?: number;
  accountType: AccountingAccountType;
  transactionId: number;
  amountUSD: number;
  amountARS: number;
  exchangeRate: number;
  method: OrderPaymentMethod;
  device?: Device;
}
