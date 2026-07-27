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
- `id` is a 24-char nanoid-format string (`src/database/utils/generate-id.ts`) assigned via a `@BeforeInsert()` hook on each entity, not a DB-generated UUID.
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

`auth` predates this pattern and still differs: it adds `services/`, `decorators/`, and `guards/` folders, and uses `<domain>.controllers.ts` (plural) and `<name>.domain.ts` / `implementations/` (plural) naming. Its sign-in/sign-up OTP-challenge routes already use yup (`src/auth/schemas/*.schema.ts`) like the rest of the app; only `POST /auth/refresh`'s `RefreshTokenInput` still uses a `class-validator` decorator (`@IsString()` on `src/auth/domain/session.ts`), validated by the global `ValidationPipe` registered in `main.ts` rather than a per-route `YupValidationPipe`. `accounts` is older still (`use-cases/domain.ts` + `use-cases/implementations/<name>.use-case.ts`, no controller yet). `renters` and `rental-contracts` are stub modules — only the `.module.ts` file exists, no repository implementation. There is no `addresses` module; `Address` is only reachable as a relation from `Owner`/`Property`.

### Dependency injection

All providers are registered by **string tokens** in the module, not by class reference:

```ts
{ provide: 'OTP_SERVICE', useClass: OtpService }
```

Inject them with `@Inject('OTP_SERVICE')` and type them against the interface. This keeps use-cases and tests decoupled from concrete implementations.

### Auth flow

Authentication is OTP-only (no passwords). There is no global route prefix — `OtpController` is mounted at `/otp` (not `/auth/otp`), everything else lives under `/auth`. All four endpoints below are `@Public()` (no `Authorization` header needed to call them).

#### 1. Request an OTP — `POST /otp`

Body, validated by `requestOtpSchema` (`src/otp/schemas/request-otp.schema.ts`):

```jsonc
{
  "phoneNumber": "62999999999",     // 11 digits, local BR format: DDD (2) + 9-digit mobile. No "+55", spaces or symbols.
  "channel": "SMS",                 // "SMS" | "WHATSAPP"
  "purpose": "SIGN_IN",             // "SIGN_IN" | "SIGN_UP"
  "role": "OWNER",                  // "OWNER" | "RENTER"
  // required ONLY when purpose is "SIGN_UP":
  "name": "Maria",
  "lastName": "Silva",
  "email": "maria@silva.com"
}
```

- `SIGN_IN` requires an account to already exist for that `phoneNumber` + `role`, or the API returns `400 Account not found`.
- `SIGN_UP` requires that no account exists yet for that `phoneNumber` + `role`, or the API returns `409 Account already exists`. On success it stores a pending registration (`name`/`lastName`/`email`) keyed by the returned `otpChallengeId`, consumed later at step 3.
- Response:
  ```jsonc
  { "otpChallengeId": "<24-char id>", "expiresIn": 360, "purpose": "SIGN_IN" }
  ```
- OTP expiry is controlled by `MINUTES_TO_EXPIRE_OTP` env var (defaults to 6, i.e. `expiresIn` defaults to `360` seconds). The 6-digit code itself is sent via `channel` (SMS/WhatsApp) — it is never returned in the response body. Codes are stored as SHA-256 hashes; plaintext is never persisted.

#### 2a. Confirm sign-in — `POST /auth/signin/otp-challenge`

```jsonc
{ "otpId": "<otpChallengeId from step 1>", "otp": "123456" }
```

Returns `{ "accessToken": "...", "refreshToken": "..." }` on success.

#### 2b. Confirm sign-up — `POST /auth/signup/otp-challenge`

```jsonc
{ "otpId": "<otpChallengeId from step 1>", "otp": "123456" }
```

Same body shape as sign-in — `name`/`lastName`/`email`/`role` are **not** resent here; they were already captured in step 1 and are pulled from the pending registration by `otpId`. This creates the `Owner`/`Renter` row and its linked `Account` in one transaction, then returns the same `{ accessToken, refreshToken }` shape.

#### 3. Refresh — `POST /auth/refresh`

```jsonc
{ "refreshToken": "..." }
```

Returns a new `{ accessToken, refreshToken }` pair and **rotates** the refresh token — the old one stops working immediately. A reused/expired/unknown refresh token returns `401 Invalid refresh token`; a token for a blocked/inactive account returns `401 Account is not active` and revokes the session server-side.

#### Using the access token

Send it as `Authorization: Bearer <accessToken>` on every non-public route (checked by `JwtAuthGuard`, opted out per-route/controller via `@Public()`). It's an RS256 JWT, 15-minute TTL, `iss: 'imobvirtual-api'`, `aud: 'imobvirtual-app'`, payload `{ sub: accountId, role, sid: sessionId, iat, exp }`. The frontend should treat `401` on any protected call as "call `/auth/refresh`, then retry once" — there's no separate "token expired" vs "token invalid" distinction in the response.

**Refresh token**: random 48-byte `base64url` string, SHA-256 hashed before storage, 30-day TTL — store it securely (e.g. httpOnly cookie or secure storage), never in a JWT or logged.

#### Validation errors

Every OTP/auth endpoint above is guarded by `YupValidationPipe`. A failed validation returns `400` with:

```jsonc
{ "message": "Validation failed", "errors": [{ "field": "phoneNumber", "message": "..." }] }
```

### Repositories

Repositories are backed by TypeORM (`@InjectRepository(XEntity)`), registered globally via `DatabaseModule` (`src/database/database.module.ts`) — no per-module `TypeOrmModule.forFeature` needed. The repository interface is defined separately from the implementation so the DB layer can be swapped without touching use-cases.

Not-found handling on `update`/`softDelete` uses `UpdateResult.affected` via `wasAffected()` (`packages/utils/error-utils.ts`), not exceptions.

### Request validation

`owners`, `properties`, `otp`, and `auth`'s OTP-challenge routes validate controller input with **yup** schemas (`<domain>/schemas/*.schema.ts`), applied per-route via `@Body(new YupValidationPipe(theSchema))` (`YupValidationPipe` lives in `packages/utils/schema-validator.ts`; it strips unknown keys and returns a 400 with per-field errors on failure). A global `class-validator` `ValidationPipe` (`whitelist: true, transform: true`, registered in `src/main.ts`) also runs on every route — this is what validates `auth`'s remaining `class-validator`-based DTO (`RefreshTokenInput` in `src/auth/domain/session.ts`). New modules should use the yup pattern.

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
