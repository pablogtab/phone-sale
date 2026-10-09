import { Repository } from 'typeorm';
import { Bank } from './entities';
import { Repositories } from './database.service';
import { createPassword } from '../auth/password';
import { seedIphoneCatalog } from './seed-iphone-catalog';
import { STARTER_LABELS } from './seed-labels';

/** Run inside one transaction. Metadata makes renamed labels update the same rows. */
export async function seedStarter(
  db: Repositories,
  options: { username: string; password: string; storeName?: string },
) {
  if (options.password.length < 12)
    throw new Error('Set SEED_ADMIN_PASSWORD to at least 12 characters');
  await db.parameter.query('SELECT pg_advisory_xact_lock(73420911)');
  const key = 'seed_starter_v1';
  const marker = await db.parameter.findOneBy({ key });
  const ids: Record<string, number> = marker?.valueS
    ? JSON.parse(marker.valueS)
    : {};
  const auth = await db.userAuth.findOneBy({ username: options.username });
  let user = auth && (await db.user.findOneByOrFail({ id: auth.userId }));
  if (!user) {
    user = await db.user.save(
      db.user.create({
        ...STARTER_LABELS.administrator,
        role: 'admin',
        permissions: {},
      }),
    );
    await db.userAuth.save(
      db.userAuth.create({
        userId: user.id,
        username: options.username,
        ...(await createPassword(options.password)),
      }),
    );
  } else if (ids.admin === user.id) {
    await db.user.update(user.id, STARTER_LABELS.administrator);
  }
  ids.admin = user.id;
  const accounts = async (
    type: 'user' | 'provider' | 'cash_account' | 'bank',
    field: string,
    id: number,
    name: string,
  ) => {
    for (const currency of ['usd', 'ars'] as const) {
      const where = { [field]: id, currency };
      const existing = await db.accountingAccount.findOneBy(where);
      if (existing) await db.accountingAccount.update(existing.id, { name });
      else
        await db.accountingAccount.save(
          db.accountingAccount.create({
            ...where,
            name,
            type,
            isAsset: type === 'bank' || type === 'cash_account',
          }),
        );
    }
  };
  await accounts(
    'user',
    'userId',
    user.id,
    `${STARTER_LABELS.administrator.name} ${STARTER_LABELS.administrator.lastname}`,
  );
  for (const [group, labels, repository, type, field] of [
    [
      'cash',
      STARTER_LABELS.cashAccounts,
      db.cashAccount,
      'cash_account',
      'cashAccountId',
    ],
    ['bank', STARTER_LABELS.banks, db.bank, 'bank', 'bankId'],
    [
      'provider',
      STARTER_LABELS.providers,
      db.provider,
      'provider',
      'providerId',
    ],
  ] as const) {
    const repo = repository as Repository<Bank>;
    for (const [labelKey, name] of Object.entries(labels)) {
      const identity = `${group}.${labelKey}`;
      const existing = ids[identity]
        ? await repo.findOneBy({ id: ids[identity] })
        : await repo.findOneBy({ name });
      if (existing?.deletedAt) continue; // A deliberately deleted setup row stays deleted.
      const entity = existing
        ? await repo.save({ ...existing, name })
        : await repo.save(repo.create({ name }));
      ids[identity] = entity.id;
      await accounts(type, field, entity.id, name);
    }
  }
  await seedIphoneCatalog(db);
  const parameter = async (
    parameterKey: string,
    values: { valueS?: string; valueN?: number },
  ) => {
    if (!(await db.parameter.findOneBy({ key: parameterKey })))
      await db.parameter.save(
        db.parameter.create({ key: parameterKey, ...values }),
      );
  };
  const name = options.storeName?.trim() || STARTER_LABELS.storeName;
  const store = await db.parameter.findOneBy({ key: 'store_name' });
  // Preserve names edited in the UI; update labels only if still at the previously seeded value.
  const previous = await db.parameter.findOneBy({
    key: 'seed_starter_store_label',
  });
  if (!store) await parameter('store_name', { valueS: name });
  else if (previous && store.valueS === previous.valueS)
    await db.parameter.update({ key: store.key }, { valueS: name });
  await db.parameter.save(
    db.parameter.create({
      ...previous,
      key: 'seed_starter_store_label',
      valueS: name,
    }),
  );
  await parameter('dolar_hoy_cba_price', { valueN: 0 });
  await parameter('taken_provider_id', { valueN: ids['provider.tradeIns'] });
  const rounding = await db.accountingAccount.findOneByOrFail({
    userId: user.id,
    currency: 'usd',
  });
  await parameter('order_roundings_account_id', { valueN: rounding.id });
  await db.parameter.save(
    db.parameter.create({ ...marker, key, valueS: JSON.stringify(ids) }),
  );
  return { user, ids };
}
