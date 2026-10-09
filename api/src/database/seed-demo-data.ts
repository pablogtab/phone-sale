import { INestApplicationContext } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { IPHONE_CATALOG } from './iphone-catalog';
import { seedStarter } from './seed-starter';
import { ClientsService } from '../modules/clients/clients.service';
import { PurchasesService } from '../modules/purchases/purchases.service';
import { OrdersService } from '../modules/orders/orders.service';
import { AccountingAccountTransactionsService } from '../modules/accounting-accounts/accounting-accounts-transactions.service';
import { EventService } from '../modules/events/event.service';
import { DeviceService } from '../modules/devices/services/device.service';
import { UserToken } from '../auth/dto/token-info.dto';

/** Fictional demo operations use the same services and accounting rules as the UI. */
export async function seedDemo(
  app: INestApplicationContext,
  options: { username: string; password: string },
) {
  if (!['development', 'test'].includes(process.env.NODE_ENV))
    throw new Error('Demo seed requires NODE_ENV=development or test');
  const db = app.get(DatabaseService);
  return db.transaction(async () => {
    await db.parameter.query('SELECT pg_advisory_xact_lock(73420911)');
    if (await db.parameter.findOneBy({ key: 'seed_demo_v1' }))
      return { created: false };
    const { user, ids } = await seedStarter(db, options);
    if (user.role !== 'admin')
      throw new Error('Demo seed requires an administrator');
    const session: UserToken = {
      id: user.id,
      userId: user.publicId,
      name: user.name,
      lastname: user.lastname,
      role: 'admin',
      permissions: {},
    };
    const cashId = ids['cash.main'];
    const bankId = ids['bank.main'];
    const providerId = ids['provider.purchases'];
    const rate = await db.parameter.findOneByOrFail({
      key: 'dolar_hoy_cba_price',
    });
    const exchangeRate = rate.valueN > 0 ? rate.valueN : 1500;
    if (!rate.valueN)
      await db.parameter.update({ key: rate.key }, { valueN: exchangeRate });
    const clients = [];
    for (const [index, name] of [
      'Ana Demo',
      'Bruno Demo',
      'Carla Demo',
      'Diego Demo',
      'Elena Demo',
      'Federico Demo',
      'Gabriela Demo',
      'Mayorista Demo',
    ].entries()) {
      const created = await app.get(ClientsService).create({
        name,
        identifier: `DEMO-${index + 1}`,
        phoneNumber: `35155500${String(index + 1).padStart(2, '0')}`,
        instagram: `demo.cliente${index + 1}`,
        address: `Calle Demo ${index + 1}`,
        birthDate: '01/01/1990',
        wholesaler: index === 7,
      });
      clients.push(
        await db.client.findOneByOrFail({ publicId: created.publicId }),
      );
    }
    const accessories = [];
    for (const [code, description, cost, sale] of [
      ['CABLE-C', 'Cable USB-C · Demo', 5, 12],
      ['CABLE-L', 'Cable Lightning · Demo', 6, 14],
      ['CHARGER', 'Cargador 20 W · Demo', 12, 25],
      ['CASE', 'Funda transparente · Demo', 4, 10],
      ['GLASS', 'Vidrio protector · Demo', 2, 8],
      ['MAGSAFE', 'Cargador magnético · Demo', 15, 30],
    ] as const) {
      const product = await db.product.save(
        db.product.create({
          code: `DEMO-${code}`,
          description,
          stock: 0,
          costPrice: cost,
          sellingPrice: sale,
          unique: false,
        }),
      );
      accessories.push(product);
    }
    await app.get(PurchasesService).newPurchase(
      {
        providerId,
        products: accessories.map((p) => ({
          type: 'product',
          productId: p.id,
          quantity: 30,
          price: p.costPrice,
        })),
        payments: [
          {
            type: 'credit',
            amount: accessories.reduce((sum, p) => sum + p.costPrice * 30, 0),
            currency: 'usd',
          },
        ],
        total: accessories.reduce((sum, p) => sum + p.costPrice * 30, 0),
        exchangeRate,
        transit: false,
      },
      user.id,
    );
    const catalogNames = new Set<string>(
      IPHONE_CATALOG.map((model) => model.name),
    );
    const models = (
      await db.deviceModel.find({
        relations: { availableColors: true, availableStorageSizes: true },
        order: { index: 'ASC' },
      })
    ).filter((model) => catalogNames.has(model.name));
    const devices = [];
    for (const [index, model] of models.entries()) {
      const color = model.availableColors[0];
      const storage = model.availableStorageSizes[0];
      if (!color || !storage) continue;
      // Illustrative prices, not market quotations. Only the demo creates price references.
      const cost = 100 + index * 25;
      for (const [position, accessory] of accessories.slice(2, 5).entries()) {
        await db.modelAccesories.save(
          db.modelAccesories.create({
            modelId: model.id,
            productId: accessory.id,
            index: position,
          }),
        );
      }
      if (
        !(await db.modelAdjustment.findOneBy({
          modelId: model.id,
          description: 'battery',
        }))
      ) {
        await db.modelAdjustment.save(
          db.modelAdjustment.create({
            modelId: model.id,
            type: 'depreciation',
            description: 'battery',
            rangeStart: 80,
            rangeEnd: 89,
            factor: 0.1,
          }),
        );
      }
      for (const size of model.availableStorageSizes) {
        for (const isUsed of [false, true]) {
          if (
            !(await db.devicePriceReference.findOneBy({
              modelId: model.id,
              storageSizeId: size.id,
              isUsed,
            }))
          ) {
            await db.devicePriceReference.save(
              db.devicePriceReference.create({
                modelId: model.id,
                storageSizeId: size.id,
                isUsed,
                purchasePrice: cost,
                sellingPrice: cost + 100,
                sellingPriceSale: cost + 90,
                sellingPriceWholesale: cost + 50,
              }),
            );
          }
        }
      }
      await app.get(PurchasesService).newPurchase(
        {
          providerId,
          products: [
            {
              type: 'device',
              modelId: model.id,
              storageSizeId: storage.id,
              colorId: color.id,
              quantity: 1,
              price: cost,
            },
          ],
          payments: [{ type: 'credit', amount: cost, currency: 'usd' }],
          total: cost,
          exchangeRate,
          transit: index === 4,
        },
        user.id,
      );
      const device = await db.device.findOneOrFail({
        where: { modelId: model.id, originProviderId: providerId },
        order: { id: 'DESC' },
      });
      await app.get(DeviceService).updateDevice(device.id, {
        modelId: model.id,
        storageSizeId: storage.id,
        colorId: color.id,
        condition: index % 3 === 0 ? 'used' : 'sealed',
        hasProblem: false,
        oficialWarranty: false,
        originProviderId: providerId,
        purchasePrice: cost,
        batteryHealth: index % 3 === 0 ? 88 + (index % 10) : null,
        imei: `999000${String(index + 1).padStart(9, '0')}`,
        internalComments: 'Equipo ficticio para demostración; IMEI no real.',
      });
      devices.push(device);
    }
    const sell = async (
      index: number,
      amount: number,
      method: 'cash' | 'bank_transfer',
      credit = false,
    ) => {
      const device = devices[index];
      const product = await db.product.findOneByOrFail({ deviceId: device.id });
      const price = device.purchasePrice + 100;
      return app.get(OrdersService).create(
        {
          clientId: clients[index % clients.length].id,
          exchangeRate,
          type: 'sale',
          credit,
          products: [
            {
              productId: product.id,
              quantity: 1,
              priceUSD: price,
              priceARS: price * exchangeRate,
              exchangeRate,
            },
          ],
          payments: amount
            ? [
                {
                  method,
                  currency: 'usd',
                  cashAccountId: method === 'cash' ? cashId : undefined,
                  bankId: method === 'bank_transfer' ? bankId : undefined,
                  amountUSD: amount,
                  amountARS: amount * exchangeRate,
                  exchangeRate,
                  description: 'Pago ficticio de demo',
                },
              ]
            : [],
          ...(amount === price || credit ? { deliveredByUserId: user.id } : {}),
        },
        session,
      );
    };
    await sell(0, devices[0].purchasePrice + 100, 'cash');
    await sell(1, devices[1].purchasePrice + 100, 'bank_transfer');
    await sell(2, 50, 'cash'); // Reserved with a deposit.
    await sell(3, 0, 'cash'); // Pending quotation.
    await sell(5, 0, 'cash', true); // Confirmed on customer credit.
    const cancelled = await sell(6, devices[6].purchasePrice + 100, 'cash');
    await app.get(OrdersService).cancelOrder(cancelled.publicId, session);
    await app.get(DeviceService).updateDeviceTechnicalService(devices[7].id, {
      technicalServiceProviderId: ids['provider.repairs'],
      technicalServiceDate: new Date(),
      technicalServiceDescription: 'Cambio de batería · Demo',
    });
    const supplierPayment = await app.get(EventService).create({
      type: 'Transfer',
      userId: user.id,
      description: 'Pago parcial a proveedor · Demo',
    });
    const accounting = app.get(AccountingAccountTransactionsService);
    await accounting.customTransaction(
      {
        accountType: 'cash_account',
        cashAccountId: cashId,
        currency: 'usd',
        amount: -100,
        userId: user.id,
        details: 'Pago parcial a proveedor · Demo',
      },
      supplierPayment.id,
    );
    await accounting.customTransaction(
      {
        accountType: 'provider',
        providerId,
        currency: 'usd',
        amount: 100,
        userId: user.id,
        details: 'Pago parcial a proveedor · Demo',
      },
      supplierPayment.id,
    );
    await db.parameter.save(
      db.parameter.create({
        key: 'seed_demo_v1',
        valueS: JSON.stringify({
          version: 1,
          fictional: true,
          clients: clients.length,
          accessories: accessories.length,
          devices: devices.length,
          orders: 6,
        }),
      }),
    );
    return {
      created: true,
      clients: clients.length,
      accessories: accessories.length,
      devices: devices.length,
      orders: 6,
    };
  });
}
