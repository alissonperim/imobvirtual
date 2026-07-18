# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # install dependencies
pnpm run start:dev    # run in watch mode
pnpm run build        # compile TypeScript
pnpm run test         # run all unit tests
pnpm run test:watch   # run tests in watch mode
pnpm run test:cov     # run tests with coverage
pnpm run test:e2e     # run e2e tests
pnpm run lint         # lint and auto-fix
pnpm run format       # format with prettier
```

To run a single test file:

```bash
pnpm jest src/auth/use-cases/__tests__/request-otp.use-case.test.ts
```

## Architecture

- This is a **NestJS** application following Clean Architecture. Business logic lives in use-cases; repositories abstract data access; domain types are shared via a local `packages/` monorepo.
- Persistence uses **TypeORM** against Postgres. Entity classes live in `src/database/entities/*.entity.ts`: DB columns are snake_case (`@Column({ name: 'phone_number' }) phoneNumber: string`), class attributes are camelCase.
- Foreign keys are modeled as relations (`@ManyToOne`/`@OneToOne` + `@JoinColumn`) plus a `@RelationId()` property for reading the scalar id without eager-loading the relation. Do not add a second `@Column` on the same DB column as a relation's `@JoinColumn` — TypeORM merges that column's metadata (e.g. `insert:false`) onto the join column too, silently dropping the FK from inserts.
- `id` is a 21-char nanoid-format string (`src/database/utils/generate-id.ts`) assigned via a `@BeforeInsert()` hook on each entity, not a DB-generated UUID.
- The dto/mapper functions map the entity (already camelCase) to the domain type. They live in the domain's `dto` or `domain` folder, follow the example from `/properties/dto/domain.ts`.

### Path aliases

| Alias    | Resolves to  | Purpose                |
| -------- | ------------ | ---------------------- |
| `@pkg/*` | `packages/*` | Shared types and utils |
| `@app/*` | `src/*`      | Application source     |

### Module structure

Each domain (`auth`, `accounts`, `properties`, `owners`, `renters`, `addresses`, `rental-contracts`) is a self-contained NestJS module. The pattern inside each module:

```
<domain>/
  domain/        # Input/output types (no NestJS imports)
  repositories/
    <name>.domain.ts                  # Repository interface
    implementations/<name>.repository.ts  # In-memory implementation
    implementations/__tests__/        # Repository tests
  services/
    <name>.service.ts                 # Domain service + interface
    __tests__/                        # Service tests
  use-cases/
    <name>.use-case.ts                # Use-case class + interface
    __tests__/                        # Use-case tests
  <domain>.module.ts
  <domain>.controllers.ts
```

### Dependency injection

All providers are registered by **string tokens** in the module, not by class reference:

```ts
{ provide: 'OTP_SERVICE', useClass: OtpService }
```

Inject them with `@Inject('OTP_SERVICE')` and type them against the interface. This keeps use-cases and tests decoupled from concrete implementations.

### Auth flow

Authentication is OTP-only (no passwords):

1. `POST /auth/otp` — request a 6-digit OTP for sign-in or sign-up
2. `POST /auth/signin/otp-challenge` — verify OTP → returns access token + refresh token
3. `POST /auth/signup/otp-challenge` — verify OTP + provide `name`/`role` → creates account + returns tokens
4. `POST /auth/refresh` — exchange refresh token for a new token pair

**Access token**: RS256 JWT, 15-minute TTL. The private key is read at runtime from `private_key.pem` at the project root.  
**Refresh token**: random 48-byte `base64url` string, SHA-256 hashed before storage, 30-day TTL.

OTP expiry is controlled by `MINUTES_TO_EXPIRE_OTP` env var (defaults to 6). OTP codes are stored as SHA-256 hashes; plaintext is never persisted.

### Repositories

Repositories are backed by TypeORM (`@InjectRepository(XEntity)`), registered globally via `DatabaseModule` (`src/database/database.module.ts`) — no per-module `TypeOrmModule.forFeature` needed. The repository interface is defined separately from the implementation so the DB layer can be swapped without touching use-cases. `renters` and `rental-contracts` are still stub modules (no repository implementation yet); there is no `addresses` module — Address is only reachable as a relation from Owner/Property.

Not-found handling on `update`/`softDelete` uses `UpdateResult.affected` via `wasAffected()` (`packages/utils/error-utils.ts`), not exceptions.

### Migrations

Migrations live in `src/database/migrations/*.ts`, driven by `src/database/data-source.ts`:

```bash
pnpm exec typeorm-ts-node-commonjs migration:generate -d src/database/data-source.ts src/database/migrations/<Name>  # generate from entity changes
pnpm run migration:run                                          # apply pending migrations
pnpm run migration:revert                                       # roll back the last migration
```

(`pnpm run migration:generate -- <path>` does not work — pnpm's `--` forwarding conflicts with the CLI's own arg parsing; use `pnpm exec` for generate.)

### Shared types (`packages/types`)

Domain entities and enums live here and are imported via `@pkg/types`. Key enums: `EOtpPurpose`, `EOtpChannel`, `EAccountRole`, `EAccountStatus`.

### Testing conventions

- Unit tests use `jest.Mocked<IInterface>` for all dependencies — no NestJS testing module.
- Use-cases are instantiated directly: `new UseCase(mockA, mockB, mockC)`.
- Test files match `*.test.ts` or `*.spec.ts` and live in `__tests__/` subdirectories alongside the files they test.
- Repositories must be tested too
