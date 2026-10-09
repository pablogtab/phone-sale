import { DatabaseService } from '@/database/database.service';
import { Injectable } from '@nestjs/common';
import { DeviceHistory } from '@/database/entities';

@Injectable()
export class DeviceHistoryService {
  constructor(private database: DatabaseService) {}

  async create(history: DeviceHistory) {
    const created = await this.database.deviceHistory.save(
      this.database.deviceHistory.create({
        description: history.description,
        date: history.date || new Date(),
        userId: history.userId,
        deviceId: history.deviceId,
      }),
    );
    return created;
  }

  getByDevice(id: number) {
    return this.database.deviceHistory.find({ where: { deviceId: id } });
  }
}
