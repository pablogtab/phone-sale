import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventService {
  constructor(private database: DatabaseService) {}
  async create(data: CreateEventDto) {
    return await this.database.event.save(this.database.event.create(data));
  }

  async getEventById(id: number) {
    return await this.database.event.findOne({ where: { id } });
  }
}
