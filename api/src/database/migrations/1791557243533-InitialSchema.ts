import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1791557243533 implements MigrationInterface {
  name = 'InitialSchema1791557243533';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."AccountingAccountType" AS ENUM('user', 'bank', 'provider', 'cash_account', 'client')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Currency" AS ENUM('usd', 'ars')`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."accounting_accounts" ("id" SERIAL NOT NULL, "publicId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "type" "public"."AccountingAccountType" NOT NULL, "balance" double precision NOT NULL DEFAULT '0', "currency" "public"."Currency" NOT NULL, "isAsset" boolean NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "bankId" integer, "providerId" integer, "cashAccountId" integer, "userId" integer, "clientId" integer, CONSTRAINT "UQ_c53ceb39c85e739b7b56c1616c9" UNIQUE ("publicId"), CONSTRAINT "PK_867ef8eb1dd27cb42c62e7d0bdb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."accounting_transactions" ("id" SERIAL NOT NULL, "publicId" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" text NOT NULL, "amount" double precision NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "exchangeRate" double precision NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "accountingAccountId" integer NOT NULL, "eventId" integer NOT NULL, CONSTRAINT "UQ_ad6ed32d055f9319bee06ea57b1" UNIQUE ("publicId"), CONSTRAINT "PK_b678c1fcf0fd9806ff9c85feb7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."banks" ("id" SERIAL NOT NULL, "publicId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_228ed6ff321793ea01ec607a4cf" UNIQUE ("publicId"), CONSTRAINT "PK_3975b5f684ec241e3901db62d77" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."cash_accounts" ("id" SERIAL NOT NULL, "publicId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_69cea5f57689b0887c5a858f7aa" UNIQUE ("publicId"), CONSTRAINT "PK_c10b1fd07d801b17fb333711b2b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."clients" ("id" SERIAL NOT NULL, "publicId" uuid NOT NULL DEFAULT uuid_generate_v4(), "identifier" text DEFAULT '', "name" text DEFAULT '', "phoneNumber" text DEFAULT '', "address" text DEFAULT '', "birthDate" text DEFAULT '', "instagram" text DEFAULT '', "wholesaler" boolean NOT NULL DEFAULT false, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_e7a62246a66cb991545262394e2" UNIQUE ("publicId"), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."device_history" ("id" SERIAL NOT NULL, "deviceId" integer, "userId" integer, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "description" text NOT NULL, CONSTRAINT "PK_e7b12f40c596560b264d9cd68f5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."device_models" ("id" SERIAL NOT NULL, "name" text NOT NULL, "index" integer NOT NULL, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_51f8c8f18871353268185fdde81" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."model_accesories" ("modelId" integer NOT NULL, "productId" integer NOT NULL, "index" integer NOT NULL, CONSTRAINT "PK_611cb5ed8c9a45591928994a2dd" PRIMARY KEY ("modelId", "productId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."device_storage_sizes" ("id" SERIAL NOT NULL, "size" text NOT NULL, "index" integer NOT NULL, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_65322dd1bf213e7d816e0730e53" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."device_colors" ("id" SERIAL NOT NULL, "name" text NOT NULL, "hex" text NOT NULL, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_ff1d1277f2f7333e068086bbd98" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."DeviceFileType" AS ENUM('image', 'video', 'pdf')`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."device_files" ("id" SERIAL NOT NULL, "publicId" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" text NOT NULL, "type" "public"."DeviceFileType" NOT NULL, "url" text NOT NULL, "main" boolean NOT NULL DEFAULT false, "index" integer NOT NULL DEFAULT '0', "deviceModelId" integer, "deviceId" integer, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_918ed7e1fc26ab4afaa9aedb3a4" UNIQUE ("publicId"), CONSTRAINT "PK_03a2b76cbced726fb2df8e39302" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."DeviceStatus" AS ENUM('available', 'reserved', 'sold', 'repairing', 'damaged', 'lost', 'transit')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."DeviceCondition" AS ENUM('sealed', 'openBox', 'used')`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."devices" ("id" SERIAL NOT NULL, "publicId" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" text NOT NULL, "internalComments" text, "publicComments" text, "status" "public"."DeviceStatus" NOT NULL, "condition" "public"."DeviceCondition" NOT NULL, "purchasePrice" double precision, "depreciation" double precision, "sellingPrice" double precision, "batteryCicleCount" integer, "batteryHealth" integer, "imei" text, "imei2" text, "hasProblem" boolean NOT NULL, "oficialWarranty" boolean NOT NULL, "warrantyExpiresAt" text, "modelId" integer NOT NULL, "storageSizeId" integer NOT NULL, "colorId" integer NOT NULL, "originProviderId" integer, "soldToClientId" integer, "testedByUserId" integer, "testedAt" TIMESTAMP WITH TIME ZONE, "testingComments" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "technicalServiceProviderId" integer, "technicalServiceDate" TIMESTAMP WITH TIME ZONE, "technicalServiceDescription" text, "technicalServiceHistory" text, CONSTRAINT "UQ_6a1bf1137de567ba267cf34861e" UNIQUE ("publicId"), CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."device_price_references" ("id" SERIAL NOT NULL, "modelId" integer NOT NULL, "storageSizeId" integer NOT NULL, "purchasePrice" double precision NOT NULL, "sellingPrice" double precision NOT NULL, "sellingPriceSale" double precision NOT NULL, "sellingPriceWholesale" double precision NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "isUsed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_c34cc56d142c5b7139ed12d6df1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."EventType" AS ENUM('Sale', 'Deposit', 'Payment', 'Transfer', 'Purchase', 'Service_Payment')`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."events" ("id" SERIAL NOT NULL, "publicId" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" text NOT NULL, "type" "public"."EventType" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "UQ_817c798213cd4ddb056434fa080" UNIQUE ("publicId"), CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."AdjustmentType" AS ENUM('depreciation', 'appreciation')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."AdjustmentCategory" AS ENUM('battery', 'warranty', 'box')`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."model_adjustment" ("id" SERIAL NOT NULL, "modelId" integer NOT NULL, "type" "public"."AdjustmentType" NOT NULL, "rangeStart" integer, "rangeEnd" integer, "factor" double precision NOT NULL, "description" "public"."AdjustmentCategory" NOT NULL, CONSTRAINT "PK_dc1dc17d23b89b8f70eed918072" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."OrderPaymentMethod" AS ENUM('bank_transfer', 'cash', 'device')`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."order_payments" ("id" SERIAL NOT NULL, "publicId" uuid NOT NULL DEFAULT uuid_generate_v4(), "exchangeRate" double precision NOT NULL, "amountUSD" double precision NOT NULL, "amountARS" double precision NOT NULL, "method" "public"."OrderPaymentMethod" NOT NULL, "isDeposit" boolean NOT NULL, "description" text NOT NULL, "orderId" integer NOT NULL, "transactionId" integer NOT NULL, "deviceId" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_004145eb0bb9824ad87a97f3c2a" UNIQUE ("publicId"), CONSTRAINT "PK_bc14b014a69d39c7bbc4a154b69" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."order_items" ("id" SERIAL NOT NULL, "exchangeRate" double precision NOT NULL, "quantity" integer NOT NULL, "priceUSD" double precision NOT NULL, "priceARS" double precision NOT NULL, "discount" double precision NOT NULL, "total" double precision NOT NULL, "isWholesale" boolean NOT NULL, "orderId" integer NOT NULL, "productId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."OrderStatus" AS ENUM('pending', 'confirmed', 'cancelled', 'deposited')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."OrderType" AS ENUM('sale', 'faceid', 'wholesale')`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."orders" ("id" SERIAL NOT NULL, "publicId" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."OrderStatus" NOT NULL, "exchangeRate" double precision NOT NULL, "type" "public"."OrderType" NOT NULL, "deliveredByUserId" integer, "userId" integer NOT NULL, "eventId" integer NOT NULL, "clientId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."parameter" ("key" text NOT NULL, "valueS" text, "valueN" double precision, "valueB" boolean, "valueJ" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_75998d59c18b9fc4de000c47d8d" PRIMARY KEY ("key"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."products" ("id" SERIAL NOT NULL, "publicId" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" text NOT NULL, "description" text NOT NULL, "unique" boolean NOT NULL, "stock" integer NOT NULL DEFAULT '0', "sellingPrice" double precision NOT NULL DEFAULT '0', "costPrice" double precision NOT NULL DEFAULT '0', "deviceId" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."providers" ("id" SERIAL NOT NULL, "publicId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "technicalService" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_c810e595d1ac402c5dc69a91c2a" UNIQUE ("publicId"), CONSTRAINT "PK_af13fc2ebf382fe0dad2e4793aa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Role" AS ENUM('user', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."users" ("id" SERIAL NOT NULL, "publicId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "lastname" text NOT NULL, "role" "public"."Role" NOT NULL DEFAULT 'user', "permissions" jsonb NOT NULL DEFAULT '{}', "profilePicture" text DEFAULT '', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_9099c98f00a1b5aca6b8f7f04a3" UNIQUE ("publicId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."user_auths" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "username" text, "email" text, "hash" text NOT NULL, "salt" text NOT NULL, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_c72509696bfcdb831991f01d4c1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."device_model_storage_sizes" ("modelId" integer NOT NULL, "storageSizeId" integer NOT NULL, CONSTRAINT "PK_86401ca302f5aa2d645d2c60b2d" PRIMARY KEY ("modelId", "storageSizeId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_557f7945363f58b7040aad4940" ON "public"."device_model_storage_sizes" ("modelId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7dc5a4bd31a01cb854932323ed" ON "public"."device_model_storage_sizes" ("storageSizeId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."device_model_colors" ("modelId" integer NOT NULL, "colorId" integer NOT NULL, CONSTRAINT "PK_de12e199b9da4ba2a13b7a5197f" PRIMARY KEY ("modelId", "colorId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6001cd169b328dd4a192f212e1" ON "public"."device_model_colors" ("modelId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_38a4ab6fb4a68751c67833eefd" ON "public"."device_model_colors" ("colorId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."accounting_accounts" ADD CONSTRAINT "FK_b0b401c75899fc3a3ca0759109d" FOREIGN KEY ("bankId") REFERENCES "public"."banks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."accounting_accounts" ADD CONSTRAINT "FK_09970076866f4a56d8207e23981" FOREIGN KEY ("providerId") REFERENCES "public"."providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."accounting_accounts" ADD CONSTRAINT "FK_2b8c3dd34835c7fcc4aaa53a5ae" FOREIGN KEY ("cashAccountId") REFERENCES "public"."cash_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."accounting_accounts" ADD CONSTRAINT "FK_504dd2f76433feb3f51d4155bd8" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."accounting_accounts" ADD CONSTRAINT "FK_49a31918ab4c81c2de23b4e831a" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."accounting_transactions" ADD CONSTRAINT "FK_e9ce8d6ab4fd1beba4f35ead30b" FOREIGN KEY ("accountingAccountId") REFERENCES "public"."accounting_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."accounting_transactions" ADD CONSTRAINT "FK_903c4cabe1931de3dbddfc54c6e" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_history" ADD CONSTRAINT "FK_a7eda83dd4b12447ffe7ccc6b6b" FOREIGN KEY ("deviceId") REFERENCES "public"."devices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_history" ADD CONSTRAINT "FK_5d54592a06dded1a8629423df26" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."model_accesories" ADD CONSTRAINT "FK_63df6f3a73eca857525220f6c2c" FOREIGN KEY ("modelId") REFERENCES "public"."device_models"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."model_accesories" ADD CONSTRAINT "FK_5ee2ac0ee6028b8c885c8ca68e9" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_files" ADD CONSTRAINT "FK_ed75f9221483a0064786fc489c7" FOREIGN KEY ("deviceModelId") REFERENCES "public"."device_models"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_files" ADD CONSTRAINT "FK_7b11af91f379ea6ec1b9ae85461" FOREIGN KEY ("deviceId") REFERENCES "public"."devices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."devices" ADD CONSTRAINT "FK_0a0c0a4e6117bf4aea2cdd2a289" FOREIGN KEY ("modelId") REFERENCES "public"."device_models"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."devices" ADD CONSTRAINT "FK_6e2923e60bee56c41a7219746c8" FOREIGN KEY ("storageSizeId") REFERENCES "public"."device_storage_sizes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."devices" ADD CONSTRAINT "FK_2eaff5d1df41b0c560b8d9ae82f" FOREIGN KEY ("colorId") REFERENCES "public"."device_colors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."devices" ADD CONSTRAINT "FK_1528e64b099fe30294d289a1f0f" FOREIGN KEY ("originProviderId") REFERENCES "public"."providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."devices" ADD CONSTRAINT "FK_7473004f1ac076fc6eb0e4a8d0c" FOREIGN KEY ("soldToClientId") REFERENCES "public"."clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."devices" ADD CONSTRAINT "FK_4c37e2bcbdcb0e1d2cedbb8b314" FOREIGN KEY ("testedByUserId") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."devices" ADD CONSTRAINT "FK_5678f3d5ef44a51ad0385198ad9" FOREIGN KEY ("technicalServiceProviderId") REFERENCES "public"."providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_price_references" ADD CONSTRAINT "FK_169b576eb4e054717700164d878" FOREIGN KEY ("modelId") REFERENCES "public"."device_models"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_price_references" ADD CONSTRAINT "FK_06fa3c07cbd2c439fbfc2560963" FOREIGN KEY ("storageSizeId") REFERENCES "public"."device_storage_sizes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."events" ADD CONSTRAINT "FK_9929fa8516afa13f87b41abb263" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."model_adjustment" ADD CONSTRAINT "FK_b68148aa56a457a9357f4d5e125" FOREIGN KEY ("modelId") REFERENCES "public"."device_models"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."order_payments" ADD CONSTRAINT "FK_abca480893311e20150f01b2f15" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."order_payments" ADD CONSTRAINT "FK_11272c5aac81d47f60e4ecf0443" FOREIGN KEY ("transactionId") REFERENCES "public"."accounting_transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."order_payments" ADD CONSTRAINT "FK_c7ce629058339afd5a5b47b9038" FOREIGN KEY ("deviceId") REFERENCES "public"."devices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."orders" ADD CONSTRAINT "FK_c99fd95ba764400c561062c8b48" FOREIGN KEY ("deliveredByUserId") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."orders" ADD CONSTRAINT "FK_80f390b083014fd69ec40b8c38c" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."orders" ADD CONSTRAINT "FK_1457f286d91f271313fded23e53" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."products" ADD CONSTRAINT "FK_a44a32223fb988404ad76e3fec0" FOREIGN KEY ("deviceId") REFERENCES "public"."devices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."user_auths" ADD CONSTRAINT "FK_cfa0eb5c2e790fb0ca945276569" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_model_storage_sizes" ADD CONSTRAINT "FK_557f7945363f58b7040aad4940b" FOREIGN KEY ("modelId") REFERENCES "public"."device_models"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_model_storage_sizes" ADD CONSTRAINT "FK_7dc5a4bd31a01cb854932323ed9" FOREIGN KEY ("storageSizeId") REFERENCES "public"."device_storage_sizes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_model_colors" ADD CONSTRAINT "FK_6001cd169b328dd4a192f212e15" FOREIGN KEY ("modelId") REFERENCES "public"."device_models"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_model_colors" ADD CONSTRAINT "FK_38a4ab6fb4a68751c67833eefd8" FOREIGN KEY ("colorId") REFERENCES "public"."device_colors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."device_model_colors" DROP CONSTRAINT "FK_38a4ab6fb4a68751c67833eefd8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_model_colors" DROP CONSTRAINT "FK_6001cd169b328dd4a192f212e15"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_model_storage_sizes" DROP CONSTRAINT "FK_7dc5a4bd31a01cb854932323ed9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_model_storage_sizes" DROP CONSTRAINT "FK_557f7945363f58b7040aad4940b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."user_auths" DROP CONSTRAINT "FK_cfa0eb5c2e790fb0ca945276569"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."products" DROP CONSTRAINT "FK_a44a32223fb988404ad76e3fec0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."orders" DROP CONSTRAINT "FK_1457f286d91f271313fded23e53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."orders" DROP CONSTRAINT "FK_80f390b083014fd69ec40b8c38c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."orders" DROP CONSTRAINT "FK_c99fd95ba764400c561062c8b48"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."order_payments" DROP CONSTRAINT "FK_c7ce629058339afd5a5b47b9038"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."order_payments" DROP CONSTRAINT "FK_11272c5aac81d47f60e4ecf0443"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."order_payments" DROP CONSTRAINT "FK_abca480893311e20150f01b2f15"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."model_adjustment" DROP CONSTRAINT "FK_b68148aa56a457a9357f4d5e125"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."events" DROP CONSTRAINT "FK_9929fa8516afa13f87b41abb263"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_price_references" DROP CONSTRAINT "FK_06fa3c07cbd2c439fbfc2560963"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_price_references" DROP CONSTRAINT "FK_169b576eb4e054717700164d878"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."devices" DROP CONSTRAINT "FK_5678f3d5ef44a51ad0385198ad9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."devices" DROP CONSTRAINT "FK_4c37e2bcbdcb0e1d2cedbb8b314"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."devices" DROP CONSTRAINT "FK_7473004f1ac076fc6eb0e4a8d0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."devices" DROP CONSTRAINT "FK_1528e64b099fe30294d289a1f0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."devices" DROP CONSTRAINT "FK_2eaff5d1df41b0c560b8d9ae82f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."devices" DROP CONSTRAINT "FK_6e2923e60bee56c41a7219746c8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."devices" DROP CONSTRAINT "FK_0a0c0a4e6117bf4aea2cdd2a289"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_files" DROP CONSTRAINT "FK_7b11af91f379ea6ec1b9ae85461"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_files" DROP CONSTRAINT "FK_ed75f9221483a0064786fc489c7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."model_accesories" DROP CONSTRAINT "FK_5ee2ac0ee6028b8c885c8ca68e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."model_accesories" DROP CONSTRAINT "FK_63df6f3a73eca857525220f6c2c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_history" DROP CONSTRAINT "FK_5d54592a06dded1a8629423df26"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."device_history" DROP CONSTRAINT "FK_a7eda83dd4b12447ffe7ccc6b6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."accounting_transactions" DROP CONSTRAINT "FK_903c4cabe1931de3dbddfc54c6e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."accounting_transactions" DROP CONSTRAINT "FK_e9ce8d6ab4fd1beba4f35ead30b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."accounting_accounts" DROP CONSTRAINT "FK_49a31918ab4c81c2de23b4e831a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."accounting_accounts" DROP CONSTRAINT "FK_504dd2f76433feb3f51d4155bd8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."accounting_accounts" DROP CONSTRAINT "FK_2b8c3dd34835c7fcc4aaa53a5ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."accounting_accounts" DROP CONSTRAINT "FK_09970076866f4a56d8207e23981"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."accounting_accounts" DROP CONSTRAINT "FK_b0b401c75899fc3a3ca0759109d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_38a4ab6fb4a68751c67833eefd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6001cd169b328dd4a192f212e1"`,
    );
    await queryRunner.query(`DROP TABLE "public"."device_model_colors"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7dc5a4bd31a01cb854932323ed"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_557f7945363f58b7040aad4940"`,
    );
    await queryRunner.query(`DROP TABLE "public"."device_model_storage_sizes"`);
    await queryRunner.query(`DROP TABLE "public"."user_auths"`);
    await queryRunner.query(`DROP TABLE "public"."users"`);
    await queryRunner.query(`DROP TYPE "public"."Role"`);
    await queryRunner.query(`DROP TABLE "public"."providers"`);
    await queryRunner.query(`DROP TABLE "public"."products"`);
    await queryRunner.query(`DROP TABLE "public"."parameter"`);
    await queryRunner.query(`DROP TABLE "public"."orders"`);
    await queryRunner.query(`DROP TYPE "public"."OrderType"`);
    await queryRunner.query(`DROP TYPE "public"."OrderStatus"`);
    await queryRunner.query(`DROP TABLE "public"."order_items"`);
    await queryRunner.query(`DROP TABLE "public"."order_payments"`);
    await queryRunner.query(`DROP TYPE "public"."OrderPaymentMethod"`);
    await queryRunner.query(`DROP TABLE "public"."model_adjustment"`);
    await queryRunner.query(`DROP TYPE "public"."AdjustmentCategory"`);
    await queryRunner.query(`DROP TYPE "public"."AdjustmentType"`);
    await queryRunner.query(`DROP TABLE "public"."events"`);
    await queryRunner.query(`DROP TYPE "public"."EventType"`);
    await queryRunner.query(`DROP TABLE "public"."device_price_references"`);
    await queryRunner.query(`DROP TABLE "public"."devices"`);
    await queryRunner.query(`DROP TYPE "public"."DeviceCondition"`);
    await queryRunner.query(`DROP TYPE "public"."DeviceStatus"`);
    await queryRunner.query(`DROP TABLE "public"."device_files"`);
    await queryRunner.query(`DROP TYPE "public"."DeviceFileType"`);
    await queryRunner.query(`DROP TABLE "public"."device_colors"`);
    await queryRunner.query(`DROP TABLE "public"."device_storage_sizes"`);
    await queryRunner.query(`DROP TABLE "public"."model_accesories"`);
    await queryRunner.query(`DROP TABLE "public"."device_models"`);
    await queryRunner.query(`DROP TABLE "public"."device_history"`);
    await queryRunner.query(`DROP TABLE "public"."clients"`);
    await queryRunner.query(`DROP TABLE "public"."cash_accounts"`);
    await queryRunner.query(`DROP TABLE "public"."banks"`);
    await queryRunner.query(`DROP TABLE "public"."accounting_transactions"`);
    await queryRunner.query(`DROP TABLE "public"."accounting_accounts"`);
    await queryRunner.query(`DROP TYPE "public"."Currency"`);
    await queryRunner.query(`DROP TYPE "public"."AccountingAccountType"`);
  }
}
