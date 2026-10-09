import { DashboardSummary } from '../app/core/models/dashboard.interface';

export const dashboardFixture: DashboardSummary = {
    period: { days: 30, from: '2026-09-10T03:00:00Z', to: '2026-10-09T18:00:00Z', timeZone: 'America/Argentina/Buenos_Aires' },
    sales: { orders: 1, units: 2, totalUSD: 250, totalARS: 375000, averageUSD: 250 },
    inventory: { total: 8, available: 3, reserved: 1, repairing: 1, transit: 1, sold: 1, damaged: 1, lost: 0, valueUSD: 1000 },
    accessoriesUnits: 10, customers: 8, pipeline: { pending: 2, deposited: 1 },
    balances: { cashUSD: 100, cashARS: 150000, bankUSD: 200, bankARS: 300000 },
    exchangeRate: 1500,
    series: [{ date: '2026-10-08', orders: 0, totalUSD: 0 }, { date: '2026-10-09', orders: 1, totalUSD: 250 }],
    recentOrders: [{ publicId: 'order-1', clientName: 'Ana Demo', status: 'confirmed', createdAt: '2026-10-09T18:00:00Z', totalUSD: 250, totalARS: 375000 }],
};
