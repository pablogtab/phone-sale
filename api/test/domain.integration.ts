import 'dotenv/config';
import assert = require('node:assert/strict');
import { Client as PgClient } from 'pg';
import { DataSource } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { createPassword } from '../src/auth/password';

const databaseName = `phone_sale_test_${process.pid}_${Date.now()}`;
const admin = new PgClient({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: 'postgres',
});
let app: INestApplication;
let migrationSource: DataSource;
let token = '';
let origin = '';
let checks = 0;
const pass = (name: string) => {
  checks++;
  console.log(`PASS ${name}`);
};

async function request(
  route: string,
  method = 'GET',
  body?: unknown,
  expected = 200,
  session = token,
) {
  const response = await fetch(`${origin}/api/${route}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  assert.equal(response.status, expected, `${method} ${route}: ${text}`);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function main() {
  await admin.connect();
  await admin.query(`CREATE DATABASE "${databaseName}"`);
  process.env.DATABASE_NAME = databaseName;
  process.env.DATABASE_SCHEMA = 'public';
  process.env.NODE_ENV = 'test';
  const { databaseOptions } = await import('../src/database/data-source');
  const { DatabaseService } = await import('../src/database/database.service');
  const { Repositories } = await import('../src/database/database.service');
  migrationSource = new DataSource(databaseOptions);
  await migrationSource.initialize();
  assert.equal((await migrationSource.runMigrations()).length, 1);
  assert.equal((await migrationSource.runMigrations()).length, 0);
  pass('fresh migration and repeat migration');
  const seedDb = new Repositories(migrationSource.manager);
  const user = await seedDb.user.save(
    seedDb.user.create({
      name: 'Test',
      lastname: 'Admin',
      role: 'admin',
      permissions: {},
    }),
  );
  const credentials = await createPassword('IntegrationTestPassword!');
  await seedDb.userAuth.save(
    seedDb.userAuth.create({
      userId: user.id,
      username: 'admin',
      ...credentials,
    }),
  );
  await seedDb.parameter.save(
    seedDb.parameter.create({ key: 'dolar_hoy_cba_price', valueN: 1200 }),
  );
  const { AppModule } = await import('../src/app.module');
  const { HttpExceptionFilter } =
    await import('../src/common/http-exception.filter');
  app = await NestFactory.create(AppModule, {
    logger: ['error'],
    abortOnError: false,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(0, '127.0.0.1');
  origin = await app.getUrl();
  const db = app.get(DatabaseService);
  await request('users/me', 'GET', undefined, 401, '');
  await request(
    'login/username',
    'POST',
    { username: 'admin', password: 'wrong-password' },
    400,
    '',
  );
  token = (
    await request(
      'login/username',
      'POST',
      { username: 'admin', password: 'IntegrationTestPassword!' },
      201,
      '',
    )
  ).token;
  assert.equal((await request('users/me')).role, 'admin');
  pass('authentication and current user');

  const provider = await request(
    'providers',
    'POST',
    { name: 'Integration supplier' },
    201,
  );
  const cash = await request(
    'cash-accounts',
    'POST',
    { name: 'Integration register' },
    201,
  );
  assert.equal(
    await db.accountingAccount.countBy({ cashAccountId: cash.id }),
    2,
  );
  const publicClient = await request(
    'clients',
    'POST',
    { name: 'Integration customer', identifier: 'TEST001' },
    201,
  );
  const customer = await request(`clients/${publicClient.publicId}`);
  assert.equal(
    await db.accountingAccount.countBy({ clientId: customer.id }),
    2,
  );
  assert.equal((await request('clients?search=Integration')).totalRows, 1);
  pass('client, supplier, cash accounts and search');

  const color = await request(
    'devices/color',
    'POST',
    { name: 'Natural', hex: '#bbb7a8' },
    201,
  );
  const size = await request(
    'devices/storage-size',
    'POST',
    { size: '128 GB' },
    201,
  );
  const model = await request(
    'devices/models',
    'POST',
    {
      name: 'Integration phone',
      colors: [color.id],
      storageSizes: [size.id],
      recommendedAccesories: [],
    },
    201,
  );
  const hydrated = await request(`devices/models/${model.id}`);
  assert.equal(hydrated.availableColors[0].id, color.id);
  assert.equal(hydrated.availableStorageSizes[0].id, size.id);
  pass('inventory model many-to-many relations');

  const accessory = await request(
    'products',
    'POST',
    {
      code: 'TEST-CABLE',
      description: 'Integration cable',
      stock: 10,
      costPrice: 5,
      sellingPrice: 10,
    },
    201,
  );
  const purchase = {
    providerId: provider.id,
    products: [
      { type: 'product', productId: accessory.id, quantity: 3, price: 5 },
    ],
    payments: [{ type: 'credit', amount: 15, currency: 'usd' }],
    total: 15,
    exchangeRate: 1200,
    transit: false,
  };
  await request('purchases', 'POST', purchase, 201);
  assert.equal(
    (await db.product.findOneByOrFail({ id: accessory.id })).stock,
    13,
  );
  assert.equal(
    (
      await db.accountingAccount.findOneByOrFail({
        providerId: provider.id,
        currency: 'usd',
      })
    ).balance,
    -15,
  );
  pass('purchase stock and supplier accounting');

  const item = (quantity: number) => ({
    productId: accessory.id,
    quantity,
    priceUSD: 10,
    priceARS: 12000,
    exchangeRate: 1200,
  });
  const payment = (amount: number) => ({
    method: 'cash',
    currency: 'usd',
    cashAccountId: cash.id,
    amountUSD: amount,
    amountARS: amount * 1200,
    exchangeRate: 1200,
    description: 'Integration payment',
  });
  const order = await request(
    'orders',
    'POST',
    {
      clientId: customer.id,
      exchangeRate: 1200,
      type: 'sale',
      products: [item(2)],
      payments: [payment(20)],
      deliveredByUserId: user.id,
    },
    201,
  );
  const detailed = await request(`orders/${order.publicId}`);
  assert.equal(detailed.status, 'confirmed');
  assert.equal(detailed.items[0].quantity, 2);
  assert.equal(detailed.payments.length, 1);
  assert.equal(
    (await db.product.findOneByOrFail({ id: accessory.id })).stock,
    11,
  );
  assert.equal(
    (
      await db.accountingAccount.findOneByOrFail({
        clientId: customer.id,
        currency: 'usd',
      })
    ).balance,
    0,
  );
  assert.equal(
    (
      await db.accountingAccount.findOneByOrFail({
        cashAccountId: cash.id,
        currency: 'usd',
      })
    ).balance,
    20,
  );
  pass('sale quantity totals, nested rows, stock and balanced accounts');

  await request(`orders/cancel/${order.publicId}`, 'POST', {}, 201);
  assert.equal(
    (await db.product.findOneByOrFail({ id: accessory.id })).stock,
    13,
  );
  assert.equal(
    (
      await db.accountingAccount.findOneByOrFail({
        cashAccountId: cash.id,
        currency: 'usd',
      })
    ).balance,
    0,
  );
  pass('sale cancellation restores stock and accounting');

  const deposit = await request(
    'orders',
    'POST',
    {
      clientId: customer.id,
      exchangeRate: 1200,
      type: 'sale',
      products: [item(1)],
      payments: [payment(5)],
    },
    201,
  );
  assert.equal(
    (await request(`orders/${deposit.publicId}`)).status,
    'deposited',
  );
  await request(
    `orders/continue/${deposit.publicId}`,
    'POST',
    {
      products: [item(1)],
      payments: [payment(15)],
      deliveredByUserId: user.id,
    },
    201,
  );
  const continued = await request(`orders/${deposit.publicId}`);
  assert.equal(continued.items.length, 2);
  assert.equal(continued.payments.length, 2);
  assert.equal(continued.status, 'confirmed');
  assert.equal(
    (await db.product.findOneByOrFail({ id: accessory.id })).stock,
    11,
  );
  pass('deposit continuation appends items and payments');

  const beforeStock = (await db.product.findOneByOrFail({ id: accessory.id }))
    .stock;
  const beforeTransactions = await db.accountingTransaction.count();
  const beforeEvents = await db.event.count();
  const badPurchase = {
    ...purchase,
    payments: [
      { type: 'cash', cashAccountId: 999999, amount: 15, currency: 'usd' },
    ],
  };
  await request('purchases', 'POST', badPurchase, 400);
  assert.equal(
    (await db.product.findOneByOrFail({ id: accessory.id })).stock,
    beforeStock,
  );
  assert.equal(await db.accountingTransaction.count(), beforeTransactions);
  assert.equal(await db.event.count(), beforeEvents);
  pass('cross-service transaction rollback after partial purchase');

  const deviceCount = await db.device.count();
  await assert.rejects(
    db.transaction(async () => {
      const { DeviceService } =
        await import('../src/modules/devices/services/device.service');
      await app.get(DeviceService).create({
        modelId: model.id,
        colorId: color.id,
        storageSizeId: size.id,
        condition: 'sealed',
        hasProblem: false,
        oficialWarranty: false,
        originProviderId: provider.id,
        purchasePrice: 200,
      });
      throw new Error('intentional rollback');
    }),
  );
  assert.equal(await db.device.count(), deviceCount);
  pass('inventory observer participates in rollback');

  await request(`clients/${publicClient.publicId}`, 'DELETE');
  assert.equal((await request('clients?search=Integration')).totalRows, 0);
  pass('soft deletion excluded from searches');
  const staff = await db.user.save(
    db.user.create({
      name: 'Staff',
      lastname: 'Test',
      role: 'user',
      permissions: {},
    }),
  );
  await db.userAuth.save(
    db.userAuth.create({
      userId: staff.id,
      username: 'staff',
      ...(await createPassword('IntegrationStaffPassword!')),
    }),
  );
  const staffToken = (
    await request(
      'login/username',
      'POST',
      { username: 'staff', password: 'IntegrationStaffPassword!' },
      201,
      '',
    )
  ).token;
  await request(
    'store-settings',
    'PATCH',
    { name: 'Unauthorized store' },
    403,
    staffToken,
  );
  const publicSettings = await request(
    'store-settings',
    'GET',
    undefined,
    200,
    '',
  );
  assert.equal(publicSettings.name, 'Mi tienda');
  await request('store-settings', 'PATCH', { name: 'Nueva tienda' }, 401, '');
  await request('store-settings', 'PATCH', { name: 'x' }, 400);
  assert.equal(
    (await request('store-settings', 'PATCH', { name: '  Nueva tienda  ' }))
      .name,
    'Nueva tienda',
  );
  assert.equal(
    (await request('store-settings', 'GET', undefined, 200, '')).name,
    'Nueva tienda',
  );
  await request('parameters/dolar_hoy_cba_price', 'PATCH', { valueN: 0 }, 400);
  await request('parameters/dolar_hoy_cba_price', 'PATCH', { valueN: -5 }, 400);
  await request('parameters/dolar_hoy_cba_price', 'PATCH', { valueN: 1500 });
  assert.equal((await request('parameters/dolar_hoy_cba_price')).valueN, 1500);
  await request('parameters/store_name', 'PATCH', { valueS: 'Bypass' }, 404);
  await request('parameters/seed_demo_v1', 'GET', undefined, 404);
  pass('public configurable name and validated manual exchange rate');

  const beforeBatch = await db.device.count();
  await request(
    'purchases',
    'POST',
    {
      providerId: provider.id,
      products: [
        {
          type: 'device',
          modelId: model.id,
          storageSizeId: size.id,
          colorId: color.id,
          quantity: 2,
          price: 50,
        },
      ],
      payments: [
        {
          type: 'cash',
          cashAccountId: cash.id,
          currency: 'ars',
          amount: 120000,
        },
      ],
      total: 100,
      exchangeRate: 1200,
      transit: false,
    },
    201,
  );
  assert.equal(await db.device.count(), beforeBatch + 2);
  assert.equal(
    (
      await db.accountingAccount.findOneByOrFail({
        providerId: provider.id,
        currency: 'ars',
      })
    ).balance,
    0,
  );
  assert.equal(
    (
      await db.accountingAccount.findOneByOrFail({
        providerId: provider.id,
        currency: 'usd',
      })
    ).balance,
    -15,
  );
  await request('purchases', 'POST', { ...purchase, total: 999 }, 400);
  assert.equal(await db.device.count(), beforeBatch + 2);
  pass(
    'device purchase quantities, ARS settlement and mismatched totals rejected',
  );

  const { seedStarter } = await import('../src/database/seed-starter');
  const { seedDemo } = await import('../src/database/seed-demo-data');
  const { STARTER_LABELS } = await import('../src/database/seed-labels');
  const seedOptions = {
    username: 'admin',
    password: 'IntegrationTestPassword!',
  };
  const ordersBeforeStarter = await db.order.count();
  const starter = await db.transaction(() => seedStarter(db, seedOptions));
  assert.equal(await db.order.count(), ordersBeforeStarter); // Starter adds no example operations.
  assert.equal(
    (await db.parameter.findOneByOrFail({ key: 'store_name' })).valueS,
    'Nueva tienda',
  );
  assert.equal(
    (await db.parameter.findOneByOrFail({ key: 'dolar_hoy_cba_price' })).valueN,
    1500,
  );
  const snapshot = async () =>
    Promise.all([
      db.deviceModel.count(),
      db.deviceColor.count(),
      db.deviceStorageSize.count(),
      db.cashAccount.count(),
      db.bank.count(),
      db.provider.count(),
      db.accountingAccount.count(),
      db.userAuth.count(),
      db.order.count(),
      db.device.count(),
      db.event.count(),
      db.accountingTransaction.count(),
      db.product.count(),
      db.devicePriceReference.count(),
    ]);
  const initial = await snapshot();
  assert.ok(await db.deviceModel.findOneBy({ name: 'iPhone 8' }));
  assert.ok(await db.deviceModel.findOneBy({ name: 'iPhone 8 Plus' }));
  assert.equal(await db.deviceModel.findOneBy({ name: 'iPhone 8 Pro' }), null);
  await db.transaction(() => seedStarter(db, seedOptions));
  assert.deepEqual(await snapshot(), initial);
  const se = await db.deviceModel.findOneByOrFail({
    name: 'iPhone SE 3rd generation',
  });
  const red = await db.deviceColor.findOneByOrFail({ name: 'PRODUCT RED' });
  await db.deviceModel.update(se.id, { name: 'iPhone SE (3rd generation)' });
  await db.deviceColor.update(red.id, { name: '(PRODUCT)RED' });
  await db.transaction(() => seedStarter(db, seedOptions));
  assert.equal(
    (await db.deviceModel.findOneByOrFail({ id: se.id })).name,
    'iPhone SE 3rd generation',
  );
  assert.equal(
    (await db.deviceColor.findOneByOrFail({ id: red.id })).name,
    'PRODUCT RED',
  );
  assert.deepEqual(await snapshot(), initial);
  assert.ok(
    (await db.deviceModel.find()).every((model) => !/[()]/.test(model.name)),
  );
  assert.ok(
    (await db.deviceColor.find()).every((color) => !/[()]/.test(color.name)),
  );
  const cashIdentity = starter.ids['cash.main'];
  const oldLabel = STARTER_LABELS.cashAccounts.main;
  try {
    STARTER_LABELS.cashAccounts.main = 'Caja personalizada';
    await db.transaction(() => seedStarter(db, seedOptions));
    assert.equal(
      (await db.cashAccount.findOneByOrFail({ id: cashIdentity })).name,
      'Caja personalizada',
    );
    assert.deepEqual(await snapshot(), initial);
  } finally {
    STARTER_LABELS.cashAccounts.main = oldLabel;
  }
  pass('starter catalog, stable editable labels, idempotency and preservation');

  const demo = await seedDemo(app, seedOptions);
  assert.equal(demo.created, true);
  assert.equal(demo.clients, 8);
  assert.equal(demo.orders, 6);
  const demoOrders = await db.order.find({
    where: { client: { identifier: (await import('typeorm')).Like('DEMO-%') } },
  });
  assert.equal(demoOrders.length, 6);
  for (const status of ['confirmed', 'deposited', 'pending', 'cancelled'])
    assert.ok(
      demoOrders.some((order) => order.status === status),
      `Missing demo order status ${status}`,
    );
  const states = new Set(
    (await db.device.find()).map((device) => device.status),
  );
  for (const status of [
    'available',
    'transit',
    'repairing',
    'reserved',
    'sold',
  ])
    assert.ok(
      states.has(status as any),
      `Missing demo device status ${status}`,
    );
  for (const account of await db.accountingAccount.find()) {
    const transactions = await db.accountingTransaction.findBy({
      accountingAccountId: account.id,
    });
    assert.ok(
      Math.abs(
        account.balance -
          transactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0,
          ),
      ) < 0.001,
      `Account ${account.id} balance differs from its movements`,
    );
  }
  const demoSnapshot = await snapshot();
  assert.equal((await seedDemo(app, seedOptions)).created, false);
  assert.deepEqual(await snapshot(), demoSnapshot);
  pass(
    'complete demo states, accounting coherence and repeat seed without duplicates',
  );

  console.log(
    `${checks} integration checks passed; temporary database cleaned up.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (app) await app.close();
    if (migrationSource?.isInitialized) await migrationSource.destroy();
    try {
      await admin.query(
        'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()',
        [databaseName],
      );
      await admin.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
    } finally {
      await admin.end();
    }
  });
