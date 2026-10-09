# Phone Sale API

NestJS 11, TypeORM and PostgreSQL. See [the root README](../README.md) for environment setup and startup.

```sh
npm run migration:run
npm run seed
npm run start:dev
npm test -- --runInBand
npm run test:integration
npm run build
```

The API listens on `/api`. Migrations are versioned; `synchronize` is disabled. Integration tests use a disposable, uniquely named database. The development seed preserves existing data.
