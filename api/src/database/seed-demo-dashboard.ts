import { INestApplicationContext } from '@nestjs/common';
import { Like } from 'typeorm';
import { DatabaseService } from './database.service';
import { seedStarter } from './seed-starter';
import { IPHONE_CATALOG } from './iphone-catalog';
import { PurchasesService } from '../modules/purchases/purchases.service';
import { OrdersService } from '../modules/orders/orders.service';
import { DeviceService } from '../modules/devices/services/device.service';
import { UserToken } from '../auth/dto/token-info.dto';

/** Additive, once-only upgrade of an existing demo. Caller holds the seed transaction lock. */
export async function seedDemoDashboard(
  app: INestApplicationContext,
  options: { username: string; password: string },
) {
  const db = app.get(DatabaseService);
  const key = 'seed_demo_dashboard_v1';
  if (await db.parameter.findOneBy({ key }))
    return { created: false, orders: 0, devices: 0 };
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
  const clients = await db.client.find({
    where: { identifier: Like('DEMO-%') },
    order: { id: 'ASC' },
  });
  const accessories = await db.product.find({
    where: { code: Like('DEMO-%') },
    order: { id: 'ASC' },
  });
  if (!clients.length || !accessories.length)
    throw new Error(
      'Dashboard demo requires the base demo clients and accessories',
    );
  const rate =
    (await db.parameter.findOneByOrFail({ key: 'dolar_hoy_cba_price' }))
      .valueN || 1500;
  const recentNames = new Set<string>(
    IPHONE_CATALOG.slice(-14).map((model) => model.name),
  );
  const models = (
    await db.deviceModel.find({
      relations: { availableColors: true, availableStorageSizes: true },
      order: { index: 'ASC' },
    })
  ).filter(
    (model) =>
      recentNames.has(model.name) &&
      model.availableColors.length &&
      model.availableStorageSizes.length,
  );
  if (!models.length)
    throw new Error('Dashboard demo requires recent catalog models');
  const gradings = await db.equipmentGrading.find({ order: { index: 'ASC' } });
  const purchases = app.get(PurchasesService);
  const devices = [];
  // Sixty extra phones, concentrated on the latest fourteen catalog models.
  for (let i = 0; i < 60; i++) {
    const model = models[i % models.length];
    const color =
      model.availableColors[
        Math.floor(i / models.length) % model.availableColors.length
      ];
    const storage =
      model.availableStorageSizes[
        Math.floor(i / models.length) % model.availableStorageSizes.length
      ];
    const cost =
      500 + (i % models.length) * 35 + Math.floor(i / models.length) * 20;
    await purchases.newPurchase(
      {
        providerId: ids['provider.purchases'],
        products: [
          {
            type: 'device',
            modelId: model.id,
            colorId: color.id,
            storageSizeId: storage.id,
            quantity: 1,
            price: cost,
          },
        ],
        payments: [{ type: 'credit', currency: 'usd', amount: cost }],
        total: cost,
        exchangeRate: rate,
        transit: i >= 56,
      },
      user.id,
    );
    const device = await db.device.findOneOrFail({
      where: { modelId: model.id, originProviderId: ids['provider.purchases'] },
      order: { id: 'DESC' },
    });
    await app.get(DeviceService).updateDevice(device.id, {
      modelId: model.id,
      colorId: color.id,
      storageSizeId: storage.id,
      condition: i % 3 === 0 ? 'used' : 'sealed',
      gradingId:
        i % 3 === 0 ? gradings[Math.floor(i / 3) % gradings.length].id : null,
      batteryHealth: i % 3 === 0 ? 85 + (i % 15) : null,
      hasProblem: i === 50 || i === 51,
      oficialWarranty: i % 3 !== 0,
      originProviderId: ids['provider.purchases'],
      purchasePrice: cost,
      imei: `999100${String(i + 1).padStart(9, '0')}`,
      internalComments: 'Equipo ficticio para demo ampliada; IMEI no real.',
    });
    devices.push(device);
  }
  const accessoryCost = accessories.reduce(
    (sum, product) => sum + product.costPrice * 30,
    0,
  );
  await purchases.newPurchase(
    {
      providerId: ids['provider.purchases'],
      products: accessories.map((product) => ({
        type: 'product',
        productId: product.id,
        quantity: 30,
        price: product.costPrice,
      })),
      payments: [{ type: 'credit', currency: 'usd', amount: accessoryCost }],
      total: accessoryCost,
      exchangeRate: rate,
      transit: false,
    },
    user.id,
  );
  // Purchases created by this seed transaction precede the historical sales.
  const stockDate = new Date(Date.now() - 95 * 86400000);
  const purchaseEvents: { id: number }[] = await db.event.query(
    `UPDATE events SET "createdAt"=$1 WHERE type='Purchase' AND xmin=txid_current()::text::xid RETURNING id`,
    [stockDate],
  );
  for (const event of purchaseEvents) {
    await db.accountingTransaction.query(
      'UPDATE accounting_transactions SET date=$1, "createdAt"=$1, "updatedAt"=$1 WHERE "eventId"=$2',
      [stockDate, event.id],
    );
  }
  for (const device of devices)
    await db.device.query('UPDATE devices SET "createdAt"=$1 WHERE id=$2', [
      stockDate,
      device.id,
    ]);
  const offsets = [
    0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 38, 45,
    55, 65, 75, 85, 89,
  ];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const historicRate = Math.round(rate * (0.88 + (i % 7) * 0.02));
    const accessory = accessories[i % accessories.length];
    const products = [
      {
        productId: accessory.id,
        quantity: 1 + (i % 3),
        priceUSD: accessory.sellingPrice,
        priceARS: accessory.sellingPrice * historicRate,
        exchangeRate: historicRate,
      },
    ];
    if (i < 20 || i >= 26) {
      const device = devices[i < 20 ? i : i - 6];
      const product = await db.product.findOneByOrFail({ deviceId: device.id });
      const price = device.purchasePrice + 120 + (i % 4) * 15;
      products.push({
        productId: product.id,
        quantity: 1,
        priceUSD: price,
        priceARS: price * historicRate,
        exchangeRate: historicRate,
      });
    }
    const total = products.reduce(
      (sum, product) => sum + product.priceUSD * product.quantity,
      0,
    );
    const pending = i === 26 || i === 27;
    const deposit = i === 28 || i === 29;
    const amount = pending ? 0 : deposit ? 100 : total;
    const method = i % 2 === 0 ? ('cash' as const) : ('bank_transfer' as const);
    const order = await app.get(OrdersService).create(
      {
        clientId: clients[i % clients.length].id,
        exchangeRate: historicRate,
        type: i % 5 === 0 ? 'wholesale' : 'sale',
        products,
        payments: amount
          ? [
              {
                method,
                currency: i % 4 < 2 ? 'ars' : 'usd',
                cashAccountId: method === 'cash' ? ids['cash.main'] : undefined,
                bankId:
                  method === 'bank_transfer' ? ids['bank.main'] : undefined,
                amountUSD: amount,
                amountARS: amount * historicRate,
                exchangeRate: historicRate,
                description: 'Venta ficticia histórica · Demo ampliada',
              },
            ]
          : [],
        ...(!pending && !deposit ? { deliveredByUserId: user.id } : {}),
      },
      session,
    );
    // Same instant across the order and its accounting evidence; no future operations.
    const date = new Date(
      now.getTime() - (offsets[i] ?? i - 26) * 86400000 - (i % 4) * 1800000,
    );
    await db.order.query(
      'UPDATE orders SET "createdAt"=$1, "updatedAt"=$1 WHERE id=$2',
      [date, order.id],
    );
    await db.event.update(order.eventId, { createdAt: date });
    await db.accountingTransaction.query(
      'UPDATE accounting_transactions SET date=$1, "createdAt"=$1, "updatedAt"=$1 WHERE "eventId"=$2',
      [date, order.eventId],
    );
    await db.orderPayment.update({ orderId: order.id }, { createdAt: date });
  }
  // Only newly created fictional devices are changed; existing inventory is preserved.
  for (const i of [50, 51])
    await db.device.update(devices[i].id, { status: 'damaged' });
  await db.device.update(devices[52].id, { status: 'lost' });
  for (const i of [53, 54, 55])
    await app.get(DeviceService).updateDeviceTechnicalService(devices[i].id, {
      technicalServiceProviderId: ids['provider.repairs'],
      technicalServiceDate: now,
      technicalServiceDescription:
        'Revisión de batería y pantalla · Demo ampliada',
    });
  await db.parameter.save(
    db.parameter.create({
      key,
      valueS: JSON.stringify({
        fictional: true,
        devices: 60,
        orders: 30,
        historicalDays: 90,
      }),
    }),
  );
  return { created: true, devices: 60, orders: 30 };
}
