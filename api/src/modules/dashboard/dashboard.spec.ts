import { ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { dashboardPeriod, DashboardService } from './dashboard.service';
import { DashboardController, DashboardQuery } from './dashboard.controller';
import { UserToken } from '../../auth/dto/token-info.dto';

describe('dashboard', () => {
  it('includes today using Argentina calendar days at a UTC date boundary', () => {
    expect(dashboardPeriod(7, new Date('2026-10-10T01:00:00Z'))).toEqual({
      days: 7, from: '2026-10-03T03:00:00.000Z', to: '2026-10-10T01:00:00.000Z', timeZone: 'America/Argentina/Buenos_Aires',
    });
    expect(dashboardPeriod(30, new Date('2026-01-01T03:00:00Z')).from).toBe('2025-12-03T03:00:00.000Z');
  });
  it('restricts periods to supported integers and transforms query strings', async () => {
    for (const days of ['7', '30', '90']) expect(await validate(plainToInstance(DashboardQuery, { days }))).toHaveLength(0);
    for (const days of ['0', '-1', '3', '30.5', 'no', '99999']) expect((await validate(plainToInstance(DashboardQuery, { days }))).length).toBeGreaterThan(0);
    expect(plainToInstance(DashboardQuery, {}).days).toBe(30);
  });
  it('does not query financial data for non-admin users', () => {
    const service = { get: jest.fn() };
    const controller = new DashboardController(service as unknown as DashboardService);
    expect(() => controller.get({ days: 30 }, { role: 'user' } as UserToken)).toThrow(ForbiddenException);
    expect(service.get).not.toHaveBeenCalled();
    controller.get({ days: 7 }, { role: 'admin' } as UserToken);
    expect(service.get).toHaveBeenCalledWith(7);
  });
  it('uses one parameterized snapshot query and returns its summary with the period', async () => {
    const query = jest.fn().mockResolvedValue([{ summary: { sales: { orders: 0 }, series: [] } }]);
    const summary = await new DashboardService({ query } as unknown as DataSource).get(30);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][1]).toEqual([summary.period.from, summary.period.to, summary.period.timeZone]);
    expect(summary.sales.orders).toBe(0);
    expect(summary.period.days).toBe(30);
  });
});
