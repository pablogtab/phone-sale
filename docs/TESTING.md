# Frontend tests

Run from the repository root:

```sh
npm run test:web             # deterministic Angular/Vitest tests
npm run test:web:coverage    # tests + coverage thresholds + HTML/JSON reports
npm test                    # API units, frontend, real API/database integration
```

The frontend suite uses Angular TestBed, RouterTestingHarness, jsdom and HttpTestingController. Tests run real components and templates, dispatch form submissions/clicks, and flush staged HTTP responses. They require neither the API nor seeded data. Unexpected requests and unhandled errors fail tests. The shared fixtures contain fictional data.

| Area | Scenarios |
| --- | --- |
| Routes | All 17 authenticated destinations, root redirect, login redirect, lazy route data and permissions |
| Dialogs | 20 model, color, storage, accessory, user, device, service, payment and accounting dialogs; opening performs no mutation |
| Authentication | Login submission, invalid input, duplicate submission, errors, password visibility, existing session, guards and token scope |
| Catalog | Loading, empty/error/retry states, stale responses, drag ordering and rollback, new/edit models, required selections, accessories, prices, adjustments, color/storage activation, readable labels without parentheses |
| Sales | Pricing, quantities, duplicate items, totals, manual exchange rate, full payment, credit, pending-order continuation, read-only confirmed orders, cancellation, retries, rounding and wholesale confirmation |
| Inventory | Model relations, validation, multipart create/update, photos, missing IMEI, details, tester identity, service and completion, stale search and retry |
| Payments/accounts | USD/ARS conversion, cashback, valid amounts, cash/bank destinations, USD confirmation, signed movements, transfers and account history |
| Customers/users | Listing and creation, form load/edit/cancel/save, invalid names, errors, role selection and permission payloads |
| Settings/controls | Store name and manual dollar persistence, selector cancellation, checkbox/select integration, monetary formatting, pagination, label editing, permission visibility and observable teardown |

Coverage includes all `src/app/**/*.ts`, including unvisited files. Thresholds are global: 80% statements and lines, 75% branches and functions. Reports are generated at `web/coverage/phone-sale/index.html` and uploaded by the Verify workflow. Generated reports are ignored by Git.

These are unit and component integration tests, not browser end-to-end tests. jsdom cannot prove CSS layout, responsive appearance, drag geometry, file picker behavior or interaction across a real API. API/database integration tests cover actual business persistence separately; visual checks still require the running application. The models page was additionally verified in Safari after a fresh reload.

When adding a screen, include it in `app.routes.spec.ts`; add dialog rendering coverage in `dialogs.spec.ts`. Add workflow tests for writes, invalid inputs, confirmation cancellation and server failures. For async UI regressions, use `autoDetectChanges()` and `whenStable()` after HTTP responses, avoiding a forced `detectChanges()` that can hide a missing view notification.
