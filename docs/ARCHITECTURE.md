# Architecture

## API

- `src/auth`: authentication, password hashing, tokens, global guards.
- `src/common`: decorators, validation/error handling, request logging, shared file handling.
- `src/database`: native EntitySchemas and domain types, connection settings, versioned migrations, editable starter and fictional demo seeds, repository/unit-of-work infrastructure.
- `src/modules`: domain controllers, DTOs, services and module definitions for inventory/devices, products, clients, suppliers, purchases, orders, accounting, users and settings.

Controllers validate requests and delegate business rules to services. Services use typed native TypeORM repositories through `DatabaseService`. Query predicates use TypeORM `IsNull`, `In` and `ILike`; relation hydration is explicit. There is no Prisma client, query facade, or automatic schema synchronization.

`DatabaseService.transaction()` creates an EntityManager scope using AsyncLocalStorage. Repository access resolves that manager throughout nested service calls. `@Transactional()` covers compound purchases, order creation/continuation/cancellation, inventory mutations and accounting operations. Nested operations reuse the transaction. Device events are awaited so observer-created products participate in the same database transaction. Filesystem writes are separate from database transactions.

Passwords created now use salted scrypt; valid legacy PBKDF2 hashes remain accepted. The inherited shared sudo-password path was removed. Inactive and deleted users cannot sign in. The API owns authorization; frontend route guards provide navigation behavior only.

## Web

- `core/auth`: session storage, guards, current role, scoped HTTP interceptor.
- `core/api`: typed domain HTTP services.
- `core/models`, `core/utils`: shared client models and formatting helpers.
- `features`: lazily loaded business screens and domain dialogs.
- `layout`: shell and permission-aware responsive navigation.
- `shared/ui`, `shared/directives`: reusable controls and page states.

All API URLs are relative `/api/`; the development proxy and container Nginx select the server. The interceptor sends credentials only to the local API. `styles.css` defines common surfaces, typography, focus states, controls and responsive rules. The Optimus UI preset follows these light-theme tokens. The icon component maps the existing domain icon names onto OpenNG Icons and resolves colors directly from CSS variables.

Loading, empty and retry states are explicit on inventory and sales lists. Sales pagination requests the selected page. Login reports errors inline and disables repeat submissions while loading. The default route opens inventory. Store names come from public store settings; there are no promotional dashboard or login panels. Exchange rates are edited manually. Selector and client searches cancel stale requests; purchase dialogs preserve failed drafts and block repeated saves.

## Scope and migration

Existing business workflows were retained and reorganized while persistence, initialization, styling and navigation were rebuilt. Source provenance is recorded independently of Git history. The TypeORM initial migration is a fresh-database baseline. No upstream production database was modified or imported.

The current meaningful verification suite includes backend unit tests, frontend behavior tests and isolated database/API integration checks. Visual verification uses the running local interface. Device hardware, external services, production deployment, and production data import are separate verification boundaries.
