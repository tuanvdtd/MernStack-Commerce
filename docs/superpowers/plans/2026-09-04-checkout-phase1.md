# Checkout Phase 1: Cart, Order & COD Checkout — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully working, testable vertical slice of checkout: real Cart API, VN-compliant Address book, idempotent COD order creation (cart-based or "buy now"), order status management, admin order tools, and frontend wiring for the existing mock UI.

**Architecture:** Express + TypeScript + Prisma/MySQL backend, following the existing `*.routes/controller/service/repo/validation/mapper/types.ts` per-module layout (see `back-end/src/modules/products/` and `back-end/src/modules/reviews/` as references). New backend modules: `cart`, `addresses`, `locations`, `orders`, `checkout`. React frontend rewires existing mock pages to real APIs via new `front-end/src/apis/*Api.ts` files following the existing `axiosConfig` pattern.

**Tech Stack:** Express 5, Prisma 7 (MySQL/MariaDB), Zod, Redis (idempotency), Vitest (new — no test framework exists yet), React, Zustand, axios.

**Spec:** `docs/superpowers/specs/2026-09-04-checkout-phase1-design.md`

**Scope note (per user decision during planning):** Fetching the real nationwide VN province/ward dataset from `provinces.open-api.vn` is deferred. This plan seeds `Province`/`Ward` with a small **hand-written sample** (3 provinces, a few wards each) so the Location API and Address flow are fully functional and testable now. Loading the full real dataset is an explicit follow-up task, not part of this plan.

**Coordination note:** a concurrent Claude Code session in this same repo (`mernstack-commerce-61`) was independently writing a different version of this same plan file (using the real `provinces.open-api.vn` fetch instead of the sample-data approach above). The user has confirmed this file — the sample-data approach — is the one to keep; that other session should be stopped or redirected before it writes to this path again.

---

## Part A — Backend

### Task 1: Set up Vitest test framework

No test framework exists in `back-end/` today (no jest/vitest, no `test` script). This task adds one so every later task can follow TDD.

**Files:**
- Modify: `back-end/package.json`
- Create: `back-end/vitest.config.ts`
- Create: `back-end/src/smoke.test.ts`

- [ ] **Step 1: Install dependencies**

Run: `cd back-end && npm install -D vitest vitest-mock-extended`
Expected: adds `vitest` and `vitest-mock-extended` to `devDependencies`.

- [ ] **Step 2: Create `back-end/vitest.config.ts`**

```ts
import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
  },
})
```

- [ ] **Step 3: Add `test` script to `back-end/package.json`**

In the `"scripts"` block, add:

```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 4: Write a smoke test**

```ts
// back-end/src/smoke.test.ts
import { describe, expect, it } from 'vitest'

describe('vitest setup', () => {
  it('runs TypeScript tests with the ~ alias resolvable', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5: Run it**

Run: `cd back-end && npm test`
Expected: `1 passed`, exit code 0.

- [ ] **Step 6: Commit**

```bash
cd back-end
git add package.json package-lock.json vitest.config.ts src/smoke.test.ts
git commit -m "test: set up Vitest test framework"
```

---

### Task 2: Extend `ApiError` and `errorHandler` with a `code` field

Per spec, domain error codes (`CART_EMPTY`, `INSUFFICIENT_STOCK`, etc.) need a machine-readable field in the error response. Today `ApiError`/`errorHandler` only carry `statusCode`/`message`/`details`. This is a backward-compatible extension — existing call sites that don't pass `code` are unaffected.

**Files:**
- Modify: `back-end/src/core/http/ApiError.ts`
- Modify: `back-end/src/core/http/errorHandler.ts`
- Test: `back-end/src/core/http/ApiError.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// back-end/src/core/http/ApiError.test.ts
import { describe, expect, it } from 'vitest'
import { ApiError } from '~/core/http/ApiError'

describe('ApiError', () => {
  it('carries an optional code alongside statusCode/message/details', () => {
    const err = ApiError.Conflict('Insufficient stock', { variantId: 'v1' }, 'INSUFFICIENT_STOCK')
    expect(err.statusCode).toBe(409)
    expect(err.message).toBe('Insufficient stock')
    expect(err.details).toEqual({ variantId: 'v1' })
    expect(err.code).toBe('INSUFFICIENT_STOCK')
  })

  it('leaves code undefined when not provided (backward compatible)', () => {
    const err = ApiError.NotFound('Product not found')
    expect(err.code).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd back-end && npx vitest run src/core/http/ApiError.test.ts`
Expected: FAIL — `err.code` doesn't exist / TypeScript error on the 3rd argument.

- [ ] **Step 3: Update `ApiError.ts`**

Replace the full file content:

```ts
import { StatusCodes } from 'http-status-codes'

export class ApiError extends Error {
  statusCode: number
  details?: unknown
  code?: string

  constructor(statusCode: number, message: string, details?: unknown, code?: string) {
    // Message cần truyền vào super() để class Error gốc có thể khởi tạo đúng cách và sử dụng được đầy đủ Error.captureStackTrace
    super(message)
    this.statusCode = statusCode
    this.details = details
    this.code = code
    Object.setPrototypeOf(this, new.target.prototype) // Tránh lỗi prototype chain khi kế thừa từ Error (built-in object của JavaScript)
    Error.captureStackTrace(this, this.constructor) // Làm gọn gàng stack trace, dễ đọc, dễ debug
  }

  /** 400 Bad Request — Dữ liệu đầu vào không hợp lệ */
  static BadRequest(msg = 'Bad Request', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.BAD_REQUEST, msg, details, code)
  }
  // Sau này mở rộng thêm các static theo mã lỗi...
  static Unauthorized(msg = 'Unauthorized', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.UNAUTHORIZED, msg, details, code)
  }

  static Forbidden(msg = 'Forbidden', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.FORBIDDEN, msg, details, code)
  }

  static NotFound(msg = 'Not Found', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.NOT_FOUND, msg, details, code)
  }

  static Conflict(msg = 'Conflict', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.CONFLICT, msg, details, code)
  }

  static UnsupportedMediaType(msg = 'Unsupported Media Type', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.UNSUPPORTED_MEDIA_TYPE, msg, details, code)
  }

  static PayloadTooLarge(msg = 'Payload Too Large', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.REQUEST_TOO_LONG, msg, details, code)
  }

  static Internal(msg = 'Internal Server Error', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, msg, details, code)
  }

  static RedisError(msg = 'Redis Error', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, msg, details, code)
  }
}
```

- [ ] **Step 4: Update `errorHandler.ts`**

Change the `ApiError` branch (the rest of the file is unchanged):

```ts
  if (err instanceof ApiError) {
    console.log(err.message);
    return res
      .status(err.statusCode)
      .json({ message: err.message, code: err.code, details: err.details })
  }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd back-end && npx vitest run src/core/http/ApiError.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 6: Full typecheck (confirms no existing call site broke)**

Run: `cd back-end && npm run typecheck`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
cd back-end
git add src/core/http/ApiError.ts src/core/http/errorHandler.ts src/core/http/ApiError.test.ts
git commit -m "feat: add machine-readable code field to ApiError"
```

---

### Task 3: Add `SHIPPING_FLAT_FEE` config

Phase 1 has no live shipping-provider rate lookup (that's Phase 2); checkout uses a flat, config-driven fee.

**Files:**
- Modify: `back-end/src/config/env.ts`
- Modify: `back-end/.env`
- Modify: `back-end/.env.example`

- [ ] **Step 1: Add to the Zod schema in `env.ts`**

Add this line inside the `schema` object (near the other simple defaults, e.g. after `FRONTEND_BASE_URL`):

```ts
  // Phase 1 checkout: flat shipping fee in VND until Phase 2 shipping-provider integration.
  SHIPPING_FLAT_FEE: z.coerce.number().int().min(0).default(30000),
```

- [ ] **Step 2: Add to `.env` and `.env.example`**

Append to both files:

```
SHIPPING_FLAT_FEE=30000
```

- [ ] **Step 3: Verify**

Run: `cd back-end && npx tsx -e "import('./src/config/env.ts').then(m => console.log(m.env.SHIPPING_FLAT_FEE))"`
Expected: prints `30000`.

- [ ] **Step 4: Commit**

```bash
cd back-end
git add src/config/env.ts .env.example
git commit -m "feat: add SHIPPING_FLAT_FEE config for Phase 1 checkout"
```

(`.env` is not committed if gitignored — check `git status`; if it's tracked in this repo, include it too.)

---

### Task 4: Prisma schema changes

Adds/replaces: `Address` (VN 2-tier structure), `CartItem.selected`, `Order`/`OrderItem` + status enums, `Province`/`Ward`. Also adds the required back-relations (`User.orders`, `ProductVariant.orderItems`).

**Safety check first:** `Address` is currently unused by any backend code (confirmed via `grep -rn "Address" back-end/src` — no non-generated matches), so replacing its columns is safe. Still, verify no rows exist before dropping columns.

**Files:**
- Modify: `back-end/prisma/schema.prisma`

- [ ] **Step 1: Confirm Address has no rows**

Run: `cd back-end && npx tsx -e "import('./src/lib/prisma.ts').then(async ({prisma}) => { console.log(await prisma.address.count()); await prisma.\$disconnect() })"`
Expected: `0`. If not `0`, STOP and check with the user before proceeding — this migration drops `street`/`city` columns.

- [ ] **Step 2: Replace the `Address` model**

In `back-end/prisma/schema.prisma`, replace:

```prisma
model Address {
  id     String @id
  userId String
  street String
  city   String
  user   User   @relation(fields: [userId], references: [id])
}
```

with:

```prisma
model Address {
  id            String   @id
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  label         String?
  recipientName String
  phone         String
  provinceCode  String
  provinceName  String
  wardCode      String
  wardName      String
  detail        String
  isDefault     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
}
```

- [ ] **Step 3: Add `selected` to `CartItem`**

In the `CartItem` model, add a field after `name`:

```prisma
model CartItem {
  id        String         @id
  cartId    String
  cart      Cart           @relation(fields: [cartId], references: [id], onDelete: Cascade)
  variantId String
  variant   ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)
  quantity  Int
  price     Decimal        @db.Decimal(12, 2)
  name      String         @db.VarChar(255)
  selected  Boolean        @default(true)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  @@unique([cartId, variantId])
  @@index([variantId])
}
```

- [ ] **Step 4: Add `orders` back-relation to `User`**

In the `User` model, add a field (e.g. right after `productReviews`):

```prisma
  orders         Order[]
```

- [ ] **Step 5: Add `orderItems` back-relation to `ProductVariant`**

In the `ProductVariant` model, add a field (e.g. right after `cartItems`):

```prisma
  orderItems    OrderItem[]
```

- [ ] **Step 6: Append the new enums and models**

At the end of `schema.prisma` (after the `DiscountUserUse` model), append:

```prisma
enum OrderStatus {
  PENDING   @map("pending")
  CONFIRMED @map("confirmed")
  SHIPPED   @map("shipped")
  DELIVERED @map("delivered")
  CANCELLED @map("cancelled")
}

enum PaymentMethod {
  COD    @map("cod")
  ONLINE @map("online")
}

enum PaymentStatus {
  UNPAID   @map("unpaid")
  PAID     @map("paid")
  FAILED   @map("failed")
  REFUNDED @map("refunded")
}

enum ShipmentStatus {
  NOT_SHIPPED @map("not_shipped")
  SHIPPED     @map("shipped")
  DELIVERED   @map("delivered")
  RETURNED    @map("returned")
}

model Order {
  id             String         @id
  orderNumber    String         @unique
  userId         String
  user           User           @relation(fields: [userId], references: [id], onDelete: Restrict)
  items          OrderItem[]

  recipientName  String
  phone          String
  provinceName   String
  wardName       String
  addressDetail  String

  subtotal       Decimal        @db.Decimal(12, 2)
  shippingFee    Decimal        @db.Decimal(12, 2) @default(0)
  discountAmount Decimal        @db.Decimal(12, 2) @default(0)
  discountCode   String?
  total          Decimal        @db.Decimal(12, 2)

  orderStatus    OrderStatus    @default(PENDING)
  paymentMethod  PaymentMethod
  paymentStatus  PaymentStatus  @default(UNPAID)
  shipmentStatus ShipmentStatus @default(NOT_SHIPPED)

  note           String?        @db.VarChar(500)

  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([userId, createdAt])
  @@index([orderStatus])
}

model OrderItem {
  id           String         @id
  orderId      String
  order        Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variantId    String
  variant      ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)
  productName  String
  variantLabel String
  imageUrl     String?
  price        Decimal        @db.Decimal(12, 2)
  quantity     Int

  @@index([orderId])
  @@index([variantId])
}

model Province {
  code  String @id
  name  String
  wards Ward[]
}

model Ward {
  code         String   @id
  name         String
  provinceCode String
  province     Province @relation(fields: [provinceCode], references: [code])

  @@index([provinceCode])
}
```

Note: `Order.idempotencyKey` from the spec is intentionally **not** a DB column — Task 5 implements idempotency purely via Redis (order id keyed by user+key), so no schema field is needed for it. If Redis-based dedup ever proves insufficient, a DB column can be added later; starting without it avoids an unused always-null column today.

- [ ] **Step 7: Run the migration**

Run: `cd back-end && npx prisma migrate dev --name checkout_phase1_core`
Expected: prompts (if any) about non-nullable columns without defaults on `Address.recipientName` etc. — since the table is empty this is safe to accept. Ends with "Your database is now in sync with your schema."

- [ ] **Step 8: Regenerate Prisma client (migrate dev does this automatically, verify)**

Run: `cd back-end && npx prisma generate`
Expected: "Generated Prisma Client" with no errors.

- [ ] **Step 9: Typecheck**

Run: `cd back-end && npm run typecheck`
Expected: no errors (User/ProductVariant relation types now include `orders`/`orderItems`).

- [ ] **Step 10: Commit**

```bash
cd back-end
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: add Order/OrderItem, VN address fields, Province/Ward schema"
```

---

### Task 5: Idempotency helper

Wraps the existing soft-fail `redis` client (`back-end/src/lib/redis.ts`) for the checkout dedup pattern. Note: since `redis.get/set` already no-op silently when `REDIS_URL` is unset (existing project convention), idempotency degrades gracefully to "no dedup" in that case rather than failing — acceptable here since `REDIS_URL` is configured in this project's `.env`.

**Files:**
- Create: `back-end/src/core/idempotency/idempotency.ts`
- Test: `back-end/src/core/idempotency/idempotency.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// back-end/src/core/idempotency/idempotency.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

import { redis } from '~/lib/redis'
import { idempotency } from '~/core/idempotency/idempotency'

describe('idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('namespaces the key by user and reads via redis.get', async () => {
    vi.mocked(redis.get).mockResolvedValue('order-123')
    const result = await idempotency.getOrderId('user-1', 'key-abc')
    expect(redis.get).toHaveBeenCalledWith('checkout:idem:user-1:key-abc')
    expect(result).toBe('order-123')
  })

  it('saves the order id with a 24h TTL', async () => {
    await idempotency.saveOrderId('user-1', 'key-abc', 'order-123')
    expect(redis.set).toHaveBeenCalledWith(
      'checkout:idem:user-1:key-abc',
      'order-123',
      60 * 60 * 24,
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd back-end && npx vitest run src/core/idempotency/idempotency.test.ts`
Expected: FAIL — module `~/core/idempotency/idempotency` doesn't exist.

- [ ] **Step 3: Implement**

```ts
// back-end/src/core/idempotency/idempotency.ts
import { redis } from '~/lib/redis'

const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24

function buildKey(userId: string, key: string): string {
  return `checkout:idem:${userId}:${key}`
}

export const idempotency = {
  async getOrderId(userId: string, key: string): Promise<string | null> {
    return redis.get(buildKey(userId, key))
  },

  async saveOrderId(userId: string, key: string, orderId: string): Promise<void> {
    await redis.set(buildKey(userId, key), orderId, IDEMPOTENCY_TTL_SECONDS)
  },
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd back-end && npx vitest run src/core/idempotency/idempotency.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
cd back-end
git add src/core/idempotency
git commit -m "feat: add Redis-backed idempotency helper for checkout"
```

---

### Task 6: `requireIdempotencyKey` middleware

Checkout requires an `Idempotency-Key` header. `validateRequest` only validates body/query/params, so this is a small dedicated middleware.

**Files:**
- Create: `back-end/src/core/http/requireIdempotencyKey.ts`
- Test: `back-end/src/core/http/requireIdempotencyKey.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// back-end/src/core/http/requireIdempotencyKey.test.ts
import { describe, expect, it, vi } from 'vitest'
import { requireIdempotencyKey, type IdempotentRequest } from '~/core/http/requireIdempotencyKey'
import { ApiError } from '~/core/http/ApiError'

function makeReq(headerValue: string | undefined): IdempotentRequest {
  return {
    header: () => headerValue,
  } as unknown as IdempotentRequest
}

describe('requireIdempotencyKey', () => {
  it('throws ApiError.BadRequest when the header is missing', () => {
    const req = makeReq(undefined)
    expect(() => requireIdempotencyKey(req, {} as never, vi.fn())).toThrow(ApiError)
  })

  it('throws when the header is blank', () => {
    const req = makeReq('   ')
    expect(() => requireIdempotencyKey(req, {} as never, vi.fn())).toThrow(ApiError)
  })

  it('sets req.idempotencyKey and calls next when present', () => {
    const req = makeReq(' abc-123 ')
    const next = vi.fn()
    requireIdempotencyKey(req, {} as never, next)
    expect(req.idempotencyKey).toBe('abc-123')
    expect(next).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd back-end && npx vitest run src/core/http/requireIdempotencyKey.test.ts`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

```ts
// back-end/src/core/http/requireIdempotencyKey.ts
import { Request, Response, NextFunction } from 'express'

import { ApiError } from '~/core/http/ApiError'

export type IdempotentRequest = Request & { idempotencyKey?: string }

export function requireIdempotencyKey(
  req: IdempotentRequest,
  _res: Response,
  next: NextFunction,
) {
  const key = req.header('Idempotency-Key')
  if (!key || !key.trim()) {
    throw ApiError.BadRequest(
      'Missing required header: Idempotency-Key',
      undefined,
      'IDEMPOTENCY_KEY_REQUIRED',
    )
  }
  req.idempotencyKey = key.trim()
  next()
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd back-end && npx vitest run src/core/http/requireIdempotencyKey.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
cd back-end
git add src/core/http/requireIdempotencyKey.ts src/core/http/requireIdempotencyKey.test.ts
git commit -m "feat: add requireIdempotencyKey middleware"
```

---

### Task 7: VN location sample seed data + seed script

Per the scoped-down decision: a small **hand-written sample** dataset, not the real nationwide dataset (that's an explicit follow-up, not part of this plan). Codes are clearly-fake placeholders so nobody mistakes them for official GSO codes.

**Files:**
- Create: `back-end/prisma/data/vn-locations.sample.json`
- Create: `back-end/prisma/scripts/seedLocations.ts`
- Modify: `back-end/package.json`

- [ ] **Step 1: Create the sample dataset**

```json
[
  {
    "code": "HN",
    "name": "Thành phố Hà Nội",
    "wards": [
      { "code": "HN-BD", "name": "Phường Ba Đình" },
      { "code": "HN-HK", "name": "Phường Hoàn Kiếm" },
      { "code": "HN-CG", "name": "Phường Cầu Giấy" }
    ]
  },
  {
    "code": "HCM",
    "name": "Thành phố Hồ Chí Minh",
    "wards": [
      { "code": "HCM-BN", "name": "Phường Bến Nghé" },
      { "code": "HCM-BT", "name": "Phường Bến Thành" },
      { "code": "HCM-TD", "name": "Phường Thủ Đức" }
    ]
  },
  {
    "code": "DN",
    "name": "Thành phố Đà Nẵng",
    "wards": [
      { "code": "DN-HC", "name": "Phường Hải Châu" },
      { "code": "DN-TK", "name": "Phường Thanh Khê" }
    ]
  }
]
```

- [ ] **Step 2: Write the seed script**

```ts
// back-end/prisma/scripts/seedLocations.ts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { prisma } from '~/lib/prisma'

type WardData = { code: string; name: string }
type ProvinceData = { code: string; name: string; wards: WardData[] }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '../data/vn-locations.sample.json')

async function seedLocations() {
  const provinces: ProvinceData[] = JSON.parse(readFileSync(DATA_FILE, 'utf-8'))

  let provinceCount = 0
  let wardCount = 0

  for (const province of provinces) {
    await prisma.province.upsert({
      where: { code: province.code },
      update: { name: province.name },
      create: { code: province.code, name: province.name },
    })
    provinceCount++

    for (const ward of province.wards) {
      await prisma.ward.upsert({
        where: { code: ward.code },
        update: { name: ward.name, provinceCode: province.code },
        create: { code: ward.code, name: ward.name, provinceCode: province.code },
      })
      wardCount++
    }
  }

  console.log(`Seeded ${provinceCount} provinces, ${wardCount} wards (sample dataset).`)
}

seedLocations()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
```

- [ ] **Step 3: Add a script entry to `package.json`**

```json
    "db:seed-locations": "node --import tsx prisma/scripts/seedLocations.ts"
```

- [ ] **Step 4: Run it**

Run: `cd back-end && npm run db:seed-locations`
Expected: `Seeded 3 provinces, 8 wards (sample dataset).`

- [ ] **Step 5: Commit**

```bash
cd back-end
git add prisma/data/vn-locations.sample.json prisma/scripts/seedLocations.ts package.json
git commit -m "feat: add sample VN location seed data and seed script"
```

**Follow-up (explicitly out of scope for this plan):** replace the sample dataset with a real snapshot fetched from `provinces.open-api.vn` v2, saved as `back-end/prisma/data/vn-locations.json`, and re-run seeding — track this as a separate task when ready.

---

### Task 8: Locations module (public read API)

**Files:**
- Create: `back-end/src/modules/locations/location.types.ts`
- Create: `back-end/src/modules/locations/location.repo.ts`
- Create: `back-end/src/modules/locations/location.service.ts`
- Create: `back-end/src/modules/locations/location.mapper.ts`
- Create: `back-end/src/modules/locations/location.validation.ts`
- Create: `back-end/src/modules/locations/location.controller.ts`
- Create: `back-end/src/modules/locations/location.routes.ts`
- Modify: `back-end/src/routes/index.ts`
- Test: `back-end/src/modules/locations/location.service.test.ts`

- [ ] **Step 1: Types**

```ts
// back-end/src/modules/locations/location.types.ts
export type ProvinceDTO = {
  code: string
  name: string
}

export type WardDTO = {
  code: string
  name: string
  provinceCode: string
}
```

- [ ] **Step 2: Repo**

```ts
// back-end/src/modules/locations/location.repo.ts
import { prisma } from '~/lib/prisma'

export const LocationRepo = {
  async listProvinces() {
    return prisma.province.findMany({ orderBy: { name: 'asc' } })
  },

  async findProvince(code: string) {
    return prisma.province.findUnique({ where: { code } })
  },

  async listWardsByProvince(provinceCode: string) {
    return prisma.ward.findMany({ where: { provinceCode }, orderBy: { name: 'asc' } })
  },

  async findWard(code: string) {
    return prisma.ward.findUnique({ where: { code } })
  },
}
```

- [ ] **Step 3: Mapper**

```ts
// back-end/src/modules/locations/location.mapper.ts
import type { Province, Ward } from '~/generated/prisma/client'
import type { ProvinceDTO, WardDTO } from '~/modules/locations/location.types'

export function toProvinceDTO(province: Province): ProvinceDTO {
  return { code: province.code, name: province.name }
}

export function toWardDTO(ward: Ward): WardDTO {
  return { code: ward.code, name: ward.name, provinceCode: ward.provinceCode }
}
```

- [ ] **Step 4: Write the failing service test**

```ts
// back-end/src/modules/locations/location.service.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/modules/locations/location.repo', () => ({
  LocationRepo: {
    listProvinces: vi.fn(),
    findProvince: vi.fn(),
    listWardsByProvince: vi.fn(),
  },
}))

import { LocationRepo } from '~/modules/locations/location.repo'
import { LocationService } from '~/modules/locations/location.service'
import { ApiError } from '~/core/http/ApiError'

describe('LocationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists provinces mapped to DTOs', async () => {
    vi.mocked(LocationRepo.listProvinces).mockResolvedValue([
      { code: 'HN', name: 'Thành phố Hà Nội' },
    ] as never)

    const result = await LocationService.listProvinces()
    expect(result).toEqual([{ code: 'HN', name: 'Thành phố Hà Nội' }])
  })

  it('throws LOCATION_NOT_FOUND when listing wards for an unknown province', async () => {
    vi.mocked(LocationRepo.findProvince).mockResolvedValue(null)

    await expect(LocationService.listWards('XX')).rejects.toMatchObject({
      code: 'LOCATION_NOT_FOUND',
    })
  })

  it('lists wards for a known province', async () => {
    vi.mocked(LocationRepo.findProvince).mockResolvedValue({ code: 'HN', name: 'Hà Nội' } as never)
    vi.mocked(LocationRepo.listWardsByProvince).mockResolvedValue([
      { code: 'HN-BD', name: 'Phường Ba Đình', provinceCode: 'HN' },
    ] as never)

    const result = await LocationService.listWards('HN')
    expect(result).toEqual([{ code: 'HN-BD', name: 'Phường Ba Đình', provinceCode: 'HN' }])
  })
})
```

- [ ] **Step 5: Run test to verify it fails**

Run: `cd back-end && npx vitest run src/modules/locations/location.service.test.ts`
Expected: FAIL — `location.service` doesn't exist.

- [ ] **Step 6: Service**

```ts
// back-end/src/modules/locations/location.service.ts
import { ApiError } from '~/core/http/ApiError'
import { toProvinceDTO, toWardDTO } from '~/modules/locations/location.mapper'
import { LocationRepo } from '~/modules/locations/location.repo'

export const LocationService = {
  async listProvinces() {
    const provinces = await LocationRepo.listProvinces()
    return provinces.map(toProvinceDTO)
  },

  async listWards(provinceCode: string) {
    const province = await LocationRepo.findProvince(provinceCode)
    if (!province) {
      throw ApiError.NotFound('Province not found', undefined, 'LOCATION_NOT_FOUND')
    }
    const wards = await LocationRepo.listWardsByProvince(provinceCode)
    return wards.map(toWardDTO)
  },
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `cd back-end && npx vitest run src/modules/locations/location.service.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 8: Validation**

```ts
// back-end/src/modules/locations/location.validation.ts
import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

export const ListWardsSchema = z.object({
  body: ZodEmptyObject,
  query: ZodEmptyObject,
  params: z.object({
    code: z.string().trim().min(1),
  }),
})
```

- [ ] **Step 9: Controller**

```ts
// back-end/src/modules/locations/location.controller.ts
import { Request, Response } from 'express'

import { LocationService } from '~/modules/locations/location.service'

export const LocationController = {
  listProvinces: async (_req: Request, res: Response) => {
    const provinces = await LocationService.listProvinces()
    return res.json(provinces)
  },

  listWards: async (req: Request, res: Response) => {
    const wards = await LocationService.listWards(String(req.params.code))
    return res.json(wards)
  },
}
```

- [ ] **Step 10: Routes**

```ts
// back-end/src/modules/locations/location.routes.ts
import { Router } from 'express'

import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { LocationController } from '~/modules/locations/location.controller'
import { ListWardsSchema } from '~/modules/locations/location.validation'

const r = Router()

r.get('/provinces', asyncHandler(LocationController.listProvinces))
r.get(
  '/provinces/:code/wards',
  validateRequest(ListWardsSchema),
  asyncHandler(LocationController.listWards),
)

export default r
```

- [ ] **Step 11: Register in `routes/index.ts`**

Add the import and registration (public route, no auth needed):

```ts
import locationRoutes from '~/modules/locations/location.routes'
// ...
router.use('/locations', locationRoutes)
```

- [ ] **Step 12: Manual verification**

Run: `cd back-end && npm run dev` (in one terminal), then in another:
`curl http://localhost:3000/api/locations/provinces`
Expected: JSON array of 3 provinces (from Task 7's seed).
`curl http://localhost:3000/api/locations/provinces/HN/wards`
Expected: JSON array of 3 wards.

- [ ] **Step 13: Commit**

```bash
cd back-end
git add src/modules/locations src/routes/index.ts
git commit -m "feat: add public VN locations API (provinces/wards)"
```

---

### Task 9: Address module — types & validation

**Files:**
- Create: `back-end/src/modules/addresses/address.types.ts`
- Create: `back-end/src/modules/addresses/address.validation.ts`

- [ ] **Step 1: Types**

```ts
// back-end/src/modules/addresses/address.types.ts
export type AddressDTO = {
  id: string
  label?: string
  recipientName: string
  phone: string
  provinceCode: string
  provinceName: string
  wardCode: string
  wardName: string
  detail: string
  isDefault: boolean
}

export type UpsertAddressInput = {
  label?: string
  recipientName: string
  phone: string
  provinceCode: string
  wardCode: string
  detail: string
  isDefault?: boolean
}

export type PatchAddressInput = Partial<UpsertAddressInput>
```

- [ ] **Step 2: Validation**

VN phone regex covers current mobile prefixes (03/05/07/08/09) with `0` or `+84` prefix, per the spec.

```ts
// back-end/src/modules/addresses/address.validation.ts
import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

export const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/

const phoneSchema = z.string().trim().regex(VN_PHONE_REGEX, 'Invalid Vietnamese phone number')

const upsertBodySchema = z.object({
  label: z.string().trim().max(50).optional(),
  recipientName: z.string().trim().min(1).max(100),
  phone: phoneSchema,
  provinceCode: z.string().trim().min(1),
  wardCode: z.string().trim().min(1),
  detail: z.string().trim().min(1).max(255),
  isDefault: z.boolean().optional(),
})

export const CreateAddressSchema = z.object({
  body: upsertBodySchema,
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})

const patchBodySchema = upsertBodySchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field is required',
  })

export const PatchAddressSchema = z.object({
  body: patchBodySchema,
  query: ZodEmptyObject,
  params: z.object({ id: z.string().trim().min(1) }),
})

export const AddressIdParamSchema = z.object({
  body: ZodEmptyObject,
  query: ZodEmptyObject,
  params: z.object({ id: z.string().trim().min(1) }),
})
```

- [ ] **Step 3: Commit**

```bash
cd back-end
git add src/modules/addresses/address.types.ts src/modules/addresses/address.validation.ts
git commit -m "feat: add address module types and validation"
```

---

### Task 10: Address module — repo

Implements the single-default-address invariant at the service/repo layer (no DB-level uniqueness constraint is possible for "isDefault=true per user" in Prisma/MySQL).

**Files:**
- Create: `back-end/src/modules/addresses/address.repo.ts`

- [ ] **Step 1: Implement**

```ts
// back-end/src/modules/addresses/address.repo.ts
import { prisma } from '~/lib/prisma'
import { newId } from '~/utils/id'

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

export type AddressRow = {
  label?: string
  recipientName: string
  phone: string
  provinceCode: string
  provinceName: string
  wardCode: string
  wardName: string
  detail: string
}

async function clearDefaultForUser(tx: Tx, userId: string, exceptId?: string) {
  await tx.address.updateMany({
    where: { userId, ...(exceptId ? { id: { not: exceptId } } : {}) },
    data: { isDefault: false },
  })
}

export const AddressRepo = {
  async listByUser(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    })
  },

  async findByIdForUser(id: string, userId: string) {
    return prisma.address.findFirst({ where: { id, userId } })
  },

  async countByUser(userId: string) {
    return prisma.address.count({ where: { userId } })
  },

  async create(userId: string, row: AddressRow, makeDefault: boolean) {
    return prisma.$transaction(async (tx) => {
      if (makeDefault) await clearDefaultForUser(tx, userId)
      return tx.address.create({
        data: { id: newId(), userId, isDefault: makeDefault, ...row },
      })
    })
  },

  async update(id: string, userId: string, row: Partial<AddressRow>, makeDefault?: boolean) {
    return prisma.$transaction(async (tx) => {
      if (makeDefault) await clearDefaultForUser(tx, userId, id)
      return tx.address.update({
        where: { id },
        data: {
          ...row,
          ...(makeDefault !== undefined ? { isDefault: makeDefault } : {}),
        },
      })
    })
  },

  async setAsDefault(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      await clearDefaultForUser(tx, userId, id)
      return tx.address.update({ where: { id }, data: { isDefault: true } })
    })
  },

  /** Order stores an address snapshot, not a FK, so deleting an Address never affects past orders. */
  async delete(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const address = await tx.address.delete({ where: { id } })
      if (address.isDefault) {
        const next = await tx.address.findFirst({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
        })
        if (next) {
          await tx.address.update({ where: { id: next.id }, data: { isDefault: true } })
        }
      }
      return address
    })
  },
}
```

- [ ] **Step 2: Commit**

```bash
cd back-end
git add src/modules/addresses/address.repo.ts
git commit -m "feat: add address repo with single-default-address invariant"
```

---

### Task 11: Address module — service, mapper, unit tests

**Files:**
- Create: `back-end/src/modules/addresses/address.mapper.ts`
- Create: `back-end/src/modules/addresses/address.service.ts`
- Test: `back-end/src/modules/addresses/address.service.test.ts`

- [ ] **Step 1: Mapper**

```ts
// back-end/src/modules/addresses/address.mapper.ts
import type { Address } from '~/generated/prisma/client'
import type { AddressDTO } from '~/modules/addresses/address.types'

export function toAddressDTO(address: Address): AddressDTO {
  return {
    id: address.id,
    label: address.label ?? undefined,
    recipientName: address.recipientName,
    phone: address.phone,
    provinceCode: address.provinceCode,
    provinceName: address.provinceName,
    wardCode: address.wardCode,
    wardName: address.wardName,
    detail: address.detail,
    isDefault: address.isDefault,
  }
}
```

- [ ] **Step 2: Write the failing service test**

```ts
// back-end/src/modules/addresses/address.service.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/modules/addresses/address.repo', () => ({
  AddressRepo: {
    listByUser: vi.fn(),
    findByIdForUser: vi.fn(),
    countByUser: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    setAsDefault: vi.fn(),
    delete: vi.fn(),
  },
}))
vi.mock('~/modules/locations/location.repo', () => ({
  LocationRepo: {
    findProvince: vi.fn(),
    findWard: vi.fn(),
  },
}))

import { AddressRepo } from '~/modules/addresses/address.repo'
import { LocationRepo } from '~/modules/locations/location.repo'
import { AddressService } from '~/modules/addresses/address.service'

const baseAddress = {
  id: 'addr-1',
  label: null,
  recipientName: 'Nguyen Van A',
  phone: '0901234567',
  provinceCode: 'HN',
  provinceName: 'Thành phố Hà Nội',
  wardCode: 'HN-BD',
  wardName: 'Phường Ba Đình',
  detail: '1 Doi Can',
  isDefault: true,
}

describe('AddressService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects an invalid VN phone number on create', async () => {
    await expect(
      AddressService.create('user-1', {
        recipientName: 'A',
        phone: '123',
        provinceCode: 'HN',
        wardCode: 'HN-BD',
        detail: 'x',
      }),
    ).rejects.toThrow()
  })

  it('rejects when the ward does not belong to the given province', async () => {
    vi.mocked(LocationRepo.findWard).mockResolvedValue({
      code: 'HN-BD',
      name: 'Phường Ba Đình',
      provinceCode: 'HN',
    } as never)

    await expect(
      AddressService.create('user-1', {
        recipientName: 'A',
        phone: '0901234567',
        provinceCode: 'HCM', // mismatched
        wardCode: 'HN-BD',
        detail: 'x',
      }),
    ).rejects.toMatchObject({ code: 'LOCATION_NOT_FOUND' })
  })

  it('makes the first address for a user default automatically', async () => {
    vi.mocked(LocationRepo.findWard).mockResolvedValue({
      code: 'HN-BD',
      name: 'Phường Ba Đình',
      provinceCode: 'HN',
    } as never)
    vi.mocked(LocationRepo.findProvince).mockResolvedValue({
      code: 'HN',
      name: 'Thành phố Hà Nội',
    } as never)
    vi.mocked(AddressRepo.countByUser).mockResolvedValue(0)
    vi.mocked(AddressRepo.create).mockResolvedValue(baseAddress as never)

    await AddressService.create('user-1', {
      recipientName: 'Nguyen Van A',
      phone: '0901234567',
      provinceCode: 'HN',
      wardCode: 'HN-BD',
      detail: '1 Doi Can',
    })

    expect(AddressRepo.create).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ provinceName: 'Thành phố Hà Nội', wardName: 'Phường Ba Đình' }),
      true, // makeDefault
    )
  })

  it('throws ADDRESS_NOT_FOUND when updating an address that is not the user\'s', async () => {
    vi.mocked(AddressRepo.findByIdForUser).mockResolvedValue(null)

    await expect(
      AddressService.update('user-1', 'addr-999', { recipientName: 'X' }),
    ).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND' })
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd back-end && npx vitest run src/modules/addresses/address.service.test.ts`
Expected: FAIL — `address.service` doesn't exist.

- [ ] **Step 4: Implement the service**

```ts
// back-end/src/modules/addresses/address.service.ts
import { ApiError } from '~/core/http/ApiError'
import { toAddressDTO } from '~/modules/addresses/address.mapper'
import { AddressRepo } from '~/modules/addresses/address.repo'
import { VN_PHONE_REGEX } from '~/modules/addresses/address.validation'
import { LocationRepo } from '~/modules/locations/location.repo'
import type { PatchAddressInput, UpsertAddressInput } from '~/modules/addresses/address.types'

function assertValidPhone(phone: string) {
  if (!VN_PHONE_REGEX.test(phone)) {
    throw ApiError.BadRequest('Invalid Vietnamese phone number', undefined, 'VALIDATION_ERROR')
  }
}

async function resolveLocation(provinceCode: string, wardCode: string) {
  const ward = await LocationRepo.findWard(wardCode)
  if (!ward || ward.provinceCode !== provinceCode) {
    throw ApiError.NotFound('Province or ward not found', undefined, 'LOCATION_NOT_FOUND')
  }
  const province = await LocationRepo.findProvince(provinceCode)
  if (!province) {
    throw ApiError.NotFound('Province or ward not found', undefined, 'LOCATION_NOT_FOUND')
  }
  return { provinceName: province.name, wardName: ward.name }
}

export const AddressService = {
  async list(userId: string) {
    const addresses = await AddressRepo.listByUser(userId)
    return addresses.map(toAddressDTO)
  },

  async create(userId: string, input: UpsertAddressInput) {
    assertValidPhone(input.phone)
    const { provinceName, wardName } = await resolveLocation(input.provinceCode, input.wardCode)
    const existingCount = await AddressRepo.countByUser(userId)
    const makeDefault = existingCount === 0 || Boolean(input.isDefault)

    const address = await AddressRepo.create(
      userId,
      {
        label: input.label,
        recipientName: input.recipientName,
        phone: input.phone,
        provinceCode: input.provinceCode,
        provinceName,
        wardCode: input.wardCode,
        wardName,
        detail: input.detail,
      },
      makeDefault,
    )
    return toAddressDTO(address)
  },

  async update(userId: string, id: string, input: PatchAddressInput) {
    const existing = await AddressRepo.findByIdForUser(id, userId)
    if (!existing) {
      throw ApiError.NotFound('Address not found', undefined, 'ADDRESS_NOT_FOUND')
    }

    if (input.phone) assertValidPhone(input.phone)

    let locationFields: { provinceName: string; wardName: string } | undefined
    if (input.provinceCode || input.wardCode) {
      const provinceCode = input.provinceCode ?? existing.provinceCode
      const wardCode = input.wardCode ?? existing.wardCode
      locationFields = await resolveLocation(provinceCode, wardCode)
    }

    const address = await AddressRepo.update(
      id,
      userId,
      {
        ...(input.label !== undefined ? { label: input.label } : {}),
        ...(input.recipientName ? { recipientName: input.recipientName } : {}),
        ...(input.phone ? { phone: input.phone } : {}),
        ...(input.provinceCode ? { provinceCode: input.provinceCode } : {}),
        ...(input.wardCode ? { wardCode: input.wardCode } : {}),
        ...(input.detail ? { detail: input.detail } : {}),
        ...(locationFields ?? {}),
      },
      input.isDefault,
    )
    return toAddressDTO(address)
  },

  async setDefault(userId: string, id: string) {
    const existing = await AddressRepo.findByIdForUser(id, userId)
    if (!existing) {
      throw ApiError.NotFound('Address not found', undefined, 'ADDRESS_NOT_FOUND')
    }
    const address = await AddressRepo.setAsDefault(id, userId)
    return toAddressDTO(address)
  },

  async remove(userId: string, id: string) {
    const existing = await AddressRepo.findByIdForUser(id, userId)
    if (!existing) {
      throw ApiError.NotFound('Address not found', undefined, 'ADDRESS_NOT_FOUND')
    }
    await AddressRepo.delete(id, userId)
    return { id }
  },
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd back-end && npx vitest run src/modules/addresses/address.service.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
cd back-end
git add src/modules/addresses/address.mapper.ts src/modules/addresses/address.service.ts src/modules/addresses/address.service.test.ts
git commit -m "feat: add address service with phone/location validation and tests"
```

---

### Task 12: Address module — controller, routes, register

**Files:**
- Create: `back-end/src/modules/addresses/address.controller.ts`
- Create: `back-end/src/modules/addresses/address.routes.ts`
- Modify: `back-end/src/routes/index.ts`

- [ ] **Step 1: Controller**

```ts
// back-end/src/modules/addresses/address.controller.ts
import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import { AddressService } from '~/modules/addresses/address.service'
import type { PatchAddressInput, UpsertAddressInput } from '~/modules/addresses/address.types'

export const AddressController = {
  list: async (req: AuthRequest, res: Response) => {
    const addresses = await AddressService.list(req.user!.id)
    return res.json(addresses)
  },

  create: async (req: AuthRequest, res: Response) => {
    const address = await AddressService.create(req.user!.id, req.body as UpsertAddressInput)
    return res.status(201).json(address)
  },

  update: async (req: AuthRequest, res: Response) => {
    const address = await AddressService.update(
      req.user!.id,
      String(req.params.id),
      req.body as PatchAddressInput,
    )
    return res.json(address)
  },

  setDefault: async (req: AuthRequest, res: Response) => {
    const address = await AddressService.setDefault(req.user!.id, String(req.params.id))
    return res.json(address)
  },

  remove: async (req: AuthRequest, res: Response) => {
    const result = await AddressService.remove(req.user!.id, String(req.params.id))
    return res.json(result)
  },
}
```

- [ ] **Step 2: Routes**

```ts
// back-end/src/modules/addresses/address.routes.ts
import { Router } from 'express'

import { permissions } from '~/config/rbacConfig'
import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { AddressController } from '~/modules/addresses/address.controller'
import {
  AddressIdParamSchema,
  CreateAddressSchema,
  PatchAddressSchema,
} from '~/modules/addresses/address.validation'

const r = Router()

r.use(authenticate, requirePermission(permissions.VIEW_USER))

r.get('/', asyncHandler(AddressController.list))
r.post('/', validateRequest(CreateAddressSchema), asyncHandler(AddressController.create))
r.patch('/:id', validateRequest(PatchAddressSchema), asyncHandler(AddressController.update))
r.patch(
  '/:id/default',
  validateRequest(AddressIdParamSchema),
  asyncHandler(AddressController.setDefault),
)
r.delete('/:id', validateRequest(AddressIdParamSchema), asyncHandler(AddressController.remove))

export default r
```

- [ ] **Step 3: Register in `routes/index.ts`**

```ts
import addressRoutes from '~/modules/addresses/address.routes'
// ...
router.use('/addresses', addressRoutes)
```

- [ ] **Step 4: Manual verification**

Run: `cd back-end && npm run dev`, then (with a valid `ACCESS_TOKEN` from logging in as a seeded user):

```bash
curl -X POST http://localhost:3000/api/addresses \
  -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"recipientName":"Nguyen Van A","phone":"0901234567","provinceCode":"HN","wardCode":"HN-BD","detail":"1 Doi Can"}'
```

Expected: `201` with the created address, `isDefault: true` (first address).

- [ ] **Step 5: Commit**

```bash
cd back-end
git add src/modules/addresses/address.controller.ts src/modules/addresses/address.routes.ts src/routes/index.ts
git commit -m "feat: expose address CRUD API"
```

---

### Task 13: Cart module — types, validation, repo

**Files:**
- Create: `back-end/src/modules/cart/cart.types.ts`
- Create: `back-end/src/modules/cart/cart.validation.ts`
- Create: `back-end/src/modules/cart/cart.repo.ts`

- [ ] **Step 1: Types**

```ts
// back-end/src/modules/cart/cart.types.ts
export type AddCartItemInput = {
  variantId: string
  quantity: number
}

export type UpdateCartItemInput = {
  quantity?: number
  selected?: boolean
}

export type CartItemDTO = {
  id: string
  variantId: string
  productId: string
  productName: string
  variantLabel: string
  imageUrl?: string
  price: number
  quantity: number
  selected: boolean
  stockQuantity: number
}

export type CartDTO = {
  id: string | null
  items: CartItemDTO[]
  countProduct: number
}
```

- [ ] **Step 2: Validation**

```ts
// back-end/src/modules/cart/cart.validation.ts
import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

export const AddCartItemSchema = z.object({
  body: z.object({
    variantId: z.string().trim().min(1),
    quantity: z.coerce.number().int().min(1).max(100),
  }),
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})

export const UpdateCartItemSchema = z.object({
  body: z
    .object({
      quantity: z.coerce.number().int().min(1).max(100).optional(),
      selected: z.boolean().optional(),
    })
    .refine((b) => b.quantity !== undefined || b.selected !== undefined, {
      message: 'At least one field is required',
    }),
  query: ZodEmptyObject,
  params: z.object({ id: z.string().trim().min(1) }),
})

export const RemoveCartItemSchema = z.object({
  body: ZodEmptyObject,
  query: ZodEmptyObject,
  params: z.object({ id: z.string().trim().min(1) }),
})

export const SelectAllCartItemsSchema = z.object({
  body: z.object({ selected: z.boolean() }),
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})
```

- [ ] **Step 3: Repo**

```ts
// back-end/src/modules/cart/cart.repo.ts
import { ApiError } from '~/core/http/ApiError'
import { prisma } from '~/lib/prisma'
import { newId } from '~/utils/id'

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

const variantInclude = {
  product: { select: { id: true, name: true } },
  options: { include: { optionValue: { include: { option: true } } } },
} as const

const cartInclude = {
  items: {
    include: { variant: { include: variantInclude } },
    orderBy: { createdAt: 'asc' as const },
  },
} as const

export type CartWithItems = Awaited<ReturnType<typeof CartRepo.findActiveByUser>>

async function getOrCreateActiveCart(tx: Tx, userId: string) {
  const existing = await tx.cart.findFirst({ where: { userId, state: 'ACTIVE' } })
  if (existing) return existing
  return tx.cart.create({ data: { id: newId(), userId, state: 'ACTIVE' } })
}

async function syncCountProduct(tx: Tx, cartId: string) {
  const count = await tx.cartItem.count({ where: { cartId } })
  await tx.cart.update({ where: { id: cartId }, data: { countProduct: count } })
}

async function findCartWithItems(tx: Tx, cartId: string) {
  return tx.cart.findUniqueOrThrow({ where: { id: cartId }, include: cartInclude })
}

export const CartRepo = {
  async findActiveByUser(userId: string) {
    return prisma.cart.findFirst({ where: { userId, state: 'ACTIVE' }, include: cartInclude })
  },

  async addItem(userId: string, variantId: string, quantity: number) {
    return prisma.$transaction(async (tx) => {
      const cart = await getOrCreateActiveCart(tx, userId)
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
        include: { product: { select: { name: true } } },
      })
      if (!variant) throw ApiError.NotFound('Product variant not found')

      const existingItem = await tx.cartItem.findUnique({
        where: { cartId_variantId: { cartId: cart.id, variantId } },
      })

      if (existingItem) {
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        })
      } else {
        await tx.cartItem.create({
          data: {
            id: newId(),
            cartId: cart.id,
            variantId,
            quantity,
            price: variant.price,
            name: variant.product.name,
          },
        })
      }

      await syncCountProduct(tx, cart.id)
      return findCartWithItems(tx, cart.id)
    })
  },

  async updateItem(userId: string, itemId: string, data: { quantity?: number; selected?: boolean }) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findFirst({ where: { id: itemId, cart: { userId } } })
      if (!item) throw ApiError.NotFound('Cart item not found')

      await tx.cartItem.update({
        where: { id: itemId },
        data: {
          ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
          ...(data.selected !== undefined ? { selected: data.selected } : {}),
        },
      })

      return findCartWithItems(tx, item.cartId)
    })
  },

  async removeItem(userId: string, itemId: string) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findFirst({ where: { id: itemId, cart: { userId } } })
      if (!item) throw ApiError.NotFound('Cart item not found')

      await tx.cartItem.delete({ where: { id: itemId } })
      await syncCountProduct(tx, item.cartId)
      return findCartWithItems(tx, item.cartId)
    })
  },

  async selectAll(userId: string, selected: boolean) {
    return prisma.$transaction(async (tx) => {
      const cart = await getOrCreateActiveCart(tx, userId)
      await tx.cartItem.updateMany({ where: { cartId: cart.id }, data: { selected } })
      return findCartWithItems(tx, cart.id)
    })
  },
}
```

- [ ] **Step 4: Commit**

```bash
cd back-end
git add src/modules/cart/cart.types.ts src/modules/cart/cart.validation.ts src/modules/cart/cart.repo.ts
git commit -m "feat: add cart module types, validation, and repo"
```

---

### Task 14: Cart module — mapper, service, unit tests

**Files:**
- Create: `back-end/src/modules/cart/cart.mapper.ts`
- Create: `back-end/src/modules/cart/cart.service.ts`
- Test: `back-end/src/modules/cart/cart.service.test.ts`

- [ ] **Step 1: Mapper**

```ts
// back-end/src/modules/cart/cart.mapper.ts
import type { CartWithItems } from '~/modules/cart/cart.repo'
import type { CartDTO } from '~/modules/cart/cart.types'

function buildVariantLabel(options: Array<{ optionValue: { value: string } }>): string {
  return options.map((o) => o.optionValue.value).join(' / ') || 'Default'
}

export function toCartDTO(cart: NonNullable<CartWithItems>): CartDTO {
  return {
    id: cart.id,
    countProduct: cart.countProduct,
    items: cart.items.map((item) => ({
      id: item.id,
      variantId: item.variantId,
      productId: item.variant.product.id,
      productName: item.variant.product.name,
      variantLabel: buildVariantLabel(item.variant.options),
      imageUrl: item.variant.imgUrl ?? undefined,
      price: Number(item.variant.price), // always the live price, not the stored snapshot
      quantity: item.quantity,
      selected: item.selected,
      stockQuantity: item.variant.stockQuantity,
    })),
  }
}

export const EMPTY_CART_DTO: CartDTO = { id: null, items: [], countProduct: 0 }
```

- [ ] **Step 2: Write the failing service test**

```ts
// back-end/src/modules/cart/cart.service.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/modules/cart/cart.repo', () => ({
  CartRepo: {
    findActiveByUser: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    selectAll: vi.fn(),
  },
}))

import { CartRepo } from '~/modules/cart/cart.repo'
import { CartService } from '~/modules/cart/cart.service'

describe('CartService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns an empty cart DTO when the user has no active cart', async () => {
    vi.mocked(CartRepo.findActiveByUser).mockResolvedValue(null)
    const result = await CartService.getMyCart('user-1')
    expect(result).toEqual({ id: null, items: [], countProduct: 0 })
  })

  it('rejects adding an item with quantity < 1', async () => {
    await expect(
      CartService.addItem('user-1', { variantId: 'v1', quantity: 0 }),
    ).rejects.toThrow()
    expect(CartRepo.addItem).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd back-end && npx vitest run src/modules/cart/cart.service.test.ts`
Expected: FAIL — `cart.service` doesn't exist.

- [ ] **Step 4: Implement the service**

```ts
// back-end/src/modules/cart/cart.service.ts
import { ApiError } from '~/core/http/ApiError'
import { EMPTY_CART_DTO, toCartDTO } from '~/modules/cart/cart.mapper'
import { CartRepo } from '~/modules/cart/cart.repo'
import type { AddCartItemInput, UpdateCartItemInput } from '~/modules/cart/cart.types'

export const CartService = {
  async getMyCart(userId: string) {
    const cart = await CartRepo.findActiveByUser(userId)
    if (!cart) return EMPTY_CART_DTO
    return toCartDTO(cart)
  },

  async addItem(userId: string, input: AddCartItemInput) {
    if (input.quantity < 1) {
      throw ApiError.BadRequest('Quantity must be at least 1', undefined, 'VALIDATION_ERROR')
    }
    const cart = await CartRepo.addItem(userId, input.variantId, input.quantity)
    return toCartDTO(cart)
  },

  async updateItem(userId: string, itemId: string, input: UpdateCartItemInput) {
    if (input.quantity !== undefined && input.quantity < 1) {
      throw ApiError.BadRequest('Quantity must be at least 1', undefined, 'VALIDATION_ERROR')
    }
    const cart = await CartRepo.updateItem(userId, itemId, input)
    return toCartDTO(cart)
  },

  async removeItem(userId: string, itemId: string) {
    const cart = await CartRepo.removeItem(userId, itemId)
    return toCartDTO(cart)
  },

  async selectAll(userId: string, selected: boolean) {
    const cart = await CartRepo.selectAll(userId, selected)
    return toCartDTO(cart)
  },
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd back-end && npx vitest run src/modules/cart/cart.service.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 6: Commit**

```bash
cd back-end
git add src/modules/cart/cart.mapper.ts src/modules/cart/cart.service.ts src/modules/cart/cart.service.test.ts
git commit -m "feat: add cart mapper, service, and tests"
```

---

### Task 15: Cart module — controller, routes, register

**Files:**
- Create: `back-end/src/modules/cart/cart.controller.ts`
- Create: `back-end/src/modules/cart/cart.routes.ts`
- Modify: `back-end/src/routes/index.ts`

- [ ] **Step 1: Controller**

```ts
// back-end/src/modules/cart/cart.controller.ts
import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import { CartService } from '~/modules/cart/cart.service'
import type { AddCartItemInput, UpdateCartItemInput } from '~/modules/cart/cart.types'

export const CartController = {
  getMine: async (req: AuthRequest, res: Response) => {
    const cart = await CartService.getMyCart(req.user!.id)
    return res.json(cart)
  },

  addItem: async (req: AuthRequest, res: Response) => {
    const cart = await CartService.addItem(req.user!.id, req.body as AddCartItemInput)
    return res.status(201).json(cart)
  },

  updateItem: async (req: AuthRequest, res: Response) => {
    const cart = await CartService.updateItem(
      req.user!.id,
      String(req.params.id),
      req.body as UpdateCartItemInput,
    )
    return res.json(cart)
  },

  removeItem: async (req: AuthRequest, res: Response) => {
    const cart = await CartService.removeItem(req.user!.id, String(req.params.id))
    return res.json(cart)
  },

  selectAll: async (req: AuthRequest, res: Response) => {
    const cart = await CartService.selectAll(req.user!.id, Boolean(req.body.selected))
    return res.json(cart)
  },
}
```

- [ ] **Step 2: Routes**

```ts
// back-end/src/modules/cart/cart.routes.ts
import { Router } from 'express'

import { permissions } from '~/config/rbacConfig'
import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { CartController } from '~/modules/cart/cart.controller'
import {
  AddCartItemSchema,
  RemoveCartItemSchema,
  SelectAllCartItemsSchema,
  UpdateCartItemSchema,
} from '~/modules/cart/cart.validation'

const r = Router()

r.use(authenticate, requirePermission(permissions.VIEW_USER))

r.get('/', asyncHandler(CartController.getMine))
r.post('/items', validateRequest(AddCartItemSchema), asyncHandler(CartController.addItem))
r.patch('/items/:id', validateRequest(UpdateCartItemSchema), asyncHandler(CartController.updateItem))
r.delete('/items/:id', validateRequest(RemoveCartItemSchema), asyncHandler(CartController.removeItem))
r.patch('/select-all', validateRequest(SelectAllCartItemsSchema), asyncHandler(CartController.selectAll))

export default r
```

- [ ] **Step 3: Register in `routes/index.ts`**

```ts
import cartRoutes from '~/modules/cart/cart.routes'
// ...
router.use('/cart', cartRoutes)
```

- [ ] **Step 4: Manual verification**

```bash
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"variantId":"<a real ProductVariant id from your seeded data>","quantity":2}'
curl http://localhost:3000/api/cart -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected: cart with 1 item, `quantity: 2`, live price from the product.

- [ ] **Step 5: Commit**

```bash
cd back-end
git add src/modules/cart/cart.controller.ts src/modules/cart/cart.routes.ts src/routes/index.ts
git commit -m "feat: expose cart API"
```

---

### Task 16: Order module — types, validation

**Files:**
- Create: `back-end/src/modules/orders/order.types.ts`
- Create: `back-end/src/modules/orders/order.validation.ts`

- [ ] **Step 1: Types**

```ts
// back-end/src/modules/orders/order.types.ts
export type OrderItemDTO = {
  id: string
  variantId: string
  productName: string
  variantLabel: string
  imageUrl?: string
  price: number
  quantity: number
  total: number
}

export type OrderDTO = {
  id: string
  orderNumber: string
  userId: string
  recipientName: string
  phone: string
  provinceName: string
  wardName: string
  addressDetail: string
  items: OrderItemDTO[]
  subtotal: number
  shippingFee: number
  discountAmount: number
  discountCode?: string
  total: number
  orderStatus: string
  paymentMethod: string
  paymentStatus: string
  shipmentStatus: string
  note?: string
  createdAt: string
  updatedAt: string
}

export type OrderTrackingDTO = Pick<
  OrderDTO,
  | 'orderNumber'
  | 'orderStatus'
  | 'shipmentStatus'
  | 'createdAt'
  | 'items'
  | 'total'
  | 'provinceName'
  | 'wardName'
  | 'addressDetail'
>

export type OrderListFilters = {
  userId: string
  page: number
  limit: number
  orderStatus?: string
}

export type AdminOrderListFilters = {
  page: number
  limit: number
  orderStatus?: string
  paymentMethod?: string
  search?: string
}

export type PaginatedResult<T> = {
  items: T[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export type UpdateOrderStatusInput = {
  orderStatus?: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus?: 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED'
  shipmentStatus?: 'NOT_SHIPPED' | 'SHIPPED' | 'DELIVERED' | 'RETURNED'
}
```

- [ ] **Step 2: Validation**

```ts
// back-end/src/modules/orders/order.validation.ts
import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

const orderStatusEnum = z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
const paymentStatusEnum = z.enum(['UNPAID', 'PAID', 'FAILED', 'REFUNDED'])
const shipmentStatusEnum = z.enum(['NOT_SHIPPED', 'SHIPPED', 'DELIVERED', 'RETURNED'])

export const listMyOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  orderStatus: orderStatusEnum.optional(),
})

export const ListMyOrdersSchema = z.object({
  body: ZodEmptyObject,
  query: listMyOrdersQuerySchema,
  params: ZodEmptyObject,
})

export const GetOrderSchema = z.object({
  body: ZodEmptyObject,
  query: ZodEmptyObject,
  params: z.object({ id: z.string().trim().min(1) }),
})

export const trackOrderQuerySchema = z.object({
  orderNumber: z.string().trim().min(1),
  phone: z.string().trim().min(1),
})

export const TrackOrderSchema = z.object({
  body: ZodEmptyObject,
  query: trackOrderQuerySchema,
  params: ZodEmptyObject,
})

export const listAdminOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  orderStatus: orderStatusEnum.optional(),
  paymentMethod: z.enum(['COD', 'ONLINE']).optional(),
  search: z.string().trim().min(1).optional(),
})

export const ListAdminOrdersSchema = z.object({
  body: ZodEmptyObject,
  query: listAdminOrdersQuerySchema,
  params: ZodEmptyObject,
})

export const UpdateOrderStatusSchema = z.object({
  body: z
    .object({
      orderStatus: orderStatusEnum.optional(),
      paymentStatus: paymentStatusEnum.optional(),
      shipmentStatus: shipmentStatusEnum.optional(),
    })
    .refine((b) => b.orderStatus ?? b.paymentStatus ?? b.shipmentStatus, {
      message: 'At least one status field is required',
    }),
  query: ZodEmptyObject,
  params: z.object({ id: z.string().trim().min(1) }),
})
```

- [ ] **Step 3: Commit**

```bash
cd back-end
git add src/modules/orders/order.types.ts src/modules/orders/order.validation.ts
git commit -m "feat: add order module types and validation"
```

---

### Task 17: Order module — mapper, repo

**Files:**
- Create: `back-end/src/modules/orders/order.mapper.ts`
- Create: `back-end/src/modules/orders/order.repo.ts`

- [ ] **Step 1: Mapper**

```ts
// back-end/src/modules/orders/order.mapper.ts
import type { Order, OrderItem } from '~/generated/prisma/client'
import type { OrderDTO, OrderItemDTO, OrderTrackingDTO } from '~/modules/orders/order.types'

type OrderWithItems = Order & { items: OrderItem[] }

function toOrderItemDTO(item: OrderItem): OrderItemDTO {
  return {
    id: item.id,
    variantId: item.variantId,
    productName: item.productName,
    variantLabel: item.variantLabel,
    imageUrl: item.imageUrl ?? undefined,
    price: Number(item.price),
    quantity: item.quantity,
    total: Number(item.price) * item.quantity,
  }
}

export function toOrderDTO(order: OrderWithItems): OrderDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    recipientName: order.recipientName,
    phone: order.phone,
    provinceName: order.provinceName,
    wardName: order.wardName,
    addressDetail: order.addressDetail,
    items: order.items.map(toOrderItemDTO),
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    discountAmount: Number(order.discountAmount),
    discountCode: order.discountCode ?? undefined,
    total: Number(order.total),
    orderStatus: order.orderStatus,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    shipmentStatus: order.shipmentStatus,
    note: order.note ?? undefined,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}

/** Trimmed view for public order tracking — no unrelated PII beyond what's already order-facing. */
export function toOrderTrackingDTO(order: OrderWithItems): OrderTrackingDTO {
  const dto = toOrderDTO(order)
  return {
    orderNumber: dto.orderNumber,
    orderStatus: dto.orderStatus,
    shipmentStatus: dto.shipmentStatus,
    createdAt: dto.createdAt,
    items: dto.items,
    total: dto.total,
    provinceName: dto.provinceName,
    wardName: dto.wardName,
    addressDetail: dto.addressDetail,
  }
}
```

- [ ] **Step 2: Repo**

```ts
// back-end/src/modules/orders/order.repo.ts
import { prisma } from '~/lib/prisma'
import type {
  AdminOrderListFilters,
  OrderListFilters,
  UpdateOrderStatusInput,
} from '~/modules/orders/order.types'

const orderInclude = { items: true } as const

export const OrderRepo = {
  async findById(id: string) {
    return prisma.order.findUnique({ where: { id }, include: orderInclude })
  },

  async findByIdForUser(id: string, userId: string) {
    return prisma.order.findFirst({ where: { id, userId }, include: orderInclude })
  },

  async findByOrderNumberAndPhone(orderNumber: string, phone: string) {
    return prisma.order.findFirst({ where: { orderNumber, phone }, include: orderInclude })
  },

  async listForUser(filters: OrderListFilters) {
    const where = {
      userId: filters.userId,
      ...(filters.orderStatus ? { orderStatus: filters.orderStatus as never } : {}),
    }
    const skip = (filters.page - 1) * filters.limit
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: filters.limit,
      }),
      prisma.order.count({ where }),
    ])
    return { items, total }
  },

  async listForAdmin(filters: AdminOrderListFilters) {
    const where: Record<string, unknown> = {}
    if (filters.orderStatus) where.orderStatus = filters.orderStatus
    if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod
    if (filters.search?.trim()) {
      where.OR = [
        { orderNumber: { contains: filters.search.trim() } },
        { recipientName: { contains: filters.search.trim() } },
      ]
    }
    const skip = (filters.page - 1) * filters.limit
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: filters.limit,
      }),
      prisma.order.count({ where }),
    ])
    return { items, total }
  },

  /** Cancel: restock items, reverse discount usage counters, mark CANCELLED — one transaction. */
  async cancel(orderId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: { orderStatus: 'CANCELLED' },
        include: orderInclude,
      })

      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { increment: item.quantity } },
        })
      }

      if (order.discountCode) {
        const discount = await tx.discount.findUnique({ where: { code: order.discountCode } })
        if (discount) {
          await tx.discount.update({
            where: { id: discount.id },
            data: { usesCount: { decrement: 1 } },
          })
          await tx.discountUserUse.updateMany({
            where: { discountId: discount.id, userId: order.userId },
            data: { usesCount: { decrement: 1 } },
          })
        }
      }

      return order
    })
  },

  async updateStatus(id: string, input: UpdateOrderStatusInput) {
    return prisma.order.update({
      where: { id },
      data: {
        ...(input.orderStatus ? { orderStatus: input.orderStatus } : {}),
        ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
        ...(input.shipmentStatus ? { shipmentStatus: input.shipmentStatus } : {}),
      },
      include: orderInclude,
    })
  },
}
```

- [ ] **Step 3: Commit**

```bash
cd back-end
git add src/modules/orders/order.mapper.ts src/modules/orders/order.repo.ts
git commit -m "feat: add order mapper and repo (list/cancel/admin-update)"
```

---

### Task 18: Order module — service, unit tests

**Files:**
- Create: `back-end/src/modules/orders/order.service.ts`
- Test: `back-end/src/modules/orders/order.service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// back-end/src/modules/orders/order.service.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/modules/orders/order.repo', () => ({
  OrderRepo: {
    findById: vi.fn(),
    findByIdForUser: vi.fn(),
    findByOrderNumberAndPhone: vi.fn(),
    listForUser: vi.fn(),
    listForAdmin: vi.fn(),
    cancel: vi.fn(),
    updateStatus: vi.fn(),
  },
}))

import { OrderRepo } from '~/modules/orders/order.repo'
import { OrderService } from '~/modules/orders/order.service'

const baseOrder = {
  id: 'order-1',
  orderNumber: 'ORD20260904000001',
  userId: 'user-1',
  recipientName: 'A',
  phone: '0901234567',
  provinceName: 'Hà Nội',
  wardName: 'Ba Đình',
  addressDetail: '1 x',
  items: [],
  subtotal: 100000,
  shippingFee: 30000,
  discountAmount: 0,
  discountCode: null,
  total: 130000,
  orderStatus: 'PENDING',
  paymentMethod: 'COD',
  paymentStatus: 'UNPAID',
  shipmentStatus: 'NOT_SHIPPED',
  note: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('OrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows cancelling a PENDING order and restocks items', async () => {
    vi.mocked(OrderRepo.findByIdForUser).mockResolvedValue(baseOrder as never)
    vi.mocked(OrderRepo.cancel).mockResolvedValue({ ...baseOrder, orderStatus: 'CANCELLED' } as never)

    const result = await OrderService.cancelForUser('order-1', 'user-1')
    expect(OrderRepo.cancel).toHaveBeenCalledWith('order-1')
    expect(result.orderStatus).toBe('CANCELLED')
  })

  it('rejects cancelling a SHIPPED order', async () => {
    vi.mocked(OrderRepo.findByIdForUser).mockResolvedValue({
      ...baseOrder,
      orderStatus: 'SHIPPED',
    } as never)

    await expect(OrderService.cancelForUser('order-1', 'user-1')).rejects.toMatchObject({
      code: 'ORDER_NOT_CANCELLABLE',
    })
    expect(OrderRepo.cancel).not.toHaveBeenCalled()
  })

  it('rejects cancelling an order that does not belong to the user', async () => {
    vi.mocked(OrderRepo.findByIdForUser).mockResolvedValue(null)

    await expect(OrderService.cancelForUser('order-1', 'user-2')).rejects.toMatchObject({
      code: 'ORDER_NOT_FOUND',
    })
  })

  it('rejects an invalid admin status transition', async () => {
    vi.mocked(OrderRepo.findById).mockResolvedValue({ ...baseOrder, orderStatus: 'CANCELLED' } as never)

    await expect(
      OrderService.updateStatusForAdmin('order-1', { orderStatus: 'CONFIRMED' }),
    ).rejects.toMatchObject({ code: 'INVALID_ORDER_TRANSITION' })
  })

  it('allows a valid admin status transition', async () => {
    vi.mocked(OrderRepo.findById).mockResolvedValue(baseOrder as never)
    vi.mocked(OrderRepo.updateStatus).mockResolvedValue({ ...baseOrder, orderStatus: 'CONFIRMED' } as never)

    const result = await OrderService.updateStatusForAdmin('order-1', { orderStatus: 'CONFIRMED' })
    expect(result.orderStatus).toBe('CONFIRMED')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd back-end && npx vitest run src/modules/orders/order.service.test.ts`
Expected: FAIL — `order.service` doesn't exist.

- [ ] **Step 3: Implement**

```ts
// back-end/src/modules/orders/order.service.ts
import { ApiError } from '~/core/http/ApiError'
import { toOrderDTO, toOrderTrackingDTO } from '~/modules/orders/order.mapper'
import { OrderRepo } from '~/modules/orders/order.repo'
import type {
  AdminOrderListFilters,
  OrderListFilters,
  PaginatedResult,
  UpdateOrderStatusInput,
} from '~/modules/orders/order.types'

const CANCELLABLE_STATUSES = new Set(['PENDING', 'CONFIRMED'])

// Allowed forward transitions for admin manual status updates. CANCELLED/DELIVERED are terminal.
const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

function paginationOf(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: total === 0 ? 0 : Math.ceil(total / limit) }
}

export const OrderService = {
  async listForUser(filters: OrderListFilters): Promise<PaginatedResult<ReturnType<typeof toOrderDTO>>> {
    const { items, total } = await OrderRepo.listForUser(filters)
    return { items: items.map(toOrderDTO), pagination: paginationOf(filters.page, filters.limit, total) }
  },

  async getForUser(id: string, userId: string) {
    const order = await OrderRepo.findByIdForUser(id, userId)
    if (!order) throw ApiError.NotFound('Order not found', undefined, 'ORDER_NOT_FOUND')
    return toOrderDTO(order)
  },

  async cancelForUser(id: string, userId: string) {
    const order = await OrderRepo.findByIdForUser(id, userId)
    if (!order) throw ApiError.NotFound('Order not found', undefined, 'ORDER_NOT_FOUND')
    if (!CANCELLABLE_STATUSES.has(order.orderStatus)) {
      throw ApiError.Conflict('Order can no longer be cancelled', undefined, 'ORDER_NOT_CANCELLABLE')
    }
    const cancelled = await OrderRepo.cancel(id)
    return toOrderDTO(cancelled)
  },

  async track(orderNumber: string, phone: string) {
    const order = await OrderRepo.findByOrderNumberAndPhone(orderNumber, phone)
    if (!order) throw ApiError.NotFound('Order not found', undefined, 'ORDER_NOT_FOUND')
    return toOrderTrackingDTO(order)
  },

  async listForAdmin(filters: AdminOrderListFilters) {
    const { items, total } = await OrderRepo.listForAdmin(filters)
    return { items: items.map(toOrderDTO), pagination: paginationOf(filters.page, filters.limit, total) }
  },

  async getForAdmin(id: string) {
    const order = await OrderRepo.findById(id)
    if (!order) throw ApiError.NotFound('Order not found', undefined, 'ORDER_NOT_FOUND')
    return toOrderDTO(order)
  },

  async updateStatusForAdmin(id: string, input: UpdateOrderStatusInput) {
    const existing = await OrderRepo.findById(id)
    if (!existing) throw ApiError.NotFound('Order not found', undefined, 'ORDER_NOT_FOUND')

    if (input.orderStatus && input.orderStatus !== existing.orderStatus) {
      const allowed = ORDER_STATUS_TRANSITIONS[existing.orderStatus] ?? []
      if (!allowed.includes(input.orderStatus)) {
        throw ApiError.BadRequest(
          `Cannot transition order from ${existing.orderStatus} to ${input.orderStatus}`,
          undefined,
          'INVALID_ORDER_TRANSITION',
        )
      }
    }

    const updated = await OrderRepo.updateStatus(id, input)
    return toOrderDTO(updated)
  },
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd back-end && npx vitest run src/modules/orders/order.service.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
cd back-end
git add src/modules/orders/order.service.ts src/modules/orders/order.service.test.ts
git commit -m "feat: add order service with cancel and admin status transition rules"
```

---

### Task 19: Order module — controller, routes (user + public + admin), register

**Files:**
- Create: `back-end/src/modules/orders/order.controller.ts`
- Create: `back-end/src/modules/orders/order.routes.ts`
- Create: `back-end/src/modules/orders/order.admin.routes.ts`
- Modify: `back-end/src/routes/index.ts`

- [ ] **Step 1: Controller**

```ts
// back-end/src/modules/orders/order.controller.ts
import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import { OrderService } from '~/modules/orders/order.service'
import {
  listAdminOrdersQuerySchema,
  listMyOrdersQuerySchema,
  trackOrderQuerySchema,
} from '~/modules/orders/order.validation'
import type { UpdateOrderStatusInput } from '~/modules/orders/order.types'

export const OrderController = {
  listMine: async (req: AuthRequest, res: Response) => {
    const query = listMyOrdersQuerySchema.parse(req.query)
    const result = await OrderService.listForUser({ userId: req.user!.id, ...query })
    return res.json(result)
  },

  getMine: async (req: AuthRequest, res: Response) => {
    const order = await OrderService.getForUser(String(req.params.id), req.user!.id)
    return res.json(order)
  },

  cancelMine: async (req: AuthRequest, res: Response) => {
    const order = await OrderService.cancelForUser(String(req.params.id), req.user!.id)
    return res.json(order)
  },

  track: async (req: AuthRequest, res: Response) => {
    const query = trackOrderQuerySchema.parse(req.query)
    const order = await OrderService.track(query.orderNumber, query.phone)
    return res.json(order)
  },

  listAdmin: async (req: AuthRequest, res: Response) => {
    const query = listAdminOrdersQuerySchema.parse(req.query)
    const result = await OrderService.listForAdmin(query)
    return res.json(result)
  },

  getAdmin: async (req: AuthRequest, res: Response) => {
    const order = await OrderService.getForAdmin(String(req.params.id))
    return res.json(order)
  },

  updateStatusAdmin: async (req: AuthRequest, res: Response) => {
    const order = await OrderService.updateStatusForAdmin(
      String(req.params.id),
      req.body as UpdateOrderStatusInput,
    )
    return res.json(order)
  },
}
```

- [ ] **Step 2: User + public routes**

```ts
// back-end/src/modules/orders/order.routes.ts
import { Router } from 'express'

import { permissions } from '~/config/rbacConfig'
import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { OrderController } from '~/modules/orders/order.controller'
import { GetOrderSchema, ListMyOrdersSchema, TrackOrderSchema } from '~/modules/orders/order.validation'

const r = Router()

// Public — no auth. Must come before the authenticate() gate below.
r.get('/track', validateRequest(TrackOrderSchema), asyncHandler(OrderController.track))

r.use(authenticate, requirePermission(permissions.VIEW_USER))

r.get('/', validateRequest(ListMyOrdersSchema), asyncHandler(OrderController.listMine))
r.get('/:id', validateRequest(GetOrderSchema), asyncHandler(OrderController.getMine))
r.post('/:id/cancel', validateRequest(GetOrderSchema), asyncHandler(OrderController.cancelMine))

export default r
```

- [ ] **Step 3: Admin routes**

```ts
// back-end/src/modules/orders/order.admin.routes.ts
import { Router } from 'express'

import { permissions } from '~/config/rbacConfig'
import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { OrderController } from '~/modules/orders/order.controller'
import {
  GetOrderSchema,
  ListAdminOrdersSchema,
  UpdateOrderStatusSchema,
} from '~/modules/orders/order.validation'

const r = Router()

r.use(authenticate, requirePermission(permissions.VIEW_ADMIN))

r.get('/', validateRequest(ListAdminOrdersSchema), asyncHandler(OrderController.listAdmin))
r.get('/:id', validateRequest(GetOrderSchema), asyncHandler(OrderController.getAdmin))
r.patch(
  '/:id/status',
  validateRequest(UpdateOrderStatusSchema),
  asyncHandler(OrderController.updateStatusAdmin),
)

export default r
```

- [ ] **Step 4: Register both in `routes/index.ts`**

```ts
import orderRoutes from '~/modules/orders/order.routes'
import orderAdminRoutes from '~/modules/orders/order.admin.routes'
// ...
router.use('/orders', orderRoutes)
router.use('/admin/orders', orderAdminRoutes)
```

- [ ] **Step 5: Commit**

```bash
cd back-end
git add src/modules/orders/order.controller.ts src/modules/orders/order.routes.ts src/modules/orders/order.admin.routes.ts src/routes/index.ts
git commit -m "feat: expose order API (user, public tracking, admin)"
```

(Manual end-to-end verification of these endpoints happens in Task 23, after checkout can actually create orders.)

---

### Task 20: Checkout module — types, validation

**Files:**
- Create: `back-end/src/modules/checkout/checkout.types.ts`
- Create: `back-end/src/modules/checkout/checkout.validation.ts`

- [ ] **Step 1: Types**

```ts
// back-end/src/modules/checkout/checkout.types.ts
export type CheckoutItemInput = {
  variantId: string
  quantity: number
}

export type CheckoutInput = {
  addressId: string
  paymentMethod: 'cod' | 'online'
  discountCode?: string
  buyNowItem?: CheckoutItemInput
}
```

- [ ] **Step 2: Validation**

```ts
// back-end/src/modules/checkout/checkout.validation.ts
import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

const buyNowItemSchema = z.object({
  variantId: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1).max(100),
})

const checkoutBodySchema = z.object({
  addressId: z.string().trim().min(1),
  paymentMethod: z.enum(['cod', 'online']),
  discountCode: z.string().trim().min(1).optional(),
  buyNowItem: buyNowItemSchema.optional(),
})

export const CheckoutSchema = z.object({
  body: checkoutBodySchema,
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})
```

- [ ] **Step 3: Commit**

```bash
cd back-end
git add src/modules/checkout/checkout.types.ts src/modules/checkout/checkout.validation.ts
git commit -m "feat: add checkout module types and validation"
```

---

### Task 21: Checkout module — repo (the atomic checkout transaction)

This is the core of the feature: one Prisma transaction that resolves line items (cart-based or buy-now), re-validates stock and discount live, computes totals, creates the order, decrements stock, updates discount counters, and cleans up the cart. Mirrors the existing `ProductRepo.create`-style pattern of a repo function owning its own `prisma.$transaction`.

**Files:**
- Create: `back-end/src/modules/checkout/checkout.repo.ts`

- [ ] **Step 1: Implement**

```ts
// back-end/src/modules/checkout/checkout.repo.ts
import { Prisma } from '~/generated/prisma/client'
import { env } from '~/config/env'
import { ApiError } from '~/core/http/ApiError'
import { prisma } from '~/lib/prisma'
import { newId } from '~/utils/id'
import { generateOrderNumber } from '~/utils/orderNumber'
import type { CheckoutInput } from '~/modules/checkout/checkout.types'

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

const variantInclude = {
  product: { select: { id: true, name: true } },
  options: { include: { optionValue: { include: { option: true } } } },
} as const

type VariantWithRelations = Awaited<ReturnType<Tx['productVariant']['findUnique']>> & {
  product: { id: string; name: string }
  options: Array<{ optionValue: { value: string } }>
}

function buildVariantLabel(variant: VariantWithRelations): string {
  return variant.options.map((o) => o.optionValue.value).join(' / ') || 'Default'
}

async function resolveLineItems(tx: Tx, userId: string, input: CheckoutInput) {
  if (input.buyNowItem) {
    const variant = await tx.productVariant.findUnique({
      where: { id: input.buyNowItem.variantId },
      include: variantInclude,
    })
    if (!variant) throw ApiError.NotFound('Product variant not found')
    return {
      lines: [{ variant: variant as VariantWithRelations, quantity: input.buyNowItem.quantity }],
      cartId: null as string | null,
      cartItemIds: [] as string[],
    }
  }

  const cart = await tx.cart.findFirst({
    where: { userId, state: 'ACTIVE' },
    include: { items: { where: { selected: true }, include: { variant: { include: variantInclude } } } },
  })

  const selectedItems = cart?.items ?? []
  if (selectedItems.length === 0) {
    throw ApiError.BadRequest('No items selected for checkout', undefined, 'CART_EMPTY')
  }

  return {
    lines: selectedItems.map((item) => ({
      variant: item.variant as VariantWithRelations,
      quantity: item.quantity,
    })),
    cartId: cart!.id,
    cartItemIds: selectedItems.map((item) => item.id),
  }
}

async function validateAndPriceStock(
  tx: Tx,
  lines: Array<{ variant: VariantWithRelations; quantity: number }>,
) {
  let subtotal = new Prisma.Decimal(0)

  for (const line of lines) {
    // Re-read live inside the transaction so two concurrent checkouts can't both succeed on the last unit.
    const fresh = await tx.productVariant.findUniqueOrThrow({ where: { id: line.variant.id } })
    if (fresh.stockQuantity < line.quantity) {
      throw ApiError.Conflict(
        `Insufficient stock for variant ${fresh.id}`,
        { variantId: fresh.id },
        'INSUFFICIENT_STOCK',
      )
    }
    subtotal = subtotal.add(fresh.price.mul(line.quantity))
  }

  return subtotal
}

async function validateDiscount(
  tx: Tx,
  userId: string,
  code: string | undefined,
  subtotal: Prisma.Decimal,
  productIds: string[],
) {
  if (!code) return { discount: null, discountAmount: new Prisma.Decimal(0) }

  const discount = await tx.discount.findUnique({ where: { code }, include: { products: true } })
  if (!discount || !discount.isActive) {
    throw ApiError.BadRequest('Discount code is invalid', undefined, 'DISCOUNT_INVALID')
  }

  const now = new Date()
  if (now < discount.startDate || now > discount.endDate) {
    throw ApiError.BadRequest('Discount code has expired', undefined, 'DISCOUNT_EXPIRED')
  }

  if (subtotal.lt(discount.minOrderValue)) {
    throw ApiError.BadRequest(
      'Order does not meet the minimum value for this discount',
      undefined,
      'DISCOUNT_INVALID',
    )
  }

  // appliesTo=SPECIFIC scopes the discount to certain products via DiscountProduct — enforce it,
  // otherwise a "specific products only" discount would incorrectly apply to any order.
  if (discount.appliesTo === 'SPECIFIC') {
    const eligible = discount.products.some((p) => productIds.includes(p.productId))
    if (!eligible) {
      throw ApiError.BadRequest(
        'Discount code does not apply to items in this order',
        undefined,
        'DISCOUNT_INVALID',
      )
    }
  }

  if (discount.usesCount >= discount.maxUses) {
    throw ApiError.Conflict('Discount code has reached its usage limit', undefined, 'DISCOUNT_LIMIT_REACHED')
  }

  const userUse = await tx.discountUserUse.findUnique({
    where: { discountId_userId: { discountId: discount.id, userId } },
  })
  if ((userUse?.usesCount ?? 0) >= discount.maxUsesPerUser) {
    throw ApiError.Conflict(
      'You have reached the usage limit for this discount',
      undefined,
      'DISCOUNT_LIMIT_REACHED',
    )
  }

  const rawAmount =
    discount.type === 'PERCENTAGE' ? subtotal.mul(discount.value).div(100) : discount.value
  const discountAmount = rawAmount.gt(discount.maxValue) ? discount.maxValue : rawAmount

  return { discount, discountAmount }
}

export const CheckoutRepo = {
  async checkout(userId: string, input: CheckoutInput) {
    return prisma.$transaction(async (tx) => {
      const { lines, cartId, cartItemIds } = await resolveLineItems(tx, userId, input)

      const address = await tx.address.findFirst({ where: { id: input.addressId, userId } })
      if (!address) {
        throw ApiError.NotFound('Address not found', undefined, 'ADDRESS_NOT_FOUND')
      }

      const subtotal = await validateAndPriceStock(tx, lines)
      const productIds = lines.map((l) => l.variant.product.id)
      const { discount, discountAmount } = await validateDiscount(
        tx,
        userId,
        input.discountCode,
        subtotal,
        productIds,
      )

      const shippingFee = new Prisma.Decimal(env.SHIPPING_FLAT_FEE)
      const total = subtotal.sub(discountAmount).add(shippingFee)

      let order: Awaited<ReturnType<Tx['order']['create']>> | undefined
      for (let attempt = 0; attempt < 3 && !order; attempt++) {
        try {
          order = await tx.order.create({
            data: {
              id: newId(),
              orderNumber: generateOrderNumber(),
              userId,
              recipientName: address.recipientName,
              phone: address.phone,
              provinceName: address.provinceName,
              wardName: address.wardName,
              addressDetail: address.detail,
              subtotal,
              shippingFee,
              discountAmount,
              discountCode: discount?.code,
              total,
              paymentMethod: 'COD',
              items: {
                create: lines.map((line) => ({
                  id: newId(),
                  variantId: line.variant.id,
                  productName: line.variant.product.name,
                  variantLabel: buildVariantLabel(line.variant),
                  imageUrl: line.variant.imgUrl ?? undefined,
                  price: line.variant.price,
                  quantity: line.quantity,
                })),
              },
            },
            include: { items: true },
          })
        } catch (error) {
          const isCollision =
            error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
          if (!isCollision) throw error
          // orderNumber collision — loop retries with a freshly generated number.
        }
      }
      if (!order) throw ApiError.Internal('Failed to generate a unique order number')

      for (const line of lines) {
        await tx.productVariant.update({
          where: { id: line.variant.id },
          data: { stockQuantity: { decrement: line.quantity } },
        })
      }

      if (discount) {
        await tx.discount.update({ where: { id: discount.id }, data: { usesCount: { increment: 1 } } })
        await tx.discountUserUse.upsert({
          where: { discountId_userId: { discountId: discount.id, userId } },
          create: { discountId: discount.id, userId, usesCount: 1 },
          update: { usesCount: { increment: 1 } },
        })
      }

      if (cartId && cartItemIds.length > 0) {
        await tx.cartItem.deleteMany({ where: { id: { in: cartItemIds } } })
        const remaining = await tx.cartItem.count({ where: { cartId } })
        await tx.cart.update({ where: { id: cartId }, data: { countProduct: remaining } })
      }

      return order
    })
  },
}
```

- [ ] **Step 2: Add the `generateOrderNumber` util**

```ts
// back-end/src/utils/orderNumber.ts
/** Human-readable order code, e.g. ORD20260904483920. Uniqueness enforced by Order.orderNumber @unique + retry. */
export function generateOrderNumber(): string {
  const now = new Date()
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}`
  const randomPart = Math.floor(100000 + Math.random() * 900000)
  return `ORD${datePart}${randomPart}`
}
```

- [ ] **Step 3: Typecheck**

Run: `cd back-end && npm run typecheck`
Expected: no errors. (If Prisma's generated transaction-callback types don't line up exactly with the `Tx['order']['create']` inference used above, simplify by typing `order` as `Awaited<ReturnType<typeof tx.order.create>> | undefined` inline instead — adjust to whatever the generated client actually infers.)

- [ ] **Step 4: Commit**

```bash
cd back-end
git add src/modules/checkout/checkout.repo.ts src/utils/orderNumber.ts
git commit -m "feat: implement atomic checkout transaction (repo layer)"
```

---

### Task 22: Checkout module — service, unit tests

Orchestrates idempotency (Redis) around the repo transaction and rejects non-COD payment methods.

**Files:**
- Create: `back-end/src/modules/checkout/checkout.service.ts`
- Test: `back-end/src/modules/checkout/checkout.service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// back-end/src/modules/checkout/checkout.service.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/modules/checkout/checkout.repo', () => ({
  CheckoutRepo: { checkout: vi.fn() },
}))
vi.mock('~/modules/orders/order.repo', () => ({
  OrderRepo: { findById: vi.fn() },
}))
vi.mock('~/core/idempotency/idempotency', () => ({
  idempotency: { getOrderId: vi.fn(), saveOrderId: vi.fn() },
}))

import { CheckoutRepo } from '~/modules/checkout/checkout.repo'
import { OrderRepo } from '~/modules/orders/order.repo'
import { idempotency } from '~/core/idempotency/idempotency'
import { CheckoutService } from '~/modules/checkout/checkout.service'

const fakeOrder = { id: 'order-1', items: [] }

describe('CheckoutService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects payment methods other than cod', async () => {
    await expect(
      CheckoutService.checkout('user-1', { addressId: 'a1', paymentMethod: 'online' }, 'key-1'),
    ).rejects.toMatchObject({ statusCode: 501 })
    expect(CheckoutRepo.checkout).not.toHaveBeenCalled()
  })

  it('creates a new order and saves the idempotency mapping on first call', async () => {
    vi.mocked(idempotency.getOrderId).mockResolvedValue(null)
    vi.mocked(CheckoutRepo.checkout).mockResolvedValue(fakeOrder as never)

    const result = await CheckoutService.checkout(
      'user-1',
      { addressId: 'a1', paymentMethod: 'cod' },
      'key-1',
    )

    expect(CheckoutRepo.checkout).toHaveBeenCalledOnce()
    expect(idempotency.saveOrderId).toHaveBeenCalledWith('user-1', 'key-1', 'order-1')
    expect(result.id).toBe('order-1')
  })

  it('returns the previously created order on a duplicate Idempotency-Key without re-processing', async () => {
    vi.mocked(idempotency.getOrderId).mockResolvedValue('order-1')
    vi.mocked(OrderRepo.findById).mockResolvedValue(fakeOrder as never)

    const result = await CheckoutService.checkout(
      'user-1',
      { addressId: 'a1', paymentMethod: 'cod' },
      'key-1',
    )

    expect(CheckoutRepo.checkout).not.toHaveBeenCalled()
    expect(result.id).toBe('order-1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd back-end && npx vitest run src/modules/checkout/checkout.service.test.ts`
Expected: FAIL — `checkout.service` doesn't exist.

- [ ] **Step 3: Add a `NotImplemented` (501) factory to `ApiError`**

`ApiError` doesn't have this yet — add it before the service below uses it. In `back-end/src/core/http/ApiError.ts`, add after `static Internal`:

```ts
  static NotImplemented(msg = 'Not Implemented', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.NOT_IMPLEMENTED, msg, details, code)
  }
```

- [ ] **Step 4: Implement the service**

```ts
// back-end/src/modules/checkout/checkout.service.ts
import { ApiError } from '~/core/http/ApiError'
import { idempotency } from '~/core/idempotency/idempotency'
import { CheckoutRepo } from '~/modules/checkout/checkout.repo'
import type { CheckoutInput } from '~/modules/checkout/checkout.types'
import { toOrderDTO } from '~/modules/orders/order.mapper'
import { OrderRepo } from '~/modules/orders/order.repo'

export const CheckoutService = {
  async checkout(userId: string, input: CheckoutInput, idempotencyKey: string) {
    if (input.paymentMethod !== 'cod') {
      throw ApiError.NotImplemented(
        'Online payment is not implemented yet (Phase 3)',
        undefined,
        'PAYMENT_METHOD_NOT_IMPLEMENTED',
      )
    }

    const existingOrderId = await idempotency.getOrderId(userId, idempotencyKey)
    if (existingOrderId) {
      const existingOrder = await OrderRepo.findById(existingOrderId)
      if (existingOrder) return toOrderDTO(existingOrder)
      // Mapped order id no longer resolves (e.g. Redis TTL outlived a deleted test order) — fall through and reprocess.
    }

    const order = await CheckoutRepo.checkout(userId, input)
    await idempotency.saveOrderId(userId, idempotencyKey, order.id)
    return toOrderDTO(order)
  },
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd back-end && npx vitest run src/modules/checkout/checkout.service.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 6: Commit**

```bash
cd back-end
git add src/core/http/ApiError.ts src/modules/checkout/checkout.service.ts src/modules/checkout/checkout.service.test.ts
git commit -m "feat: add checkout service with idempotent order creation"
```

---

### Task 23: Checkout module — controller, routes, register; full manual smoke test

**Files:**
- Create: `back-end/src/modules/checkout/checkout.controller.ts`
- Create: `back-end/src/modules/checkout/checkout.routes.ts`
- Modify: `back-end/src/routes/index.ts`

- [ ] **Step 1: Controller**

```ts
// back-end/src/modules/checkout/checkout.controller.ts
import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import type { IdempotentRequest } from '~/core/http/requireIdempotencyKey'
import { CheckoutService } from '~/modules/checkout/checkout.service'
import type { CheckoutInput } from '~/modules/checkout/checkout.types'

type Req = AuthRequest & IdempotentRequest

export const CheckoutController = {
  checkout: async (req: Req, res: Response) => {
    const order = await CheckoutService.checkout(
      req.user!.id,
      req.body as CheckoutInput,
      req.idempotencyKey!,
    )
    return res.status(201).json(order)
  },
}
```

- [ ] **Step 2: Routes**

```ts
// back-end/src/modules/checkout/checkout.routes.ts
import { Router } from 'express'

import { permissions } from '~/config/rbacConfig'
import { authenticate } from '~/core/auth/auth.middleware'
import { requirePermission } from '~/core/auth/requirePermission'
import { requireIdempotencyKey } from '~/core/http/requireIdempotencyKey'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { CheckoutController } from '~/modules/checkout/checkout.controller'
import { CheckoutSchema } from '~/modules/checkout/checkout.validation'

const r = Router()

r.post(
  '/',
  authenticate,
  requirePermission(permissions.VIEW_USER),
  requireIdempotencyKey,
  validateRequest(CheckoutSchema),
  asyncHandler(CheckoutController.checkout),
)

export default r
```

- [ ] **Step 3: Register in `routes/index.ts`**

```ts
import checkoutRoutes from '~/modules/checkout/checkout.routes'
// ...
router.use('/checkout', checkoutRoutes)
```

- [ ] **Step 4: Full manual smoke test**

With the dev server running and `$ACCESS_TOKEN` set from a logged-in seeded user:

```bash
# 1. Add an item to cart (use a real ProductVariant id)
curl -s -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"variantId":"<variant-id>","quantity":1}'

# 2. Create an address (skip if one already exists from Task 12)
curl -s -X POST http://localhost:3000/api/addresses \
  -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"recipientName":"Nguyen Van A","phone":"0901234567","provinceCode":"HN","wardCode":"HN-BD","detail":"1 Doi Can"}'

# 3. Checkout (note the address id from step 2's response)
curl -s -X POST http://localhost:3000/api/checkout \
  -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{"addressId":"<address-id>","paymentMethod":"cod"}'
```

Expected: `201` with the created order (`orderStatus: PENDING`, `paymentStatus: UNPAID`, `shipmentStatus: NOT_SHIPPED`, `total = subtotal + 30000`).

```bash
# 4. Re-run the exact same checkout request with the SAME Idempotency-Key
```

Expected: `201` again, with the **same** `id`/`orderNumber` as step 3 — proves dedup works.

```bash
# 5. List my orders and cancel it
curl -s http://localhost:3000/api/orders -H "Authorization: Bearer $ACCESS_TOKEN"
curl -s -X POST http://localhost:3000/api/orders/<order-id>/cancel -H "Authorization: Bearer $ACCESS_TOKEN"

# 6. Track it publicly
curl -s "http://localhost:3000/api/orders/track?orderNumber=<orderNumber>&phone=0901234567"

# 7. As an admin user, list and update status
curl -s http://localhost:3000/api/admin/orders -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN"
```

Expected: cancel restores stock (verify via `GET /api/products/:id` admin endpoint that `stockQuantity` went back up), tracking returns the trimmed view, admin list/detail work.

- [ ] **Step 5: Commit**

```bash
cd back-end
git add src/modules/checkout/checkout.controller.ts src/modules/checkout/checkout.routes.ts src/routes/index.ts
git commit -m "feat: expose checkout API and verify full COD flow end-to-end"
```

---

### Task 24: Checkout integration test (real DB, transaction rollback)

Per spec, verify the checkout transaction actually rolls back on a mid-transaction failure. No separate test database exists in this project yet; this test runs against the same dev database (already reachable per `back-end/.env`) and cleans up everything it creates in `afterAll`, rather than standing up new test-DB infrastructure — a pragmatic choice given no test DB convention exists yet in this codebase.

**Files:**
- Create: `back-end/src/modules/checkout/checkout.integration.test.ts`

- [ ] **Step 1: Write the test**

```ts
// back-end/src/modules/checkout/checkout.integration.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { prisma } from '~/lib/prisma'
import { newId } from '~/utils/id'
import { CheckoutRepo } from '~/modules/checkout/checkout.repo'

describe('CheckoutRepo.checkout (integration, real DB)', () => {
  let userId: string
  let roleId: string
  let categoryId: string
  let productId: string
  let variantId: string
  let addressId: string

  beforeAll(async () => {
    const role = await prisma.role.upsert({
      where: { name: 'USER' },
      update: {},
      create: { id: newId(), name: 'USER' },
    })
    roleId = role.id

    const user = await prisma.user.create({
      data: {
        id: newId(),
        email: `checkout-integration-${Date.now()}@test.local`,
        name: 'Integration Test User',
        password: 'unused',
        roleId,
        isActive: true,
      },
    })
    userId = user.id

    const category = await prisma.category.create({
      data: { id: newId(), name: `Integration Cat ${Date.now()}`, slug: `integration-cat-${Date.now()}` },
    })
    categoryId = category.id

    const product = await prisma.product.create({
      data: {
        id: newId(),
        name: 'Integration Test Product',
        slug: `integration-product-${Date.now()}`,
        categoryId,
        brand: 'TestBrand',
      },
    })
    productId = product.id

    const variant = await prisma.productVariant.create({
      data: { id: newId(), productId, price: 100000, stockQuantity: 1 },
    })
    variantId = variant.id

    const address = await prisma.address.create({
      data: {
        id: newId(),
        userId,
        recipientName: 'Integration Tester',
        phone: '0901234567',
        provinceCode: 'HN',
        provinceName: 'Thành phố Hà Nội',
        wardCode: 'HN-BD',
        wardName: 'Phường Ba Đình',
        detail: '1 Test St',
        isDefault: true,
      },
    })
    addressId = address.id
  })

  afterAll(async () => {
    await prisma.order.deleteMany({ where: { userId } })
    await prisma.address.deleteMany({ where: { userId } })
    await prisma.productVariant.deleteMany({ where: { productId } })
    await prisma.product.deleteMany({ where: { id: productId } })
    await prisma.category.deleteMany({ where: { id: categoryId } })
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.$disconnect()
  })

  it('rolls back the whole transaction when a mid-transaction step fails', async () => {
    // Request 2 units against a variant that only has 1 in stock — validateAndPriceStock throws
    // partway through, after resolveLineItems already ran but before the order is created.
    await expect(
      CheckoutRepo.checkout(userId, {
        addressId,
        paymentMethod: 'cod',
        buyNowItem: { variantId, quantity: 2 },
      }),
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_STOCK' })

    const orders = await prisma.order.findMany({ where: { userId } })
    expect(orders).toHaveLength(0)

    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } })
    expect(variant.stockQuantity).toBe(1) // unchanged — proves the decrement never committed
  })

  it('succeeds end-to-end for a valid buy-now checkout', async () => {
    const order = await CheckoutRepo.checkout(userId, {
      addressId,
      paymentMethod: 'cod',
      buyNowItem: { variantId, quantity: 1 },
    })

    expect(order.orderStatus).toBe('PENDING')
    expect(order.items).toHaveLength(1)

    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } })
    expect(variant.stockQuantity).toBe(0) // decremented
  })
})
```

- [ ] **Step 2: Run it**

Run: `cd back-end && npx vitest run src/modules/checkout/checkout.integration.test.ts`
Expected: PASS, 2 tests. Requires the dev MySQL/MariaDB from `back-end/.env` to be running and reachable.

- [ ] **Step 3: Run the full test suite**

Run: `cd back-end && npm test`
Expected: all tests pass (unit + this integration test).

- [ ] **Step 4: Commit**

```bash
cd back-end
git add src/modules/checkout/checkout.integration.test.ts
git commit -m "test: add checkout transaction-rollback integration test"
```

---

## Part B — Frontend

**Scope boundary (important, discovered during planning):** `Home.tsx`, `Category.tsx`, and `ProductDetail.tsx` are **entirely mock data** — `ProductDetail.tsx` shows a hardcoded fake iPhone with fake images/colors/reviews with no connection to any real product, and `Category.tsx` reads from `~/mock/productData`. Wiring the storefront browsing experience to the real `catalog` API is a separate, larger pre-existing gap, unrelated to checkout/payment/shipping, and is **out of scope for this plan**. Because of this, "Add to cart" / "Buy now" on `ProductDetail.tsx` are **not** wired in this plan — doing so would mean associating a real backend variant with a fake displayed product, which is misleading rather than useful. The backend Cart/Checkout API already supports a `buyNowItem` for whenever that follow-up work wires the storefront to real data.

What this plan **does** wire to real APIs: `Cart.tsx`, `Checkout.tsx`, `AccountAddresses.tsx` (with a new address form), `AccountOrders.tsx`, `TrackOrder.tsx`, and the admin `OrdersList.tsx`/`OrderDetail.tsx`. Manual end-to-end testing seeds the cart via `curl` (as already done in backend Task 23) since there's no real "browse and add a real product" path yet.

No frontend test framework exists (`front-end/package.json` has no `test` script, no Vitest/RTL) — matching the spec's own testing section, verification here is manual, in the browser.

### Task 25: Frontend API modules

**Files:**
- Create: `front-end/src/apis/cartApi.ts`
- Create: `front-end/src/apis/addressApi.ts`
- Create: `front-end/src/apis/locationApi.ts`
- Create: `front-end/src/apis/orderApi.ts`
- Create: `front-end/src/apis/checkoutApi.ts`

- [ ] **Step 1: `cartApi.ts`**

```ts
// front-end/src/apis/cartApi.ts
import api from "./axiosConfig"

export type CartItem = {
  id: string
  variantId: string
  productId: string
  productName: string
  variantLabel: string
  imageUrl?: string
  price: number
  quantity: number
  selected: boolean
  stockQuantity: number
}

export type Cart = {
  id: string | null
  items: CartItem[]
  countProduct: number
}

export async function fetchCart(): Promise<Cart> {
  const response = await api.get<Cart>("/cart")
  return response.data
}

export async function addCartItem(variantId: string, quantity: number): Promise<Cart> {
  const response = await api.post<Cart>("/cart/items", { variantId, quantity })
  return response.data
}

export async function updateCartItem(
  itemId: string,
  data: { quantity?: number; selected?: boolean }
): Promise<Cart> {
  const response = await api.patch<Cart>(`/cart/items/${itemId}`, data)
  return response.data
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const response = await api.delete<Cart>(`/cart/items/${itemId}`)
  return response.data
}

export async function selectAllCartItems(selected: boolean): Promise<Cart> {
  const response = await api.patch<Cart>("/cart/select-all", { selected })
  return response.data
}
```

- [ ] **Step 2: `addressApi.ts`**

```ts
// front-end/src/apis/addressApi.ts
import api from "./axiosConfig"

export type Address = {
  id: string
  label?: string
  recipientName: string
  phone: string
  provinceCode: string
  provinceName: string
  wardCode: string
  wardName: string
  detail: string
  isDefault: boolean
}

export type UpsertAddressPayload = {
  label?: string
  recipientName: string
  phone: string
  provinceCode: string
  wardCode: string
  detail: string
  isDefault?: boolean
}

export async function fetchAddresses(): Promise<Address[]> {
  const response = await api.get<Address[]>("/addresses")
  return response.data
}

export async function createAddress(payload: UpsertAddressPayload): Promise<Address> {
  const response = await api.post<Address>("/addresses", payload)
  return response.data
}

export async function updateAddress(
  id: string,
  payload: Partial<UpsertAddressPayload>
): Promise<Address> {
  const response = await api.patch<Address>(`/addresses/${id}`, payload)
  return response.data
}

export async function setDefaultAddress(id: string): Promise<Address> {
  const response = await api.patch<Address>(`/addresses/${id}/default`, {})
  return response.data
}

export async function deleteAddress(id: string): Promise<void> {
  await api.delete(`/addresses/${id}`)
}
```

- [ ] **Step 3: `locationApi.ts`**

```ts
// front-end/src/apis/locationApi.ts
import api from "./axiosConfig"

export type Province = { code: string; name: string }
export type Ward = { code: string; name: string; provinceCode: string }

export async function fetchProvinces(): Promise<Province[]> {
  const response = await api.get<Province[]>("/locations/provinces")
  return response.data
}

export async function fetchWards(provinceCode: string): Promise<Ward[]> {
  const response = await api.get<Ward[]>(`/locations/provinces/${provinceCode}/wards`)
  return response.data
}
```

- [ ] **Step 4: `orderApi.ts`**

```ts
// front-end/src/apis/orderApi.ts
import api from "./axiosConfig"

export type OrderItem = {
  id: string
  variantId: string
  productName: string
  variantLabel: string
  imageUrl?: string
  price: number
  quantity: number
  total: number
}

export type Order = {
  id: string
  orderNumber: string
  userId: string
  recipientName: string
  phone: string
  provinceName: string
  wardName: string
  addressDetail: string
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  discountAmount: number
  discountCode?: string
  total: number
  orderStatus: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  paymentMethod: "COD" | "ONLINE"
  paymentStatus: "UNPAID" | "PAID" | "FAILED" | "REFUNDED"
  shipmentStatus: "NOT_SHIPPED" | "SHIPPED" | "DELIVERED" | "RETURNED"
  note?: string
  createdAt: string
  updatedAt: string
}

export type PaginatedOrders = {
  items: Order[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export type OrderTrackingResult = {
  orderNumber: string
  orderStatus: Order["orderStatus"]
  shipmentStatus: Order["shipmentStatus"]
  createdAt: string
  items: OrderItem[]
  total: number
  provinceName: string
  wardName: string
  addressDetail: string
}

export async function fetchMyOrders(params?: {
  page?: number
  limit?: number
  orderStatus?: string
}): Promise<PaginatedOrders> {
  const response = await api.get<PaginatedOrders>("/orders", { params })
  return response.data
}

export async function fetchMyOrder(id: string): Promise<Order> {
  const response = await api.get<Order>(`/orders/${id}`)
  return response.data
}

export async function cancelMyOrder(id: string): Promise<Order> {
  const response = await api.post<Order>(`/orders/${id}/cancel`)
  return response.data
}

export async function trackOrder(orderNumber: string, phone: string): Promise<OrderTrackingResult> {
  const response = await api.get<OrderTrackingResult>("/orders/track", {
    params: { orderNumber, phone },
  })
  return response.data
}

export async function fetchAdminOrders(params?: {
  page?: number
  limit?: number
  orderStatus?: string
  paymentMethod?: string
  search?: string
}): Promise<PaginatedOrders> {
  const response = await api.get<PaginatedOrders>("/admin/orders", { params })
  return response.data
}

export async function fetchAdminOrder(id: string): Promise<Order> {
  const response = await api.get<Order>(`/admin/orders/${id}`)
  return response.data
}

export async function updateAdminOrderStatus(
  id: string,
  data: Partial<Pick<Order, "orderStatus" | "paymentStatus" | "shipmentStatus">>
): Promise<Order> {
  const response = await api.patch<Order>(`/admin/orders/${id}/status`, data)
  return response.data
}
```

- [ ] **Step 5: `checkoutApi.ts`**

```ts
// front-end/src/apis/checkoutApi.ts
import api from "./axiosConfig"
import type { Order } from "./orderApi"

export type CheckoutPayload = {
  addressId: string
  paymentMethod: "cod"
  discountCode?: string
}

export async function checkout(payload: CheckoutPayload): Promise<Order> {
  const response = await api.post<Order>("/checkout", payload, {
    headers: { "Idempotency-Key": crypto.randomUUID() },
  })
  return response.data
}
```

- [ ] **Step 6: Typecheck**

Run: `cd front-end && npx tsc --noEmit` (or the project's existing typecheck script if one exists — check `front-end/package.json`)
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
cd front-end
git add src/apis/cartApi.ts src/apis/addressApi.ts src/apis/locationApi.ts src/apis/orderApi.ts src/apis/checkoutApi.ts
git commit -m "feat: add cart/address/location/order/checkout API modules"
```

---

### Task 26: Rewire `Cart.tsx` to the real Cart API

**Files:**
- Modify: `front-end/src/pages/Cart.tsx`

- [ ] **Step 1: Replace the full file content**

```tsx
// front-end/src/pages/Cart.tsx
import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { CartEmptyState } from "~/components/cart/CartEmptyState"
import { CartLineItem, type CartItemData } from "~/components/cart/CartLineItem"
import { CartOrderSummary } from "~/components/cart/CartOrderSummary"
import { CartPageHeader } from "~/components/cart/CartPageHeader"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { storeTokens } from "~/lib/categoryTheme"
import {
  fetchCart,
  removeCartItem,
  selectAllCartItems,
  updateCartItem,
  type Cart as CartData,
} from "~/apis/cartApi"

const formatPrice = (price: number) => `${price.toLocaleString("en-US")} VND`

const EMPTY_CART: CartData = { id: null, items: [], countProduct: 0 }

function toCartItemData(cart: CartData): CartItemData[] {
  return cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.productName,
    variant: item.variantLabel,
    image: item.imageUrl ?? "",
    price: item.price,
    quantity: item.quantity,
    selected: item.selected,
  }))
}

export function Cart() {
  const [cart, setCart] = useState<CartData>(EMPTY_CART)
  const [voucherCode, setVoucherCode] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCart()
      .then(setCart)
      .finally(() => setIsLoading(false))
  }, [])

  const cartItems = toCartItemData(cart)
  const selectedItems = cartItems.filter((item) => item.selected)
  const selectAll = cartItems.length > 0 && cartItems.every((item) => item.selected)
  const someSelected = cartItems.some((item) => item.selected)

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = selectedItems.length > 0 ? 35_000 : 0
  const voucherDiscount = selectedItems.length > 0 && voucherCode.trim().length > 0 ? 150_000 : 0
  const total = Math.max(0, subtotal + shipping - voucherDiscount)

  const toggleSelectAll = async (checked: boolean) => {
    setCart(await selectAllCartItems(checked))
  }

  const toggleItemSelection = async (id: string) => {
    const item = cart.items.find((i) => i.id === id)
    if (!item) return
    setCart(await updateCartItem(id, { selected: !item.selected }))
  }

  const updateQuantity = async (id: string, delta: number) => {
    const item = cart.items.find((i) => i.id === id)
    if (!item) return
    setCart(await updateCartItem(id, { quantity: Math.max(1, item.quantity + delta) }))
  }

  const removeItem = async (id: string) => {
    setCart(await removeCartItem(id))
  }

  const removeSelected = async () => {
    const selectedIds = cart.items.filter((i) => i.selected).map((i) => i.id)
    let updated = cart
    for (const id of selectedIds) {
      updated = await removeCartItem(id)
    }
    setCart(updated)
  }

  if (isLoading) return null

  return (
    <div className={`min-h-[100dvh] ${storeTokens.pageBg} py-5 sm:py-6`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <CartPageHeader itemCount={cartItems.length} selectedCount={selectedItems.length} />

        {cartItems.length === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_340px] lg:gap-5 xl:grid-cols-[1fr_360px]">
            <section
              className={`overflow-hidden rounded-lg border ${storeTokens.border} ${storeTokens.surface}`}
            >
              <div
                className={`flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5 ${storeTokens.bandBg}`}
              >
                <label className="flex cursor-pointer items-center gap-2.5">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                    aria-label="Select all products"
                    className="size-[18px] border-gray-300 data-checked:border-[#00cbfd] data-checked:bg-[#00cbfd]"
                  />
                  <span className="text-sm text-[#2b2f32]">
                    Select all ({cartItems.length})
                  </span>
                </label>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeSelected}
                  disabled={!someSelected}
                  className="h-8 text-[#ee4d2d] hover:bg-[#fff5f3] hover:text-[#d73211] disabled:opacity-40"
                >
                  <Trash2 className="mr-1.5 size-3.5" aria-hidden="true" />
                  Remove selected
                </Button>
              </div>

              <div role="list">
                {cartItems.map((item) => (
                  <CartLineItem
                    key={item.id}
                    item={item}
                    onToggleSelect={toggleItemSelection}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            </section>

            <CartOrderSummary
              selectedCount={selectedItems.reduce((sum, item) => sum + item.quantity, 0)}
              subtotal={subtotal}
              shipping={shipping}
              discount={voucherDiscount}
              total={total}
              voucherCode={voucherCode}
              onVoucherChange={setVoucherCode}
              formatPrice={formatPrice}
              checkoutDisabled={selectedItems.length === 0}
            />
          </div>
        )}
      </div>
    </div>
  )
}
```

Note: `CartLineItem`'s `onToggleSelect`/`onUpdateQuantity`/`onRemove` props are typed as returning `void`; passing an `async` function (returning `Promise<void>`) is valid TypeScript here since a `void`-typed callback accepts any return value.

- [ ] **Step 2: Manual verification**

1. Seed a real cart item via curl first (backend Task 15's example), using a variant belonging to a real seeded product.
2. Run `cd front-end && npm run dev`, log in as that same user, navigate to `/cart`.
3. Expected: the real item appears with its live price; toggling its checkbox, changing quantity, and removing it all persist (reload the page — the change should still be there, since it's now backed by the real API, not local state).

- [ ] **Step 3: Commit**

```bash
cd front-end
git add src/pages/Cart.tsx
git commit -m "feat: wire Cart page to real cart API"
```

---

### Task 27: Address book — form dialog + `AccountAddresses.tsx`

**Files:**
- Create: `front-end/src/components/account/AddressFormDialog.tsx`
- Modify: `front-end/src/pages/account/AccountAddresses.tsx`

- [ ] **Step 1: Confirm `DialogFooter` is exported**

Run: `grep -n "DialogFooter" front-end/src/components/ui/dialog.tsx`
Expected: an export. If it's not exported, use a plain `<div className="flex justify-end gap-2 mt-4">` instead of `<DialogFooter>` in Step 2 below.

- [ ] **Step 2: Create the address form dialog**

```tsx
// front-end/src/components/account/AddressFormDialog.tsx
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { toast } from "sonner"
import {
  createAddress,
  updateAddress,
  type Address,
  type UpsertAddressPayload,
} from "~/apis/addressApi"
import { fetchProvinces, fetchWards, type Province, type Ward } from "~/apis/locationApi"

type AddressFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: Address | null // null = create mode
  onSaved: () => void
}

const EMPTY_FORM: UpsertAddressPayload = {
  label: "",
  recipientName: "",
  phone: "",
  provinceCode: "",
  wardCode: "",
  detail: "",
  isDefault: false,
}

export function AddressFormDialog({
  open,
  onOpenChange,
  address,
  onSaved,
}: AddressFormDialogProps) {
  const [form, setForm] = useState<UpsertAddressPayload>(EMPTY_FORM)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    fetchProvinces().then(setProvinces)
    setForm(
      address
        ? {
            label: address.label ?? "",
            recipientName: address.recipientName,
            phone: address.phone,
            provinceCode: address.provinceCode,
            wardCode: address.wardCode,
            detail: address.detail,
            isDefault: address.isDefault,
          }
        : EMPTY_FORM
    )
  }, [open, address])

  useEffect(() => {
    if (!form.provinceCode) {
      setWards([])
      return
    }
    fetchWards(form.provinceCode).then(setWards)
  }, [form.provinceCode])

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      if (address) {
        await updateAddress(address.id, form)
      } else {
        await createAddress(form)
      }
      toast.success("Address saved")
      onSaved()
      onOpenChange(false)
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message ?? "Failed to save address")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{address ? "Edit address" : "Add address"}</DialogTitle>
          <DialogDescription>Used for shipping your orders.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label htmlFor="addr-label">Label (optional)</Label>
            <Input
              id="addr-label"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="Home, Office..."
            />
          </div>
          <div>
            <Label htmlFor="addr-name">Recipient name</Label>
            <Input
              id="addr-name"
              value={form.recipientName}
              onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="addr-phone">Phone</Label>
            <Input
              id="addr-phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="0901234567"
            />
          </div>
          <div>
            <Label>Province / City</Label>
            <Select
              value={form.provinceCode}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, provinceCode: value, wardCode: "" }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Ward</Label>
            <Select
              value={form.wardCode}
              onValueChange={(value) => setForm((f) => ({ ...f, wardCode: value }))}
              disabled={!form.provinceCode}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select ward" />
              </SelectTrigger>
              <SelectContent>
                {wards.map((w) => (
                  <SelectItem key={w.code} value={w.code}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="addr-detail">Address detail</Label>
            <Input
              id="addr-detail"
              value={form.detail}
              onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
              placeholder="House number, street"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isDefault}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, isDefault: checked === true }))}
            />
            Set as default address
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Rewire `AccountAddresses.tsx`**

Replace the full file content:

```tsx
// front-end/src/pages/account/AccountAddresses.tsx
import { useEffect, useState } from "react"
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { AddressFormDialog } from "~/components/account/AddressFormDialog"
import { deleteAddress, fetchAddresses, setDefaultAddress, type Address } from "~/apis/addressApi"

/** Shipping addresses tab. */
export function AccountAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)

  const load = () => {
    fetchAddresses()
      .then(setAddresses)
      .finally(() => setIsLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id: string) => {
    await deleteAddress(id)
    toast.success("Address removed")
    load()
  }

  const handleSetDefault = async (id: string) => {
    await setDefaultAddress(id)
    load()
  }

  if (isLoading) return null

  return (
    <div>
      <Card className="py-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">My addresses</CardTitle>
              <CardDescription>{addresses.length} addresses</CardDescription>
            </div>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-600 cursor-pointer"
              onClick={() => {
                setEditing(null)
                setDialogOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add address
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className={`transition-all ${
                addr.isDefault
                  ? "ring-2 ring-cyan-500/30 shadow-md"
                  : "hover:shadow-md"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        addr.isDefault
                          ? "bg-gradient-to-br from-cyan-50 to-blue-50"
                          : "bg-slate-50"
                      }`}
                    >
                      <MapPin
                        className={`w-5 h-5 ${
                          addr.isDefault ? "text-cyan-600" : "text-slate-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">
                          {addr.label || addr.recipientName}
                        </h3>
                        {addr.isDefault && (
                          <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 text-[10px]">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        {addr.recipientName} • {addr.phone}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {addr.detail}, {addr.wardName}, {addr.provinceName}
                      </p>
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="mt-1 text-xs text-cyan-600 hover:underline"
                        >
                          Set as default
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-cyan-600 cursor-pointer"
                      aria-label="Edit address"
                      onClick={() => {
                        setEditing(addr)
                        setDialogOpen(true)
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {!addr.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-red-500 cursor-pointer"
                        aria-label="Delete address"
                        onClick={() => handleDelete(addr.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <AddressFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        address={editing}
        onSaved={load}
      />
    </div>
  )
}
```

- [ ] **Step 4: Manual verification**

Run `npm run dev` in `front-end/`, log in, go to `/account/addresses`. Add an address (province → ward cascading select should populate from the sample seed data), confirm it appears and can be set default/edited/deleted.

- [ ] **Step 5: Commit**

```bash
cd front-end
git add src/components/account/AddressFormDialog.tsx src/pages/account/AccountAddresses.tsx
git commit -m "feat: wire address book to real address/location API"
```

---

### Task 28: Rewire `Checkout.tsx`

**Files:**
- Modify: `front-end/src/pages/Checkout.tsx`

- [ ] **Step 1: Replace the full file content**

```tsx
// front-end/src/pages/Checkout.tsx
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import { ChevronRight, MapPin, Package, Pencil } from "lucide-react"
import { toast } from "sonner"
import { CheckoutOrderSummary } from "~/components/checkout/CheckoutOrderSummary"
import {
  CheckoutPaymentSection,
  type PaymentType,
} from "~/components/checkout/CheckoutPaymentSection"
import {
  PaymentGatewayModal,
  type CardProvider,
} from "~/components/checkout/PaymentGatewayModal"
import { Button } from "~/components/ui/button"
import { storeTokens } from "~/lib/categoryTheme"
import { cn } from "~/lib/utils"
import { fetchCart, type Cart } from "~/apis/cartApi"
import { fetchAddresses, type Address } from "~/apis/addressApi"
import { checkout as submitCheckout } from "~/apis/checkoutApi"

const formatPrice = (price: number) => `${price.toLocaleString("en-US")} VND`

// Rough preview only — mirrors the back-end SHIPPING_FLAT_FEE default. The authoritative
// total (including the real fee) is always recomputed server-side in POST /checkout.
const SHIPPING_FEE_PREVIEW = 30_000

export function Checkout() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<Cart>({ id: null, items: [], countProduct: 0 })
  const [address, setAddress] = useState<Address | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentType, setPaymentType] = useState<PaymentType>("cod")
  const [cardProvider, setCardProvider] = useState<CardProvider>("stripe")
  const [voucherCode, setVoucherCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [gatewayOpen, setGatewayOpen] = useState(false)
  const [activeGateway, setActiveGateway] = useState<CardProvider | null>(null)

  useEffect(() => {
    Promise.all([fetchCart(), fetchAddresses()])
      .then(([cartData, addresses]) => {
        setCart(cartData)
        setAddress(addresses.find((a) => a.isDefault) ?? addresses[0] ?? null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const orderItems = cart.items.filter((item) => item.selected)
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = orderItems.length > 0 ? SHIPPING_FEE_PREVIEW : 0
  const voucherDiscount = orderItems.length > 0 && voucherCode.trim().length > 0 ? 150_000 : 0
  const total = Math.max(0, subtotal + shipping - voucherDiscount)

  const handlePlaceOrder = async () => {
    if (isSubmitting || orderItems.length === 0) return

    if (!address) {
      toast.error("Please add a shipping address first")
      return
    }

    if (paymentType === "card") {
      setActiveGateway(cardProvider)
      setGatewayOpen(true)
      return
    }

    setIsSubmitting(true)
    try {
      const order = await submitCheckout({
        addressId: address.id,
        paymentMethod: "cod",
        discountCode: voucherCode.trim() || undefined,
      })
      toast.success("Order placed successfully!", {
        description: `Order ${order.orderNumber} has been recorded.`,
      })
      navigate("/account/orders")
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message ?? "Failed to place order")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return null

  return (
    <div className={cn("min-h-screen py-6 sm:py-8", storeTokens.pageBg)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mb-5 sm:mb-6">
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-[#757575]"
          >
            <Link to="/" className="hover:text-[#2b2f32]">
              Home
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            <Link to="/cart" className="hover:text-[#2b2f32]">
              Cart
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="font-medium text-[#2b2f32]">Checkout</span>
          </nav>

          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-lg",
                storeTokens.iconBoxActive
              )}
            >
              <Package className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-[#2b2f32] sm:text-2xl">Checkout</h1>
              <p className="mt-1 text-sm leading-relaxed text-[#757575]">
                Review your address, products, and payment method before placing the order.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4 sm:space-y-5">
            {/* Shipping address */}
            <section
              className={cn(
                "rounded-lg border p-4 sm:p-5",
                storeTokens.border,
                storeTokens.surface
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg",
                      storeTokens.iconBoxActive
                    )}
                  >
                    <MapPin className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-[#2b2f32] sm:text-lg">
                      Shipping address
                    </h2>
                    <p className="mt-1 text-sm text-[#757575]">Delivery in 2-4 business days</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-[#00647e] hover:bg-[#e8f9fd] hover:text-[#00576e]"
                  asChild
                >
                  <Link to="/account/addresses">
                    <Pencil className="size-3.5" aria-hidden="true" />
                    {address ? "Edit" : "Add"}
                  </Link>
                </Button>
              </div>

              <div className="mt-4 rounded-lg border border-gray-100 bg-[#fafafa] p-4">
                {address ? (
                  <>
                    <p className="font-medium text-[#2b2f32]">{address.recipientName}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#757575]">
                      {address.detail}, {address.wardName}
                      <br />
                      {address.provinceName}
                    </p>
                    <p className="mt-2 text-sm text-[#2b2f32]">{address.phone}</p>
                  </>
                ) : (
                  <p className="text-sm text-[#757575]">
                    You don't have a saved address yet. Add one to continue checkout.
                  </p>
                )}
              </div>
            </section>

            {/* Products */}
            <section
              className={cn(
                "rounded-lg border p-4 sm:p-5",
                storeTokens.border,
                storeTokens.surface
              )}
            >
              <h2 className="text-base font-semibold text-[#2b2f32] sm:text-lg">
                Products ({orderItems.length})
              </h2>

              <ul className="mt-4 space-y-4">
                {orderItems.map((item) => (
                  <li key={item.id} className="flex gap-3 sm:gap-4">
                    <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-[#f0f0f0] sm:size-24">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-medium leading-snug text-[#2b2f32]">
                          {item.productName}
                        </h3>
                        <span className={cn("shrink-0 text-sm font-semibold", storeTokens.price)}>
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#757575]">{item.variantLabel}</p>
                      <p className="mt-2 inline-block rounded bg-[#f0f0f0] px-2 py-0.5 text-xs text-[#757575]">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <CheckoutPaymentSection
              paymentType={paymentType}
              cardProvider={cardProvider}
              onPaymentTypeChange={setPaymentType}
              onCardProviderChange={setCardProvider}
            />
          </div>

          <CheckoutOrderSummary
            itemCount={orderItems.reduce((sum, item) => sum + item.quantity, 0)}
            subtotal={subtotal}
            shipping={shipping}
            discount={voucherDiscount}
            total={total}
            voucherCode={voucherCode}
            onVoucherChange={setVoucherCode}
            formatPrice={formatPrice}
            onPlaceOrder={handlePlaceOrder}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      <PaymentGatewayModal
        provider={activeGateway}
        open={gatewayOpen}
        onOpenChange={setGatewayOpen}
      />
    </div>
  )
}
```

Card/e-wallet payment intentionally keeps showing `PaymentGatewayModal`'s existing "Waiting for payment gateway integration" placeholder — that's already an honest "coming soon" state requiring no further change; only COD is wired to a real backend call.

- [ ] **Step 2: Manual verification**

With a real cart item selected (from Task 26) and a saved default address (from Task 27): go to `/checkout`, confirm the real item/address/total show, click "Place order" with COD selected. Expected: success toast with the real `orderNumber`, redirect to `/account/orders`, and the cart item is gone from `/cart` afterward (consumed by checkout).

- [ ] **Step 3: Commit**

```bash
cd front-end
git add src/pages/Checkout.tsx
git commit -m "feat: wire Checkout page to real cart/address/checkout API"
```

---

### Task 29: Rewire `AccountOrders.tsx`

**Files:**
- Modify: `front-end/src/pages/account/AccountOrders.tsx`

- [ ] **Step 1: Replace the full file content**

```tsx
// front-end/src/pages/account/AccountOrders.tsx
import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Truck, CheckCircle2, Clock, XCircle, ShoppingBag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs"
import { formatPrice } from "~/lib/account/formatters"
import { fetchMyOrders, type Order } from "~/apis/orderApi"

const STATUS_CONFIG: Record<
  Order["orderStatus"],
  { icon: typeof Truck; color: string; bg: string; label: string }
> = {
  PENDING: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Pending" },
  CONFIRMED: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Confirmed" },
  SHIPPED: { icon: Truck, color: "text-blue-600", bg: "bg-blue-50 border-blue-200", label: "Shipping" },
  DELIVERED: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    label: "Delivered",
  },
  CANCELLED: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200", label: "Cancelled" },
}

const TABS = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "SHIPPED", label: "Shipping" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
] as const

/** My orders tab. */
export function AccountOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMyOrders({ limit: 50 })
      .then((res) => setOrders(res.items))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return null

  const renderList = (items: Order[]) => (
    <div className="space-y-4 mt-4">
      {items.length === 0 && <p className="text-center text-slate-400 py-12">No orders here yet.</p>}
      {items.map((order) => {
        const config = STATUS_CONFIG[order.orderStatus]
        const StatusIcon = config.icon
        return (
          <Card key={order.id} className="hover:shadow-md transition-shadow group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-mono text-slate-600">{order.orderNumber}</span>
                </div>
                <Badge variant="outline" className={`${config.bg} ${config.color} border font-medium`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                {order.items[0]?.imageUrl && (
                  <img
                    src={order.items[0].imageUrl}
                    alt="Product in order"
                    className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-100"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-500">
                    {order.items.length} items - {new Date(order.createdAt).toLocaleDateString("en-US")}
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{formatPrice(order.total)}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                    <Link to="/track-order">Track</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">My orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="w-full">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="cursor-pointer">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {renderList(
                  tab.value === "all" ? orders : orders.filter((o) => o.orderStatus === tab.value)
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
```

Note: the "Buy again" button from the old mock is dropped — re-adding a specific past item to cart isn't meaningfully actionable until the storefront (out of scope, see Part B intro) has real product pages to link to.

- [ ] **Step 2: Manual verification**

Place an order via Task 28's flow, then visit `/account/orders` — confirm it appears with the real order number, item count, and total, under the correct status tab.

- [ ] **Step 3: Commit**

```bash
cd front-end
git add src/pages/account/AccountOrders.tsx
git commit -m "feat: wire AccountOrders page to real order API"
```

---

### Task 30: Rewire `TrackOrder.tsx`

The public tracking endpoint requires both order number and phone (spec's anti-enumeration requirement) — the mock UI only had an order-code field, so this adds a phone field too.

**Files:**
- Modify: `front-end/src/pages/TrackOrder.tsx`

- [ ] **Step 1: Replace the full file content**

```tsx
// front-end/src/pages/TrackOrder.tsx
import { Package, MapPin, CheckCircle, Truck, Clock, XCircle } from "lucide-react"
import { useState } from "react"
import { trackOrder, type OrderTrackingResult } from "~/apis/orderApi"

const STEP_ORDER = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as const

export function TrackOrder() {
  const [orderCode, setOrderCode] = useState("")
  const [phone, setPhone] = useState("")
  const [order, setOrder] = useState<OrderTrackingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTrack = async () => {
    if (!orderCode.trim() || !phone.trim()) return
    setError(null)
    try {
      setOrder(await trackOrder(orderCode.trim(), phone.trim()))
    } catch {
      setOrder(null)
      setError("Order not found. Check the order code and phone number.")
    }
  }

  const formatPrice = (price: number) => `${price.toLocaleString("en-US")} VND`

  const currentStepIndex = order
    ? order.orderStatus === "CANCELLED"
      ? -1
      : STEP_ORDER.indexOf(order.orderStatus as (typeof STEP_ORDER)[number])
    : -1

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Track order</h1>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="max-w-2xl mx-auto space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-3">Order code</label>
              <input
                type="text"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="Example: ORD20260904123456"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0ACDFF] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-3">
                Recipient phone number
              </label>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0ACDFF] focus:border-transparent"
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                />
                <button
                  onClick={handleTrack}
                  className="bg-[#0ACDFF] hover:bg-[#09b8e8] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Track
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Both the order code and the recipient phone number are required.
            </p>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>

        {order && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Order #{order.orderNumber}</h2>
                  <p className="text-gray-600">
                    Ordered at {new Date(order.createdAt).toLocaleString("en-US")}
                  </p>
                </div>
                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold flex items-center">
                  {order.orderStatus === "CANCELLED" ? (
                    <XCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <Truck className="w-5 h-5 mr-2" />
                  )}
                  {order.orderStatus}
                </div>
              </div>

              <div className="relative">
                {STEP_ORDER.map((step, index) => (
                  <div key={step} className="flex mb-8 last:mb-0">
                    <div className="flex flex-col items-center mr-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          currentStepIndex >= index
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-500"
                        }`}
                      >
                        {currentStepIndex >= index ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Clock className="w-6 h-6" />
                        )}
                      </div>
                      {index < STEP_ORDER.length - 1 && (
                        <div
                          className={`w-1 h-16 ${
                            currentStepIndex > index ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h3 className="font-semibold text-gray-900 mb-1">{step}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-[#0ACDFF]" />
                Shipping information
              </h3>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping address</span>
                <span className="font-semibold text-right max-w-md">
                  {order.addressDetail}, {order.wardName}, {order.provinceName}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-[#0ACDFF]" />
                Products in order
              </h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 pb-4 border-b last:border-0">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                      <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-500">{formatPrice(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-red-500">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Manual verification**

Using the `orderNumber` and phone from an order placed in Task 28, submit both fields on `/track-order`. Expected: real order details render. Try a wrong phone number — expected: the "Order not found" error message.

- [ ] **Step 3: Commit**

```bash
cd front-end
git add src/pages/TrackOrder.tsx
git commit -m "feat: wire TrackOrder page to public order tracking API"
```

---

### Task 31: Admin order pages — status helpers + `OrdersList.tsx` + `OrderDetail.tsx`

The existing `~/types/admin/index.ts` `Order` type and `~/stores/adminStore.ts` are shared with `Dashboard.tsx` (which still uses `mockOrders` and is out of scope here). To avoid breaking Dashboard, this task does **not** touch that shared type/store — it uses the real `Order` type from `~/apis/orderApi` instead, with small dedicated status-label helpers, and fetches directly instead of going through `useAdminStore`.

**Files:**
- Create: `front-end/src/lib/admin/realOrderStatus.ts`
- Modify: `front-end/src/pages/admin/OrdersList.tsx`
- Modify: `front-end/src/pages/admin/OrderDetail.tsx`

- [ ] **Step 1: Status label/badge helpers for the real order type**

```ts
// front-end/src/lib/admin/realOrderStatus.ts
import type { Order } from "~/apis/orderApi"

export const ORDER_STATUS_LABELS: Record<Order["orderStatus"], string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

export const ORDER_STATUS_BADGE_CLASS: Record<Order["orderStatus"], string> = {
  PENDING: "bg-amber-500/12 text-amber-800 dark:text-amber-200",
  CONFIRMED: "bg-sky-500/12 text-sky-800 dark:text-sky-200",
  SHIPPED: "bg-indigo-500/12 text-indigo-800 dark:text-indigo-200",
  DELIVERED: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-200",
  CANCELLED: "bg-red-500/12 text-red-800 dark:text-red-200",
}

export const PAYMENT_STATUS_LABELS: Record<Order["paymentStatus"], string> = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
}

// Mirrors OrderService.ORDER_STATUS_TRANSITIONS on the back end.
export const ORDER_STATUS_TRANSITIONS: Record<Order["orderStatus"], Order["orderStatus"][]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
}
```

- [ ] **Step 2: Rewire `OrdersList.tsx`**

Replace the full file content:

```tsx
// front-end/src/pages/admin/OrdersList.tsx
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Search, ArrowUpRight, ShoppingCart } from "lucide-react"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import {
  AdminWorkspace,
  AdminWorkspaceHeader,
  AdminMetricStrip,
  AdminFilterRow,
  AdminFilterSearch,
  AdminFilterField,
  AdminWorkspaceBody,
  AdminWorkspaceFooter,
} from "~/components/admin/AdminWorkspace"
import { AdminTableSkeleton } from "~/components/admin/AdminTableSkeleton"
import { AdminPagination } from "~/components/admin/AdminPagination"
import { AdminEmptyState } from "~/components/admin/AdminEmptyState"
import {
  adminBrandTextClass,
  adminGhostButtonClass,
  adminMonoClass,
  adminThClass,
  adminTdClass,
  adminDividerClass,
  adminFilterInputClass,
  adminRowActionClass,
  formatVnd,
} from "~/lib/admin/ui"
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "~/lib/admin/realOrderStatus"
import { ADMIN_PAGE_SIZE, paginate } from "~/lib/admin/pagination"
import { cn } from "~/lib/utils"
import { fetchAdminOrders, type Order } from "~/apis/orderApi"

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAdminOrders({ limit: 200 })
      .then((res) => setOrders(res.items))
      .finally(() => setIsLoading(false))
  }, [])

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(q) || order.recipientName.toLowerCase().includes(q)
    const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const { items: paginatedOrders, totalPages } = useMemo(
    () => paginate(filteredOrders, currentPage, ADMIN_PAGE_SIZE),
    [filteredOrders, currentPage]
  )

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(Math.max(1, totalPages))
  }, [currentPage, totalPages])

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all"

  const handleClearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setCurrentPage(1)
  }

  if (isLoading) return <AdminTableSkeleton />

  return (
    <AdminWorkspace>
      <AdminWorkspaceHeader
        title="Orders"
        description="Track status and payment for each order."
      />

      <AdminMetricStrip
        metrics={[
          { label: "Total orders", value: orders.length },
          {
            label: "Pending",
            value: orders.filter((o) => o.orderStatus === "PENDING").length,
            tone: "warning",
          },
          {
            label: "In progress",
            value: orders.filter((o) => ["CONFIRMED", "SHIPPED"].includes(o.orderStatus)).length,
            tone: "brand",
          },
          {
            label: "Completed",
            value: orders.filter((o) => o.orderStatus === "DELIVERED").length,
            tone: "success",
          },
        ]}
      />

      <AdminFilterRow>
        <AdminFilterSearch label="Keyword">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-brand)]"
              strokeWidth={2}
            />
            <Input
              placeholder="Order code, recipient name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className={cn("pl-9", adminFilterInputClass)}
            />
          </div>
        </AdminFilterSearch>
        <AdminFilterField label="Order status">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className={cn("w-full", adminFilterInputClass)}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminFilterField>
      </AdminFilterRow>

      <AdminWorkspaceBody>
        <Table>
          <TableHeader>
            <TableRow className={cn("hover:bg-transparent", adminDividerClass)}>
              <TableHead className={adminThClass}>Order code</TableHead>
              <TableHead className={adminThClass}>Recipient</TableHead>
              <TableHead className={adminThClass}>Order date</TableHead>
              <TableHead className={adminThClass}>Products</TableHead>
              <TableHead className={adminThClass}>Total</TableHead>
              <TableHead className={adminThClass}>Payment</TableHead>
              <TableHead className={adminThClass}>Status</TableHead>
              <TableHead className={cn(adminThClass, "text-right")}>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="p-0">
                  <AdminEmptyState
                    icon={ShoppingCart}
                    title="No orders"
                    description={
                      hasActiveFilters
                        ? "Try changing filters or keywords."
                        : "There are no orders in the system yet."
                    }
                    action={
                      hasActiveFilters ? (
                        <Button variant="outline" size="sm" className="h-8 text-[13px]" onClick={handleClearFilters}>
                          Clear filters
                        </Button>
                      ) : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={order.id} className={cn("group", adminDividerClass)}>
                  <TableCell className={adminTdClass}>
                    <p className="font-medium">{order.orderNumber}</p>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <p className="font-medium">{order.recipientName}</p>
                    <p className="truncate text-[12px] text-muted-foreground">{order.phone}</p>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <p>{format(new Date(order.createdAt), "dd/MM/yyyy", { locale: enUS })}</p>
                    <p className={cn(adminMonoClass, "text-[12px]")}>
                      {format(new Date(order.createdAt), "HH:mm")}
                    </p>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <span className={cn(adminMonoClass, "text-[12px]")}>{order.items.length}</span>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <span className={cn("font-mono font-medium", adminBrandTextClass)}>
                      {formatVnd(order.total)}
                    </span>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <p>{order.paymentMethod}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </p>
                  </TableCell>
                  <TableCell className={adminTdClass}>
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium",
                        "bg-muted"
                      )}
                    >
                      {ORDER_STATUS_LABELS[order.orderStatus]}
                    </span>
                  </TableCell>
                  <TableCell className={cn(adminTdClass, "text-right")}>
                    <div className={adminRowActionClass}>
                      <Link to={`/admin/orders/${order.id}`}>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className={cn("size-8 bg-background", adminGhostButtonClass)}
                          aria-label="View details"
                        >
                          <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminWorkspaceBody>

      <AdminWorkspaceFooter>
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredOrders.length}
          pageSize={ADMIN_PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel="orders"
        />
      </AdminWorkspaceFooter>
    </AdminWorkspace>
  )
}
```

(Dropped the `paymentMethod` filter dropdown from the original mock — Phase 1 only has `COD`, making a filter pointless; `ORDER_STATUS_BADGE_CLASS` styling can be reintroduced via `realOrderStatus.ts` if desired, simplified here to a plain badge to keep the diff focused.)

- [ ] **Step 3: Rewire `OrderDetail.tsx`**

Replace the full file content:

```tsx
// front-end/src/pages/admin/OrderDetail.tsx
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Badge } from "~/components/ui/badge"
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { toast } from "sonner"
import { AdminPage } from "~/components/admin/AdminPage"
import { AdminPageHeader } from "~/components/admin/AdminPageHeader"
import { adminBrandTextClass, formatVnd } from "~/lib/admin/ui"
import { ORDER_STATUS_LABELS, ORDER_STATUS_TRANSITIONS, PAYMENT_STATUS_LABELS } from "~/lib/admin/realOrderStatus"
import { cn } from "~/lib/utils"
import { fetchAdminOrder, updateAdminOrderStatus, type Order } from "~/apis/orderApi"

export function OrderDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = () => {
    if (!id) return
    fetchAdminOrder(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setIsLoading(false))
  }

  useEffect(load, [id])

  if (isLoading) return null

  if (!order) {
    return (
      <AdminPage>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-sm text-muted-foreground">Order does not exist</p>
          <Button variant="outline" onClick={() => navigate("/admin/orders")}>
            Back to list
          </Button>
        </div>
      </AdminPage>
    )
  }

  const handleStatusChange = async (newStatus: Order["orderStatus"]) => {
    try {
      const updated = await updateAdminOrderStatus(order.id, { orderStatus: newStatus })
      setOrder(updated)
      toast.success("Status updated")
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message ?? "Failed to update status")
    }
  }

  const allowedNextStatuses = ORDER_STATUS_TRANSITIONS[order.orderStatus]
  const timeline = [
    { status: "PENDING", label: "Placed", completed: true },
    {
      status: "CONFIRMED",
      label: "Confirmed",
      completed: ["CONFIRMED", "SHIPPED", "DELIVERED"].includes(order.orderStatus),
    },
    {
      status: "SHIPPED",
      label: "Shipping",
      completed: ["SHIPPED", "DELIVERED"].includes(order.orderStatus),
    },
    { status: "DELIVERED", label: "Completed", completed: order.orderStatus === "DELIVERED" },
  ]

  return (
    <AdminPage>
      <AdminPageHeader
        title={order.orderNumber}
        description={`Ordered at ${format(new Date(order.createdAt), "MM/dd/yyyy HH:mm", { locale: enUS })}`}
        leading={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => navigate("/admin/orders")}
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </Button>
        }
        actions={
          <span className="inline-flex rounded-md bg-muted px-3 py-1 text-sm font-medium">
            {ORDER_STATUS_LABELS[order.orderStatus]}
          </span>
        }
      />

      {order.orderStatus !== "CANCELLED" && (
        <Card className="shadow-none">
          <CardContent className="py-6">
            <div className="flex items-center justify-between gap-2">
              {timeline.map((item, index) => (
                <div key={item.status} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full text-xs font-semibold",
                        item.completed
                          ? "bg-[var(--admin-brand)] text-[var(--admin-brand-foreground)]"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {item.completed ? "OK" : index + 1}
                    </div>
                    <p
                      className={cn(
                        "max-w-[4.5rem] text-center text-[0.65rem] leading-tight sm:max-w-none sm:text-xs",
                        item.completed ? "font-medium text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </p>
                  </div>
                  {index < timeline.length - 1 && (
                    <div
                      className={cn(
                        "mx-1 h-0.5 flex-1 sm:mx-2",
                        item.completed ? "bg-[var(--admin-brand)]" : "bg-border"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="shadow-none">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Package className="size-4 text-muted-foreground" aria-hidden />
                Products ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-lg border border-border/80 p-4">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="size-20 shrink-0 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium">{item.productName}</h4>
                    <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn("font-semibold tabular-nums", adminBrandTextClass)}>
                      {formatVnd(item.price)}
                    </p>
                    <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                    <p className="mt-2 font-semibold tabular-nums">{formatVnd(item.total)}</p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatVnd(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping fee</span>
                  <span className="tabular-nums">{formatVnd(order.shippingFee)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Discount</span>
                    <span className="tabular-nums">-{formatVnd(order.discountAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className={cn("tabular-nums", adminBrandTextClass)}>{formatVnd(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-none">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Update status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Select
                value={order.orderStatus}
                onValueChange={(v) => handleStatusChange(v as Order["orderStatus"])}
                disabled={allowedNextStatuses.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={order.orderStatus}>
                    {ORDER_STATUS_LABELS[order.orderStatus]} (current)
                  </SelectItem>
                  {allowedNextStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="size-4 text-muted-foreground" aria-hidden />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-sm">
              <div>
                <p className="text-muted-foreground">Recipient</p>
                <p className="font-medium">{order.recipientName}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{order.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{order.addressDetail}</p>
                <p className="text-muted-foreground">{order.wardName}</p>
                <p className="text-muted-foreground">{order.provinceName}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="size-4 text-muted-foreground" aria-hidden />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6 text-sm">
              <div>
                <p className="text-muted-foreground">Method</p>
                <p className="font-medium">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={order.paymentStatus === "PAID" ? "default" : "secondary"}>
                  {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPage>
  )
}
```

Dropped: the `customerEmail`/`note`/`trackingNumber` display blocks — the real `Order` DTO doesn't carry a customer email (only shipping contact info) or a tracking number (Phase 2 concern), and `note` isn't populated by checkout yet.

- [ ] **Step 4: Manual verification**

Log in as an admin, go to `/admin/orders` — confirm the real order(s) from earlier tasks appear, with correct totals/status. Open one, change its status through an allowed transition (e.g. PENDING → CONFIRMED), confirm it persists on reload. Try cancelling the underlying order as the customer first (via `/account/orders` if a cancel action is wired, or via the `POST /orders/:id/cancel` curl from backend Task 23) and confirm the admin page then shows it as CANCELLED with no further transitions offered.

- [ ] **Step 5: Commit**

```bash
cd front-end
git add src/lib/admin/realOrderStatus.ts src/pages/admin/OrdersList.tsx src/pages/admin/OrderDetail.tsx
git commit -m "feat: wire admin order pages to real order API"
```

---

### Task 32: Full manual end-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Start both servers**

```bash
cd back-end && npm run dev
```

```bash
cd front-end && npm run dev
```

- [ ] **Step 2: Walk the full flow in a browser**

1. Log in as a seeded regular user.
2. Since the storefront isn't wired to real products yet (Part B intro), seed a cart item via curl (backend Task 15's example) using a real seeded `ProductVariant` id.
3. Go to `/cart` — confirm the real item shows with live price; toggle its selection, change quantity.
4. Go to `/account/addresses` — add a new address using the province/ward pickers (sample data from Task 7).
5. Go to `/checkout` — confirm the selected item, the address just added, and the computed total show. Click "Place order" with COD selected.
6. Confirm the success toast shows a real order number and you land on `/account/orders`, where the new order appears.
7. Copy the order number and the address's phone number, go to `/track-order`, and confirm the public tracking view renders correctly.
8. Log out, log in as an admin user, go to `/admin/orders` — confirm the order appears; open it and advance its status (e.g. PENDING → CONFIRMED → SHIPPED → DELIVERED), confirming each transition persists.
9. As the regular user again, attempt `POST /orders/:id/cancel` via curl on a still-cancellable order and confirm stock is restored (check the variant's `stockQuantity` via the admin products API).

- [ ] **Step 3: Record the result**

If every step above works, Phase 1 is functionally complete. Note any deviations found during this walkthrough as follow-up items rather than silently patching around them.
