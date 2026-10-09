import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export const DASHBOARD_TIME_ZONE = 'America/Argentina/Buenos_Aires';

/** Calendar days in the store's time zone, including today. */
export function dashboardPeriod(days: number, now = new Date()) {
  const localDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const start = new Date(Date.UTC(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate(), 3));
  start.setUTCDate(start.getUTCDate() - days + 1);
  return { days, from: start.toISOString(), to: now.toISOString(), timeZone: DASHBOARD_TIME_ZONE };
}

@Injectable()
export class DashboardService {
  constructor(private readonly database: DataSource) {}

  async get(days: number) {
    const period = dashboardPeriod(days);
    // One database snapshot. Aggregate items before joining orders so quantities,
    // payments and multiple products cannot multiply the sales totals.
    const [row] = await this.database.query(`
      WITH amounts AS (
        SELECT "orderId", SUM(quantity) AS units,
          SUM("priceUSD" * quantity) AS usd, SUM("priceARS" * quantity) AS ars
        FROM order_items GROUP BY "orderId"
      ), completed AS (
        SELECT o.*, COALESCE(a.units, 0) AS units, COALESCE(a.usd, 0) AS usd,
          COALESCE(a.ars, 0) AS ars
        FROM orders o LEFT JOIN amounts a ON a."orderId" = o.id
        WHERE o."deletedAt" IS NULL AND o.status = 'confirmed'
          AND o."createdAt" >= $1::timestamptz AND o."createdAt" <= $2::timestamptz
      ), daily AS (
        SELECT ("createdAt" AT TIME ZONE $3)::date AS day,
          COUNT(*) AS orders, SUM(usd) AS usd FROM completed GROUP BY day
      ), calendar AS (
        SELECT generate_series(($1::timestamptz AT TIME ZONE $3)::date,
          ($2::timestamptz AT TIME ZONE $3)::date, interval '1 day')::date AS day
      ), recent AS (
        SELECT o."publicId", c.name AS "clientName", o.status, o."createdAt",
          COALESCE(a.usd, 0) AS "totalUSD", COALESCE(a.ars, 0) AS "totalARS"
        FROM orders o LEFT JOIN amounts a ON a."orderId" = o.id
          LEFT JOIN clients c ON c.id = o."clientId"
        WHERE o."deletedAt" IS NULL AND o."createdAt" >= $1::timestamptz
          AND o."createdAt" <= $2::timestamptz
        ORDER BY o."createdAt" DESC, o.id DESC LIMIT 5
      )
      SELECT jsonb_build_object(
        'sales', (SELECT jsonb_build_object('orders', COUNT(*),
          'units', COALESCE(SUM(units), 0), 'totalUSD', COALESCE(SUM(usd), 0),
          'totalARS', COALESCE(SUM(ars), 0), 'averageUSD', COALESCE(AVG(usd), 0)) FROM completed),
        'inventory', (SELECT jsonb_build_object('total', COUNT(*),
          'available', COUNT(*) FILTER (WHERE status = 'available'),
          'reserved', COUNT(*) FILTER (WHERE status = 'reserved'),
          'repairing', COUNT(*) FILTER (WHERE status = 'repairing'),
          'transit', COUNT(*) FILTER (WHERE status = 'transit'),
          'damaged', COUNT(*) FILTER (WHERE status = 'damaged'),
          'lost', COUNT(*) FILTER (WHERE status = 'lost'),
          'sold', COUNT(*) FILTER (WHERE status = 'sold'),
          'valueUSD', COALESCE(SUM("purchasePrice") FILTER (
            WHERE status IN ('available', 'reserved', 'repairing', 'transit', 'damaged')), 0))
          FROM devices WHERE "deletedAt" IS NULL),
        'accessoriesUnits', (SELECT COALESCE(SUM(stock), 0) FROM products
          WHERE "deletedAt" IS NULL AND "deviceId" IS NULL),
        'customers', (SELECT COUNT(*) FROM clients WHERE "deletedAt" IS NULL),
        'pipeline', (SELECT jsonb_build_object('pending', COUNT(*) FILTER (WHERE status = 'pending'),
          'deposited', COUNT(*) FILTER (WHERE status = 'deposited')) FROM orders WHERE "deletedAt" IS NULL),
        'balances', (SELECT jsonb_build_object(
          'cashUSD', COALESCE(SUM(balance) FILTER (WHERE type = 'cash_account' AND currency = 'usd'), 0),
          'cashARS', COALESCE(SUM(balance) FILTER (WHERE type = 'cash_account' AND currency = 'ars'), 0),
          'bankUSD', COALESCE(SUM(balance) FILTER (WHERE type = 'bank' AND currency = 'usd'), 0),
          'bankARS', COALESCE(SUM(balance) FILTER (WHERE type = 'bank' AND currency = 'ars'), 0))
          FROM accounting_accounts WHERE "deletedAt" IS NULL),
        'exchangeRate', (SELECT "valueN" FROM parameter WHERE key = 'dolar_hoy_cba_price'),
        'series', (SELECT jsonb_agg(jsonb_build_object('date', to_char(c.day, 'YYYY-MM-DD'),
          'orders', COALESCE(d.orders, 0), 'totalUSD', COALESCE(d.usd, 0)) ORDER BY c.day)
          FROM calendar c LEFT JOIN daily d ON d.day = c.day),
        'recentOrders', COALESCE((SELECT jsonb_agg(to_jsonb(r)) FROM recent r), '[]'::jsonb)
      ) AS summary`, [period.from, period.to, period.timeZone]);
    return { ...row.summary, period };
  }
}
