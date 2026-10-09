import { Transactional } from '@/database/transactional';
import { BadRequestException, Injectable } from '@nestjs/common';

import { AccountingAccountTransactionsService } from '../accounting-accounts/accounting-accounts-transactions.service';
import { DatabaseService } from '../../database/database.service';
import { DeviceService } from '../devices/services/device.service';
import { EventService } from '../events/event.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly database: DatabaseService,
    private readonly deviceService: DeviceService,
    private readonly eventService: EventService,
    private readonly accountingTransactionsService: AccountingAccountTransactionsService,
  ) {}

  @Transactional()
  async newPurchase(data: CreatePurchaseDto, userId: number) {
    const round = (value: number) => Math.round(value * 100) / 100;
    const calculatedTotal = round(
      data.products.reduce(
        (sum, product) => sum + product.quantity * product.price,
        0,
      ),
    );
    const paidTotal = round(
      data.payments.reduce(
        (sum, payment) =>
          sum +
          (payment.currency === 'usd'
            ? payment.amount
            : payment.amount / data.exchangeRate),
        0,
      ),
    );
    if (calculatedTotal !== round(data.total) || paidTotal !== calculatedTotal)
      throw new BadRequestException(
        'Los ítems y pagos deben coincidir con el total de la compra',
      );
    for (const device of data.products.filter((p) => p.type === 'device')) {
      for (let unit = 0; unit < device.quantity; unit++) {
        await this.deviceService.create({
          colorId: device.colorId,
          modelId: device.modelId,
          storageSizeId: device.storageSizeId,
          condition: 'sealed',
          hasProblem: false,
          oficialWarranty: false,
          purchasePrice: device.price,
          originProviderId: data.providerId,
          status: data.transit ? 'transit' : 'available',
        });
      }
    }

    for (const product of data.products.filter((p) => p.type === 'product')) {
      await this.database.product.increment(
        { id: product.productId },
        'stock',
        product.quantity,
      );
    }

    const total = data.total;

    const event = await this.eventService.create({
      description: 'Compra a proveedor',
      type: 'Purchase',
      userId: userId,
    });

    await this.accountingTransactionsService.customTransaction(
      {
        amount: -total,
        currency: 'usd',
        accountType: 'provider',
        providerId: data.providerId,
        userId: userId,
        details: 'Compra a proveedor #' + event.id,
      },
      event.id,
    );

    for (const payments of data.payments.filter((p) => p.type !== 'credit')) {
      await this.accountingTransactionsService.customTransaction(
        {
          amount: -payments.amount,
          currency: payments.currency,
          accountType: payments.type === 'bank' ? 'bank' : 'cash_account',
          userId: userId,
          cashAccountId: payments.cashAccountId,
          bankId: payments.bankId,
          details: 'Pago de compra a proveedor #' + event.id,
        },
        event.id,
      );

      await this.accountingTransactionsService.customTransaction(
        {
          amount: round(
            payments.currency === 'usd'
              ? payments.amount
              : payments.amount / data.exchangeRate,
          ),
          currency: 'usd',
          accountType: 'provider',
          providerId: data.providerId,
          userId: userId,
          details: 'Pago de compra a proveedor #' + event.id,
        },
        event.id,
      );
    }
  }
}
