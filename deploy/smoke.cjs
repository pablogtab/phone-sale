const base = process.argv[2] || 'http://127.0.0.1:3210';
(async () => {
  const request = async (path, options = {}) => {
    const result = await fetch(`${base}/api/${path}`, { ...options, signal: AbortSignal.timeout(15000) });
    if (!result.ok) throw new Error(`${path}: HTTP ${result.status}`);
    return result.json();
  };
  const store = await request('store-settings');
  if (!store.name) throw new Error('Store configuration missing');
  const login = await request('login/username', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: process.env.SEED_ADMIN_USERNAME, password: process.env.SEED_ADMIN_PASSWORD }),
  });
  if (!login.token) throw new Error('Login token missing');
  const options = { headers: { Authorization: `Bearer ${login.token}` } };
  const models = await request('devices/models', options);
  if (!Array.isArray(models) || models.length < 39) throw new Error('Catalog incomplete');
  await request('clients', options);
  await request('orders', options);
  const summary = await request('dashboard?days=30', options);
  if (summary.series?.length !== 30 || !Number.isFinite(summary.sales?.totalUSD)) throw new Error('Dashboard metrics invalid');
  console.log(`Smoke passed: ${store.name}, login, ${models.length} models, clients, orders, dashboard`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
