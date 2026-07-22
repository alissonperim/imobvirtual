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

Each domain (`auth`, `accounts`, `properties`, `owners`, `renters`, `rental-contracts`) is a self-contained NestJS module. `owners` and `properties` are the current reference pattern — follow them for new modules:

```
<domain>/
  domain/                                # mapper functions (entity -> domain type), no NestJS imports
  dto/                                   # use-case input/output types (index.ts, domain.ts)
  schemas/                               # yup validation schemas, applied via YupValidationPipe in the controller
  repositories/
    domain.ts                            # Repository interface
    implementation/<name>.repository.ts  # TypeORM-backed implementation
    implementation/__tests__/            # Repository tests
  use-cases/
    <name>.use-case.ts                   # Use-case class + interface
    __tests__/                           # Use-case tests
  <domain>.module.ts
  <domain>.controller.ts
```

`auth` predates this pattern and still differs: it adds `services/`, `decorators/`, and `guards/` folders, uses `<domain>.controllers.ts` (plural) and `<name>.domain.ts` / `implementations/` (plural) naming, and validates its DTOs with `class-validator` decorators instead of yup. `accounts` is older still (`use-cases/domain.ts` + `use-cases/implementations/<name>.use-case.ts`, no controller yet). `renters` and `rental-contracts` are stub modules — only the `.module.ts` file exists, no repository implementation. There is no `addresses` module; `Address` is only reachable as a relation from `Owner`/`Property`.

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

Repositories are backed by TypeORM (`@InjectRepository(XEntity)`), registered globally via `DatabaseModule` (`src/database/database.module.ts`) — no per-module `TypeOrmModule.forFeature` needed. The repository interface is defined separately from the implementation so the DB layer can be swapped without touching use-cases.

Not-found handling on `update`/`softDelete` uses `UpdateResult.affected` via `wasAffected()` (`packages/utils/error-utils.ts`), not exceptions.

### Request validation

`owners` and `properties` validate controller input with **yup** schemas (`<domain>/schemas/*.schema.ts`), applied per-route via `@Body(new YupValidationPipe(theSchema))` (`YupValidationPipe` lives in `packages/utils/schema-validator.ts`; it strips unknown keys and returns a 400 with per-field errors on failure). `auth` predates this and still validates with `class-validator` decorators on its domain classes (`src/auth/domain/otp.ts`, `session.ts`) — new modules should use the yup pattern.

### Migrations

Migrations live in `src/database/migrations/*.ts`, driven by `src/database/data-source.ts`:

```bash
pnpm exec typeorm-ts-node-commonjs migration:generate -d src/database/data-source.ts src/database/migrations/<Name>  # generate from entity changes
pnpm run migration:run                                          # apply pending migrations
pnpm run migration:revert                                       # roll back the last migration
```

(`pnpm run migration:generate -- <path>` does not work — pnpm's `--` forwarding conflicts with the CLI's own arg parsing; use `pnpm exec` for generate.)

### Shared types (`packages/types`)

Domain entities and enums live here and are imported via `@pkg/types`. Enums: `EOtpPurpose`, `EOtpChannel`, `EAccountRole`, `EAccountStatus`, `EMaritalStatus`, `EPropertyStatus`, `EPropertyChargeAmountType`, `ERentalContractStatus`.

### Testing conventions

- Unit tests use `jest.Mocked<IInterface>` for all dependencies — no NestJS testing module.
- Use-cases are instantiated directly: `new UseCase(mockA, mockB, mockC)`.
- Test files match `*.test.ts` or `*.spec.ts` and live in `__tests__/` subdirectories alongside the files they test.
- Repositories must be tested too
