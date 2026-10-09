export interface DashboardSummary {
    period: { days: number; from: string; to: string; timeZone: string };
    sales: { orders: number; units: number; totalUSD: number; totalARS: number; averageUSD: number };
    inventory: { total: number; available: number; reserved: number; repairing: number; transit: number; damaged: number; lost: number; sold: number; valueUSD: number };
    accessoriesUnits: number;
    customers: number;
    pipeline: { pending: number; deposited: number };
    balances: { cashUSD: number; cashARS: number; bankUSD: number; bankARS: number };
    exchangeRate: number | null;
    series: { date: string; orders: number; totalUSD: number }[];
    recentOrders: { publicId: string; clientName: string | null; status: string; createdAt: string; totalUSD: number; totalARS: number }[];
}
