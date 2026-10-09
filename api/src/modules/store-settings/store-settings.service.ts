import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export const DEFAULT_STORE_NAME = 'Mi tienda';
@Injectable()
export class StoreSettingsService {
  constructor(private readonly database: DatabaseService) {}
  async get() {
    const parameter = await this.database.parameter.findOneBy({
      key: 'store_name',
    });
    return { name: parameter?.valueS || DEFAULT_STORE_NAME };
  }
  async update(name: string) {
    await this.database.parameter.upsert({ key: 'store_name', valueS: name }, [
      'key',
    ]);
    return this.get();
  }
}
