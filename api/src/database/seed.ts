import 'dotenv/config';
import source from './data-source';
import { Repositories } from './database.service';
import { seedStarter } from './seed-starter';

async function main() {
  await source.initialize();
  await source.transaction((manager) =>
    seedStarter(new Repositories(manager), {
      username: process.env.SEED_ADMIN_USERNAME || 'admin',
      password: process.env.SEED_ADMIN_PASSWORD || '',
      storeName: process.env.STORE_NAME,
    }),
  );
  console.log(
    'Starter ready. Edit src/database/seed-labels.ts to customize labels. Existing credentials, balances and operations preserved.',
  );
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (source.isInitialized) await source.destroy();
  });
