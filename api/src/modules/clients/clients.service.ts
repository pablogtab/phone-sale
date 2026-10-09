import { Transactional } from '@/database/transactional';
import { IsNull } from 'typeorm';
import {
  updateEntity,
  removeEntity,
  optionalIn,
  containsText,
} from '@/database/repository-utils';
import { Paginated, PaginationDto } from '@/common/dtos/pagination.dto';
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { AccountingAccountsService } from '../accounting-accounts/accounting-accounts.service';
import { DatabaseService } from '../../database/database.service';
import { CreateClientDto } from './dto/create-client.dto';
import { PublicClient } from './dto/public-client.dto';
import { SearchClientDto } from './dto/search-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService implements OnModuleInit {
  constructor(
    private readonly database: DatabaseService,
    private readonly accountsService: AccountingAccountsService,
  ) {}

  async onModuleInit() {
    const entities = await this.database.client.find({
      where: { deletedAt: IsNull() },
    });
    for (const entity of entities) {
      for (const currency of ['usd', 'ars'] as const) {
        await this.accountsService.createIfNotExists({
          clientId: entity.id,
          type: 'client',
          currency,
          name: entity.name,
          isAsset: false,
        });
      }
    }
  }

  @Transactional()
  async create(dto: CreateClientDto) {
    const client = await this.database.client.save(
      this.database.client.create({ ...dto }),
    );

    // Create accounts for the client
    await this.createAccountsIfNotExists(client.id);

    delete client.id;
    delete client.deletedAt;

    return client;
  }

  async search(data: SearchClientDto) {
    const clients = await this.database.client.find({
      where: [
        { identifier: containsText(data.query) },
        { name: containsText(data.query) },
        { phoneNumber: containsText(data.query) },
        { birthDate: containsText(data.query) },
        { instagram: containsText(data.query) },
      ].map((condition) => ({
        ...{
          deletedAt: IsNull(),
          ...(data.wholesaler != null ? { wholesaler: data.wholesaler } : {}),
        },
        ...condition,
      })),
      order: { id: 'desc' },
      take: 20,
    });

    return clients;
  }

  async findAll(pag: PaginationDto): Promise<Paginated<PublicClient>> {
    const clients = await this.database.client.find({
      where: [
        { identifier: containsText(pag.search) },
        { name: containsText(pag.search) },
        { phoneNumber: containsText(pag.search) },
        { birthDate: containsText(pag.search) },
        { instagram: containsText(pag.search) },
      ].map((condition) => ({ ...{ deletedAt: IsNull() }, ...condition })),
      order: { id: 'desc' },
      skip: pag.page * pag.limit - pag.limit,
      take: pag.limit,
    });

    const total = await this.database.client.count({
      where: [
        { identifier: containsText(pag.search) },
        { name: containsText(pag.search) },
        { phoneNumber: containsText(pag.search) },
        { birthDate: containsText(pag.search) },
        { instagram: containsText(pag.search) },
      ].map((condition) => ({ ...{ deletedAt: IsNull() }, ...condition })),
    });

    return {
      data: clients.map((client) => {
        delete client.id;
        delete client.deletedAt;
        return client;
      }),
      totalRows: total,
      page: pag.page,
      limit: pag.limit,
      totalPages: Math.ceil(total / pag.limit),
    };
  }

  async findOne(uuid: string) {
    const client = await this.database.client.findOne({
      where: { publicId: uuid, deletedAt: IsNull() },
    });

    if (!client)
      throw new NotFoundException(`Client with id <<${uuid}>> not found`);

    return client;
  }

  async update(uuid: string, dto: UpdateClientDto) {
    const client = await this.database.client.findOne({
      where: { publicId: uuid, deletedAt: IsNull() },
    });
    if (!client)
      throw new NotFoundException(`Client with id <<${uuid}>> not found`);

    const updated = await updateEntity(
      this.database.client,
      { id: client.id },
      { ...dto },
    );

    return updated;
  }

  async remove(uuid: string) {
    const client = await this.database.client.findOne({
      where: { publicId: uuid, deletedAt: IsNull() },
    });
    if (!client)
      throw new NotFoundException(`Client with id <<${uuid}>> not found`);

    await updateEntity(
      this.database.client,
      { id: client.id },
      { deletedAt: new Date() },
    );

    return { message: `Client with id <<${uuid}>> removed` };
  }

  async createAccountsIfNotExists(clientId: number) {
    const client = await this.database.client.findOne({
      where: { id: clientId, deletedAt: IsNull() },
    });
    if (!client)
      throw new NotFoundException(`Client with id <<${clientId}>> not found`);

    // Create accounts for the client
    await this.accountsService.createIfNotExists({
      name: client.name,
      clientId: client.id,
      type: 'client',
      currency: 'usd',
      isAsset: false,
    });
    await this.accountsService.createIfNotExists({
      name: client.name,
      clientId: client.id,
      type: 'client',
      currency: 'ars',
      isAsset: false,
    });

    return { message: `Accounts for client with id <<${clientId}>> created` };
  }
}
