# Checkout Phase 1 (Cart, Order & COD Checkout) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a fully working, testable vertical slice of checkout: real Cart API, VN address book, VN province/ward reference data, idempotent COD checkout, order/payment/shipment status tracking, and the existing mock front-end pages wired to real APIs.

**Architecture:** Backend follows the existing `back-end/src/modules/<name>/*.routes|controller|service|repo|validation|types.ts` layering (Express + Prisma/MySQL). New Prisma models (`Order`, `OrderItem`, `Province`, `Ward`) and enums are added alongside a modified `Address`. Idempotency uses the existing soft-fail `~/lib/redis` wrapper. Frontend gets five new `apis/*.ts` modules and eight existing mock pages rewired to them.

**Tech Stack:** Express 5, TypeScript, Prisma 7 (MySQL/MariaDB), Redis (optional/soft-fail), Zod v4, Vitest (new — no test framework exists yet), React 19, React Router 7, Zustand, Axios.

**Spec:** `docs/superpowers/specs/2026-09-04-checkout-phase1-design.md` — read this first for the full rationale; this plan does not repeat the "why", only the "how".

> **Note on this file's history:** this exact path was briefly overwritten mid-session by a concurrent Claude Code session working in the same repo directory. That session has been stopped; this is the authoritative version, matching the approved spec (real VN location data fetched from `provinces.open-api.vn` v2 — not a hand-written sample).

---

## Before you start

- No backend test framework exists today (verified: no jest/vitest/mocha in `back-end/package.json`, no `tests/` content). Task 1 sets up Vitest.
- No frontend test framework exists either. Frontend verification in this plan is manual, in-browser (see the final task) — do not claim it works without actually clicking through it.
- Scaling decision vs. the spec: the spec's "Testing" section calls for an "integration-style test against a real test database" for the checkout transaction rollback. Standing up a dedicated test MySQL instance/CI pipeline is out of scope for this feature (it's infrastructure, not checkout logic). Instead, the Checkout task tests transaction-rollback *wiring* (errors thrown inside `prisma.$transaction` propagate uncaught, so Prisma/MySQL's own rollback applies) using a mocked `prisma.$transaction`, and all business-rule tests (stock, discount, idempotency, cancellation) run as service-level unit tests with the repo layer mocked. This is a deliberate, disclosed scope reduction — flag it in the plan review if you disagree.
- Run every `git commit` step from the repo root unless told otherwise. `back-end/` and `front-end/` are separate `package.json` roots — `cd` into the right one before running `npm` commands.
- **Before starting work, check `git status` and `ListAgents`/ask the user whether any other Claude Code session is active in this same working directory.** This plan's own file was clobbered once already by a concurrent session; if another session might be touching the same files, coordinate before writing.

## File Structure

**Backend — new files:**
```
back-end/vitest.config.ts
back-end/src/core/http/errorCodes.ts
back-end/src/utils/orderNumber.ts
back-end/prisma/data/vn-locations.json
back-end/prisma/scripts/fetchVnLocations.ts
back-end/prisma/scripts/seedLocations.ts
back-end/src/modules/locations/{location.types,location.repo,location.service,location.controller,location.routes}.ts
back-end/src/modules/addresses/{address.types,address.validation,address.repo,address.service,address.controller,address.routes}.ts
back-end/src/modules/cart/{cart.types,cart.validation,cart.mapper,cart.repo,cart.service,cart.controller,cart.routes}.ts
back-end/src/modules/checkout/{checkout.types,checkout.validation,checkout.idempotency,checkout.repo,checkout.service,checkout.controller,checkout.routes}.ts
back-end/src/modules/orders/{order.types,order.mapper,order.repo,order.service,order.controller,order.routes,admin-order.controller,admin-order.routes,order.validation}.ts
back-end/tests/modules/**/*.test.ts (mirrors the module tree above)
back-end/tests/core/http/errorHandler.test.ts
```

**Backend — modified files:** `prisma/schema.prisma`, `src/core/http/ApiError.ts`, `src/core/http/errorHandler.ts`, `src/config/env.ts`, `.env.example`, `src/routes/index.ts`, `package.json` (test scripts + vitest devDependency).

**Frontend — new files:**
```
front-end/src/apis/{locationApi,addressApi,cartApi,checkoutApi,orderApi}.ts
front-end/src/types/order.ts
```

**Frontend — modified files:** `src/pages/Cart.tsx`, `src/pages/ProductDetail.tsx`, `src/pages/Checkout.tsx`, `src/pages/account/AccountAddresses.tsx`, `src/pages/account/AccountOrders.tsx`, `src/pages/TrackOrder.tsx`, `src/pages/admin/OrdersList.tsx`, `src/pages/admin/OrderDetail.tsx`, `src/types/admin/index.ts`, `src/lib/admin/ui.ts`, `src/components/admin/OrderStatusBadge.tsx`, `src/components/checkout/CheckoutPaymentSection.tsx`, `src/stores/adminStore.ts`.

---

# Part A — Backend Foundation

### Task 1: Add Vitest test framework

**Files:**
- Create: `back-end/vitest.config.ts`
- Modify: `back-end/package.json`
- Test: `back-end/tests/core/http/ApiError.test.ts`

- [ ] **Step 1: Install vitest**

Run: `cd back-end && npm install -D vitest`
Expected: `vitest` added to `devDependencies` in `back-end/package.json`.

- [ ] **Step 2: Create the Vitest config with the `~/*` alias**

```ts
// back-end/vitest.config.ts
import path from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globals: false,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
})
```

- [ ] **Step 3: Add test scripts to `back-end/package.json`**

Add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write a smoke-test for the existing `ApiError` to confirm the harness works**

```ts
// back-end/tests/core/http/ApiError.test.ts
import { describe, expect, it } from 'vitest'

import { ApiError } from '~/core/http/ApiError'

describe('ApiError', () => {
  it('builds a 404 with the given message', () => {
    const err = ApiError.NotFound('Product not found')
    expect(err.statusCode).toBe(404)
    expect(err.message).toBe('Product not found')
  })
})
```

- [ ] **Step 5: Run it**

Run: `cd back-end && npm test`
Expected: `1 passed` (this proves the `~/*` alias resolves and TS-via-Vitest works before we build anything on top of it).

- [ ] **Step 6: Commit**

```bash
git add back-end/package.json back-end/package-lock.json back-end/vitest.config.ts back-end/tests/core/http/ApiError.test.ts
git commit -m "test: add vitest test framework to back-end"
```

---

### Task 2: Add machine-readable `code` to `ApiError` and `errorHandler`

**Files:**
- Modify: `back-end/src/core/http/ApiError.ts`
- Modify: `back-end/src/core/http/errorHandler.ts`
- Create: `back-end/src/core/http/errorCodes.ts`
- Test: `back-end/tests/core/http/errorHandler.test.ts`

- [ ] **Step 1: Write the failing test for `errorHandler` serializing `code`**

```ts
// back-end/tests/core/http/errorHandler.test.ts
import { describe, expect, it, vi } from 'vitest'

import { ApiError } from '~/core/http/ApiError'
import { errorHandler } from '~/core/http/errorHandler'

function mockRes() {
  const res: { statusCode?: number; body?: unknown; status: (c: number) => typeof res; json: (b: unknown) => typeof res } = {
    status(code: number) {
      res.statusCode = code
      return res
    },
    json(body: unknown) {
      res.body = body
      return res
    },
  }
  return res
}

describe('errorHandler', () => {
  it('serializes the ApiError code when present', () => {
    const res = mockRes()
    errorHandler(
      ApiError.Conflict('Insufficient stock', { variantId: 'v1' }, 'INSUFFICIENT_STOCK'),
      {} as never,
      res as never,
      vi.fn(),
    )
    expect(res.statusCode).toBe(409)
    expect(res.body).toEqual({
      message: 'Insufficient stock',
      code: 'INSUFFICIENT_STOCK',
      details: { variantId: 'v1' },
    })
  })

  it('omits code when the ApiError did not set one (backward compatible)', () => {
    const res = mockRes()
    errorHandler(ApiError.NotFound('Product not found'), {} as never, res as never, vi.fn())
    expect(res.body).toEqual({ message: 'Product not found', code: undefined, details: undefined })
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd back-end && npm test -- errorHandler`
Expected: FAIL — `ApiError.Conflict` doesn't accept a 3rd `code` argument yet (TS error) and `errorHandler`'s response has no `code` key.

- [ ] **Step 3: Add `code` to `ApiError`**

```ts
// back-end/src/core/http/ApiError.ts
import { StatusCodes } from 'http-status-codes'

export class ApiError extends Error {
  statusCode: number
  details?: unknown
  code?: string

  constructor(statusCode: number, message: string, details?: unknown, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.details = details
    this.code = code
    Object.setPrototypeOf(this, new.target.prototype)
    Error.captureStackTrace(this, this.constructor)
  }

  static BadRequest(msg = 'Bad Request', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.BAD_REQUEST, msg, details, code)
  }
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
  static NotImplemented(msg = 'Not Implemented', details?: unknown, code?: string) {
    return new ApiError(StatusCodes.NOT_IMPLEMENTED, msg, details, code)
  }
}
```

(Added `NotImplemented` too — the Checkout module needs a 501 for non-COD `paymentMethod`.)

- [ ] **Step 4: Serialize `code` in `errorHandler`**

In `back-end/src/core/http/errorHandler.ts`, change the `ApiError` branch:

```ts
  if (err instanceof ApiError) {
    console.log(err.message);
    return res
      .status(err.statusCode)
      .json({ message: err.message, code: err.code, details: err.details })
  }
```

(Leave the rest of the file — Multer branch, fallback branch — unchanged.)

- [ ] **Step 5: Run the test again to verify it passes**

Run: `cd back-end && npm test -- errorHandler`
Expected: `2 passed`

- [ ] **Step 6: Add the shared error code constants**

```ts
// back-end/src/core/http/errorCodes.ts
export const ErrorCode = {
  CART_EMPTY: 'CART_EMPTY',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  DISCOUNT_INVALID: 'DISCOUNT_INVALID',
  DISCOUNT_EXPIRED: 'DISCOUNT_EXPIRED',
  DISCOUNT_LIMIT_REACHED: 'DISCOUNT_LIMIT_REACHED',
  ADDRESS_NOT_FOUND: 'ADDRESS_NOT_FOUND',
  ORDER_NOT_CANCELLABLE: 'ORDER_NOT_CANCELLABLE',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  LOCATION_NOT_FOUND: 'LOCATION_NOT_FOUND',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]
```

- [ ] **Step 7: Run the full test suite and typecheck**

Run: `cd back-end && npm test && npm run typecheck`
Expected: all tests pass, no type errors.

- [ ] **Step 8: Commit**

```bash
git add back-end/src/core/http/ApiError.ts back-end/src/core/http/errorHandler.ts back-end/src/core/http/errorCodes.ts back-end/tests/core/http/errorHandler.test.ts
git commit -m "feat: add machine-readable error codes to ApiError/errorHandler"
```

---

### Task 3: Prisma schema — Address, CartItem, Order/OrderItem, Province/Ward

**Files:**
- Modify: `back-end/prisma/schema.prisma`

- [ ] **Step 1: Confirm `Address` has no rows (safe to change its columns)**

Run: `cd back-end && node --import tsx -e "import('~/lib/prisma').then(async ({prisma}) => { console.log(await prisma.address.count()); await prisma.\$disconnect() })"`
Expected: `0`. If not `0`, STOP and check with the user before proceeding — this migration drops the `street`/`city` columns.

- [ ] **Step 2: Replace the `Address` model**

Find the existing `model Address { ... }` block and replace it entirely:

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

In the existing `model CartItem { ... }` block, add one field (anywhere before the closing brace, e.g. after `updatedAt`):

```prisma
  selected  Boolean        @default(true)
```

- [ ] **Step 4: Add the new enums and `Order`/`OrderItem` models**

Add these new blocks anywhere after the `Discount*` models (end of file):

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
  shippingFee    Decimal        @default(0) @db.Decimal(12, 2)
  discountAmount Decimal        @default(0) @db.Decimal(12, 2)
  discountCode   String?
  total          Decimal        @db.Decimal(12, 2)

  orderStatus    OrderStatus    @default(PENDING)
  paymentMethod  PaymentMethod
  paymentStatus  PaymentStatus  @default(UNPAID)
  shipmentStatus ShipmentStatus @default(NOT_SHIPPED)

  note           String?        @db.VarChar(500)
  idempotencyKey String?        @unique

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

- [ ] **Step 5: Add the two missing back-relations**

Prisma requires both sides of a relation to be declared. Add:
- On `model User`, alongside the existing `carts Cart[]` line, add: `orders Order[]`
- On `model ProductVariant`, alongside the existing `cartItems CartItem[]` line, add: `orderItems OrderItem[]`

- [ ] **Step 6: Generate and run the migration**

Run: `cd back-end && npx prisma migrate dev --name checkout_phase1_cart_order_address`
Expected: migration created under `prisma/migrations/`, applied to the local dev DB, Prisma Client regenerated into `src/generated/prisma`.

- [ ] **Step 7: Verify the client compiles**

Run: `cd back-end && npm run typecheck`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add back-end/prisma/schema.prisma back-end/prisma/migrations
git commit -m "feat(db): add Order/OrderItem/Province/Ward models, VN address fields, CartItem.selected"
```

---

### Task 4: Order number generator

**Files:**
- Create: `back-end/src/utils/orderNumber.ts`
- Test: `back-end/tests/utils/orderNumber.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// back-end/tests/utils/orderNumber.test.ts
import { describe, expect, it } from 'vitest'

import { generateOrderNumber } from '~/utils/orderNumber'

describe('generateOrderNumber', () => {
  it('matches ORD-YYYYMMDD-XXXXXXXX', () => {
    const orderNumber = generateOrderNumber()
    expect(orderNumber).toMatch(/^ORD-\d{8}-[0-9A-F]{8}$/)
  })

  it('generates distinct values on successive calls', () => {
    const a = generateOrderNumber()
    const b = generateOrderNumber()
    expect(a).not.toBe(b)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd back-end && npm test -- orderNumber`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// back-end/src/utils/orderNumber.ts
import { newId } from '~/utils/id'

/** Human-readable order code: ORD-YYYYMMDD-XXXXXXXX (last 8 hex chars of a UUIDv7). */
export function generateOrderNumber(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const suffix = newId().replace(/-/g, '').slice(-8).toUpperCase()
  return `ORD-${y}${m}${d}-${suffix}`
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd back-end && npm test -- orderNumber`
Expected: `2 passed`

- [ ] **Step 5: Commit**

```bash
git add back-end/src/utils/orderNumber.ts back-end/tests/utils/orderNumber.test.ts
git commit -m "feat: add order number generator"
```

---

### Task 5: VN province/ward reference data — fetch snapshot + seed script

**Files:**
- Create: `back-end/prisma/scripts/fetchVnLocations.ts`
- Create: `back-end/prisma/data/vn-locations.json` (generated by running the script below, not hand-written)
- Create: `back-end/prisma/scripts/seedLocations.ts`
- Modify: `back-end/package.json`

- [ ] **Step 1: Write the fetch script**

This hits the live `provinces.open-api.vn` v2 API (post-July-2025 structure, verified shape: `GET /api/v2/p/` returns provinces with an empty `wards` array; `GET /api/v2/p/{code}?depth=2` returns one province with its `wards` populated as `{code, name, division_type, codename, province_code}`). It fetches the province list once, then each province's wards, and writes a normalized snapshot.

```ts
// back-end/prisma/scripts/fetchVnLocations.ts
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const BASE_URL = 'https://provinces.open-api.vn/api/v2'
const OUTPUT_PATH = path.resolve(import.meta.dirname, '../data/vn-locations.json')

type RawProvince = {
  code: number
  name: string
}

type RawProvinceWithWards = RawProvince & {
  wards: Array<{ code: number; name: string }>
}

type LocationSnapshot = {
  provinces: Array<{
    code: string
    name: string
    wards: Array<{ code: string; name: string }>
  }>
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${url} (${res.status})`)
  return res.json() as Promise<T>
}

async function main() {
  const provinces = await fetchJson<RawProvince[]>(`${BASE_URL}/p/`)
  console.log(`Fetched ${provinces.length} provinces — fetching wards for each...`)

  const snapshot: LocationSnapshot = { provinces: [] }

  for (const province of provinces) {
    const detail = await fetchJson<RawProvinceWithWards>(`${BASE_URL}/p/${province.code}?depth=2`)
    snapshot.provinces.push({
      code: String(detail.code),
      name: detail.name,
      wards: detail.wards.map((w) => ({ code: String(w.code), name: w.name })),
    })
    console.log(`  ${detail.name}: ${detail.wards.length} wards`)
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2))
  console.log(`\nWrote ${snapshot.provinces.length} provinces to ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 2: Run it to generate the snapshot**

Run: `cd back-end && node --import tsx prisma/scripts/fetchVnLocations.ts`
Expected: prints progress for ~34 provinces, ends with `Wrote 34 provinces to .../vn-locations.json`. **Inspect the resulting file**: confirm it has ~34 top-level provinces and that ward counts are non-zero and plausible (a few dozen to a few hundred per province). If the API's shape has drifted since this plan was written (e.g. `wards` empty even with `depth=2`, or a different field name), fix the script to match what you actually observe before proceeding — don't seed empty data.

- [ ] **Step 3: Write the seed script**

```ts
// back-end/prisma/scripts/seedLocations.ts
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { prisma } from '~/lib/prisma'

const DATA_PATH = path.resolve(import.meta.dirname, '../data/vn-locations.json')

type LocationSnapshot = {
  provinces: Array<{
    code: string
    name: string
    wards: Array<{ code: string; name: string }>
  }>
}

async function seedLocations() {
  const snapshot: LocationSnapshot = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))

  let provinceCount = 0
  let wardCount = 0

  for (const province of snapshot.provinces) {
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

  console.log(`Seeded ${provinceCount} provinces and ${wardCount} wards`)
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

- [ ] **Step 4: Add an npm script and run the seed**

Add to `back-end/package.json` `"scripts"`: `"db:seed-locations": "node --import tsx prisma/scripts/seedLocations.ts"`

Run: `cd back-end && npm run db:seed-locations`
Expected: `Seeded 34 provinces and N wards` (N in the low thousands).

- [ ] **Step 5: Spot-check in the DB**

Run `npx prisma studio` and check the `Province`/`Ward` tables visually, or query counts directly.
Expected: province count 34, ward count in the low thousands, non-zero.

- [ ] **Step 6: Commit**

```bash
git add back-end/prisma/scripts/fetchVnLocations.ts back-end/prisma/scripts/seedLocations.ts back-end/prisma/data/vn-locations.json back-end/package.json
git commit -m "feat(db): seed VN province/ward reference data from provinces.open-api.vn v2"
```

---

# Part B — Location & Address APIs

### Task 6: Location module (public, read-only)

**Files:**
- Create: `back-end/src/modules/locations/location.types.ts`
- Create: `back-end/src/modules/locations/location.repo.ts`
- Create: `back-end/src/modules/locations/location.service.ts`
- Create: `back-end/src/modules/locations/location.controller.ts`
- Create: `back-end/src/modules/locations/location.routes.ts`
- Modify: `back-end/src/routes/index.ts`
- Test: `back-end/tests/modules/locations/location.service.test.ts`

- [ ] **Step 1: Types**

```ts
// back-end/src/modules/locations/location.types.ts
export type ProvinceDto = {
  code: string
  name: string
}

export type WardDto = {
  code: string
  name: string
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
    return prisma.ward.findMany({
      where: { provinceCode },
      orderBy: { name: 'asc' },
    })
  },

  async findWard(code: string) {
    return prisma.ward.findUnique({ where: { code } })
  },
}
```

- [ ] **Step 3: Write the failing service test**

```ts
// back-end/tests/modules/locations/location.service.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '~/core/http/ApiError'
import { LocationRepo } from '~/modules/locations/location.repo'
import { LocationService } from '~/modules/locations/location.service'

vi.mock('~/modules/locations/location.repo')

describe('LocationService.listWards', () => {
  beforeEach(() => vi.resetAllMocks())

  it('returns wards when the province exists', async () => {
    vi.mocked(LocationRepo.findProvince).mockResolvedValue({ code: '1', name: 'Hà Nội' } as never)
    vi.mocked(LocationRepo.listWardsByProvince).mockResolvedValue([
      { code: '4', name: 'Phường Ba Đình', provinceCode: '1' } as never,
    ])

    const wards = await LocationService.listWards('1')
    expect(wards).toEqual([{ code: '4', name: 'Phường Ba Đình' }])
  })

  it('throws LOCATION_NOT_FOUND for an unknown province', async () => {
    vi.mocked(LocationRepo.findProvince).mockResolvedValue(null)
    await expect(LocationService.listWards('999')).rejects.toMatchObject({
      statusCode: 404,
      code: 'LOCATION_NOT_FOUND',
    })
  })
})
```

- [ ] **Step 4: Run to verify it fails**

Run: `cd back-end && npm test -- location.service`
Expected: FAIL — `LocationService` doesn't exist yet.

- [ ] **Step 5: Implement the service**

```ts
// back-end/src/modules/locations/location.service.ts
import { ApiError } from '~/core/http/ApiError'
import { ErrorCode } from '~/core/http/errorCodes'
import { LocationRepo } from '~/modules/locations/location.repo'
import type { ProvinceDto, WardDto } from '~/modules/locations/location.types'

export const LocationService = {
  async listProvinces(): Promise<ProvinceDto[]> {
    const provinces = await LocationRepo.listProvinces()
    return provinces.map((p) => ({ code: p.code, name: p.name }))
  },

  async listWards(provinceCode: string): Promise<WardDto[]> {
    const province = await LocationRepo.findProvince(provinceCode)
    if (!province) {
      throw ApiError.NotFound('Province not found', { provinceCode }, ErrorCode.LOCATION_NOT_FOUND)
    }
    const wards = await LocationRepo.listWardsByProvince(provinceCode)
    return wards.map((w) => ({ code: w.code, name: w.name }))
  },
}
```

- [ ] **Step 6: Run to verify it passes**

Run: `cd back-end && npm test -- location.service`
Expected: `2 passed`

- [ ] **Step 7: Controller + routes**

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

```ts
// back-end/src/modules/locations/location.routes.ts
import { Router } from 'express'

import { asyncHandler } from '~/core/asyncHandler'
import { LocationController } from '~/modules/locations/location.controller'

const r = Router()

// Public, read-only — no auth required.
r.get('/provinces', asyncHandler(LocationController.listProvinces))
r.get('/provinces/:code/wards', asyncHandler(LocationController.listWards))

export default r
```

- [ ] **Step 8: Wire into `routes/index.ts`**

Add the import and mount alongside the others:
```ts
import locationRoutes from '~/modules/locations/location.routes'
// ...
router.use('/locations', locationRoutes)
```

- [ ] **Step 9: Manual smoke test against the running server**

Run: `cd back-end && npm run dev` (in one terminal), then in another:
`curl http://localhost:3000/api/locations/provinces | head -c 300`
Expected: a JSON array of `{code, name}` starting with an actual province. Then `curl http://localhost:3000/api/locations/provinces/1/wards | head -c 300` returns a non-empty array (adjust `1` to whatever code your seeded data actually uses for a real province — check via the provinces call above).

- [ ] **Step 10: Commit**

```bash
git add back-end/src/modules/locations back-end/src/routes/index.ts back-end/tests/modules/locations
git commit -m "feat: add public VN location (province/ward) API"
```

---

### Task 7: Address module

**Files:**
- Create: `back-end/src/modules/addresses/address.types.ts`
- Create: `back-end/src/modules/addresses/address.validation.ts`
- Create: `back-end/src/modules/addresses/address.repo.ts`
- Create: `back-end/src/modules/addresses/address.service.ts`
- Create: `back-end/src/modules/addresses/address.controller.ts`
- Create: `back-end/src/modules/addresses/address.routes.ts`
- Modify: `back-end/src/routes/index.ts`
- Test: `back-end/tests/modules/addresses/address.service.test.ts`

- [ ] **Step 1: Types**

```ts
// back-end/src/modules/addresses/address.types.ts
export type CreateAddressInput = {
  label?: string
  recipientName: string
  phone: string
  provinceCode: string
  wardCode: string
  detail: string
  isDefault?: boolean
}

export type UpdateAddressInput = Partial<CreateAddressInput>
```

- [ ] **Step 2: Validation**

VN phone regex covers current mobile prefixes (3/5/7/8/9) plus the `+84` form, per the spec.

```ts
// back-end/src/modules/addresses/address.validation.ts
import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/

const addressBodySchema = z.object({
  label: z.string().trim().max(50).optional(),
  recipientName: z.string().trim().min(1).max(255),
  phone: z.string().trim().regex(VN_PHONE_REGEX, 'Invalid Vietnamese phone number'),
  provinceCode: z.string().trim().min(1),
  wardCode: z.string().trim().min(1),
  detail: z.string().trim().min(1).max(500),
  isDefault: z.boolean().optional(),
})

const patchAddressBodySchema = addressBodySchema.partial().superRefine((data, ctx) => {
  if (Object.keys(data).length === 0) {
    ctx.addIssue({ code: 'custom', message: 'At least one field is required', path: [] })
  }
})

const idParamsSchema = z.object({ id: z.string().trim().min(1) })

export const CreateAddressSchema = z.object({
  body: addressBodySchema,
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})

export const UpdateAddressSchema = z.object({
  body: patchAddressBodySchema,
  query: ZodEmptyObject,
  params: idParamsSchema,
})

export const AddressIdSchema = z.object({
  body: ZodEmptyObject,
  query: ZodEmptyObject,
  params: idParamsSchema,
})
```

- [ ] **Step 3: Repo**

```ts
// back-end/src/modules/addresses/address.repo.ts
import { prisma } from '~/lib/prisma'
import { newId } from '~/utils/id'
import type { CreateAddressInput, UpdateAddressInput } from '~/modules/addresses/address.types'

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

export const AddressRepo = {
  async list(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    })
  },

  async findOwned(id: string, userId: string) {
    return prisma.address.findFirst({ where: { id, userId } })
  },

  async countByUser(userId: string) {
    return prisma.address.count({ where: { userId } })
  },

  async clearDefaultForUser(tx: Tx, userId: string, exceptId?: string) {
    await tx.address.updateMany({
      where: { userId, ...(exceptId ? { id: { not: exceptId } } : {}) },
      data: { isDefault: false },
    })
  },

  async create(
    tx: Tx,
    userId: string,
    provinceName: string,
    wardName: string,
    input: CreateAddressInput,
  ) {
    return tx.address.create({
      data: {
        id: newId(),
        userId,
        label: input.label,
        recipientName: input.recipientName,
        phone: input.phone,
        provinceCode: input.provinceCode,
        provinceName,
        wardCode: input.wardCode,
        wardName,
        detail: input.detail,
        isDefault: Boolean(input.isDefault),
      },
    })
  },

  async update(
    tx: Tx,
    id: string,
    data: UpdateAddressInput & { provinceName?: string; wardName?: string },
  ) {
    return tx.address.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.address.delete({ where: { id } })
  },

  async promoteMostRecentlyUpdated(tx: Tx, userId: string) {
    const next = await tx.address.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })
    if (next) {
      await tx.address.update({ where: { id: next.id }, data: { isDefault: true } })
    }
  },
}
```

- [ ] **Step 4: Write the failing service tests (single-default enforcement is the risky part)**

```ts
// back-end/tests/modules/addresses/address.service.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AddressRepo } from '~/modules/addresses/address.repo'
import { AddressService } from '~/modules/addresses/address.service'
import { LocationRepo } from '~/modules/locations/location.repo'

vi.mock('~/modules/addresses/address.repo')
vi.mock('~/modules/locations/location.repo')
vi.mock('~/lib/prisma', () => ({
  prisma: { $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn({})) },
}))

describe('AddressService.create', () => {
  beforeEach(() => vi.resetAllMocks())

  it('validates province/ward exist and the ward belongs to the province', async () => {
    vi.mocked(LocationRepo.findProvince).mockResolvedValue({ code: 'p1', name: 'Hà Nội' } as never)
    vi.mocked(LocationRepo.findWard).mockResolvedValue({
      code: 'w1',
      name: 'Phường Ba Đình',
      provinceCode: 'OTHER_PROVINCE',
    } as never)

    await expect(
      AddressService.create('user-1', {
        recipientName: 'A',
        phone: '0912345678',
        provinceCode: 'p1',
        wardCode: 'w1',
        detail: '1 Đường A',
      }),
    ).rejects.toMatchObject({ statusCode: 404, code: 'LOCATION_NOT_FOUND' })
  })

  it('makes the first address for a user default even if isDefault is not passed', async () => {
    vi.mocked(LocationRepo.findProvince).mockResolvedValue({ code: 'p1', name: 'Hà Nội' } as never)
    vi.mocked(LocationRepo.findWard).mockResolvedValue({
      code: 'w1',
      name: 'Phường Ba Đình',
      provinceCode: 'p1',
    } as never)
    vi.mocked(AddressRepo.countByUser).mockResolvedValue(0)
    vi.mocked(AddressRepo.create).mockResolvedValue({ id: 'addr-1', isDefault: true } as never)

    await AddressService.create('user-1', {
      recipientName: 'A',
      phone: '0912345678',
      provinceCode: 'p1',
      wardCode: 'w1',
      detail: '1 Đường A',
    })

    expect(AddressRepo.clearDefaultForUser).toHaveBeenCalledWith(expect.anything(), 'user-1', undefined)
    expect(AddressRepo.create).toHaveBeenCalledWith(
      expect.anything(),
      'user-1',
      'Hà Nội',
      'Phường Ba Đình',
      expect.objectContaining({ isDefault: true }),
    )
  })
})

describe('AddressService.setAsDefault', () => {
  beforeEach(() => vi.resetAllMocks())

  it('clears every other address before setting the target as default', async () => {
    vi.mocked(AddressRepo.findOwned).mockResolvedValue({ id: 'addr-2', userId: 'user-1' } as never)

    await AddressService.setAsDefault('addr-2', 'user-1')

    expect(AddressRepo.clearDefaultForUser).toHaveBeenCalledWith(expect.anything(), 'user-1', 'addr-2')
    expect(AddressRepo.update).toHaveBeenCalledWith(expect.anything(), 'addr-2', { isDefault: true })
  })

  it('throws ADDRESS_NOT_FOUND for an address owned by someone else', async () => {
    vi.mocked(AddressRepo.findOwned).mockResolvedValue(null)
    await expect(AddressService.setAsDefault('addr-2', 'user-1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'ADDRESS_NOT_FOUND',
    })
  })
})
```

- [ ] **Step 5: Run to verify failure, then implement the service**

Run: `cd back-end && npm test -- address.service` → FAIL (module doesn't exist).

```ts
// back-end/src/modules/addresses/address.service.ts
import { ApiError } from '~/core/http/ApiError'
import { ErrorCode } from '~/core/http/errorCodes'
import { prisma } from '~/lib/prisma'
import { AddressRepo } from '~/modules/addresses/address.repo'
import { LocationRepo } from '~/modules/locations/location.repo'
import type { CreateAddressInput, UpdateAddressInput } from '~/modules/addresses/address.types'

async function resolveLocationNames(provinceCode: string, wardCode: string) {
  const province = await LocationRepo.findProvince(provinceCode)
  if (!province) {
    throw ApiError.NotFound('Province not found', { provinceCode }, ErrorCode.LOCATION_NOT_FOUND)
  }
  const ward = await LocationRepo.findWard(wardCode)
  if (!ward || ward.provinceCode !== provinceCode) {
    throw ApiError.NotFound(
      'Ward not found for this province',
      { provinceCode, wardCode },
      ErrorCode.LOCATION_NOT_FOUND,
    )
  }
  return { provinceName: province.name, wardName: ward.name }
}

export const AddressService = {
  async list(userId: string) {
    return AddressRepo.list(userId)
  },

  async create(userId: string, input: CreateAddressInput) {
    const { provinceName, wardName } = await resolveLocationNames(input.provinceCode, input.wardCode)
    const existingCount = await AddressRepo.countByUser(userId)
    const shouldBeDefault = existingCount === 0 || Boolean(input.isDefault)

    return prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await AddressRepo.clearDefaultForUser(tx, userId, undefined)
      }
      return AddressRepo.create(tx, userId, provinceName, wardName, {
        ...input,
        isDefault: shouldBeDefault,
      })
    })
  },

  async update(id: string, userId: string, input: UpdateAddressInput) {
    const existing = await AddressRepo.findOwned(id, userId)
    if (!existing) throw ApiError.NotFound('Address not found', { id }, ErrorCode.ADDRESS_NOT_FOUND)

    let provinceName: string | undefined
    let wardName: string | undefined
    if (input.provinceCode || input.wardCode) {
      const resolved = await resolveLocationNames(
        input.provinceCode ?? existing.provinceCode,
        input.wardCode ?? existing.wardCode,
      )
      provinceName = resolved.provinceName
      wardName = resolved.wardName
    }

    return prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await AddressRepo.clearDefaultForUser(tx, userId, id)
      }
      return AddressRepo.update(tx, id, { ...input, provinceName, wardName })
    })
  },

  async setAsDefault(id: string, userId: string) {
    const existing = await AddressRepo.findOwned(id, userId)
    if (!existing) throw ApiError.NotFound('Address not found', { id }, ErrorCode.ADDRESS_NOT_FOUND)

    return prisma.$transaction(async (tx) => {
      await AddressRepo.clearDefaultForUser(tx, userId, id)
      return AddressRepo.update(tx, id, { isDefault: true })
    })
  },

  async remove(id: string, userId: string) {
    const existing = await AddressRepo.findOwned(id, userId)
    if (!existing) throw ApiError.NotFound('Address not found', { id }, ErrorCode.ADDRESS_NOT_FOUND)

    await AddressRepo.delete(id)

    if (existing.isDefault) {
      await prisma.$transaction(async (tx) => {
        await AddressRepo.promoteMostRecentlyUpdated(tx, userId)
      })
    }

    return { id }
  },
}
```

- [ ] **Step 6: Run to verify it passes**

Run: `cd back-end && npm test -- address.service`
Expected: `4 passed`

- [ ] **Step 7: Controller + routes**

```ts
// back-end/src/modules/addresses/address.controller.ts
import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import { AddressService } from '~/modules/addresses/address.service'
import type { CreateAddressInput, UpdateAddressInput } from '~/modules/addresses/address.types'

export const AddressController = {
  list: async (req: AuthRequest, res: Response) => {
    const addresses = await AddressService.list(req.user!.id)
    return res.json(addresses)
  },
  create: async (req: AuthRequest, res: Response) => {
    const address = await AddressService.create(req.user!.id, req.body as CreateAddressInput)
    return res.status(201).json(address)
  },
  update: async (req: AuthRequest, res: Response) => {
    const address = await AddressService.update(
      String(req.params.id),
      req.user!.id,
      req.body as UpdateAddressInput,
    )
    return res.json(address)
  },
  setDefault: async (req: AuthRequest, res: Response) => {
    const address = await AddressService.setAsDefault(String(req.params.id), req.user!.id)
    return res.json(address)
  },
  remove: async (req: AuthRequest, res: Response) => {
    const result = await AddressService.remove(String(req.params.id), req.user!.id)
    return res.json(result)
  },
}
```

```ts
// back-end/src/modules/addresses/address.routes.ts
import { Router } from 'express'

import { authenticate } from '~/core/auth/auth.middleware'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { AddressController } from '~/modules/addresses/address.controller'
import {
  AddressIdSchema,
  CreateAddressSchema,
  UpdateAddressSchema,
} from '~/modules/addresses/address.validation'

const r = Router()

r.use(authenticate)

r.get('/', asyncHandler(AddressController.list))
r.post('/', validateRequest(CreateAddressSchema), asyncHandler(AddressController.create))
r.patch('/:id', validateRequest(UpdateAddressSchema), asyncHandler(AddressController.update))
r.patch('/:id/default', validateRequest(AddressIdSchema), asyncHandler(AddressController.setDefault))
r.delete('/:id', validateRequest(AddressIdSchema), asyncHandler(AddressController.remove))

export default r
```

- [ ] **Step 8: Wire into `routes/index.ts`**

```ts
import addressRoutes from '~/modules/addresses/address.routes'
// ...
router.use('/addresses', addressRoutes)
```

- [ ] **Step 9: Full backend test run + typecheck**

Run: `cd back-end && npm test && npm run typecheck`
Expected: all green.

- [ ] **Step 10: Commit**

```bash
git add back-end/src/modules/addresses back-end/src/routes/index.ts back-end/tests/modules/addresses
git commit -m "feat: add Address CRUD API with single-default enforcement"
```

---

# Part C — Cart API

### Task 8: Cart module

**Files:**
- Create: `back-end/src/modules/cart/cart.types.ts`
- Create: `back-end/src/modules/cart/cart.validation.ts`
- Create: `back-end/src/modules/cart/cart.mapper.ts`
- Create: `back-end/src/modules/cart/cart.repo.ts`
- Create: `back-end/src/modules/cart/cart.service.ts`
- Create: `back-end/src/modules/cart/cart.controller.ts`
- Create: `back-end/src/modules/cart/cart.routes.ts`
- Modify: `back-end/src/routes/index.ts`
- Test: `back-end/tests/modules/cart/cart.service.test.ts`

- [ ] **Step 1: Types + mapper (DTO shape returned to the client)**

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

export type CartItemDto = {
  id: string
  variantId: string
  productName: string
  variantLabel: string
  imageUrl: string | null
  price: number
  quantity: number
  selected: boolean
  stockQuantity: number
}

export type CartDto = {
  id: string
  countProduct: number
  items: CartItemDto[]
}
```

```ts
// back-end/src/modules/cart/cart.mapper.ts
import type { CartDto, CartItemDto } from '~/modules/cart/cart.types'
import type { CartWithItems } from '~/modules/cart/cart.repo'

export function toCartDto(cart: CartWithItems): CartDto {
  const items: CartItemDto[] = cart.items.map((item) => ({
    id: item.id,
    variantId: item.variantId,
    productName: item.variant.product.name,
    variantLabel: item.variant.options.map((o) => o.optionValue.value).join(' / '),
    imageUrl: item.variant.imgUrl ?? item.variant.product.thumbnail ?? null,
    // Always the live price, never the stored snapshot — the cart is not an order yet.
    price: Number(item.variant.price),
    quantity: item.quantity,
    selected: item.selected,
    stockQuantity: item.variant.stockQuantity,
  }))

  return { id: cart.id, countProduct: cart.countProduct, items }
}
```

- [ ] **Step 2: Repo**

```ts
// back-end/src/modules/cart/cart.repo.ts
import { prisma } from '~/lib/prisma'
import { newId } from '~/utils/id'

const cartItemInclude = {
  variant: {
    include: {
      product: { select: { name: true, thumbnail: true } },
      options: { include: { optionValue: true } },
    },
  },
} as const

const cartInclude = {
  items: { include: cartItemInclude, orderBy: { createdAt: 'asc' as const } },
} as const

export type CartWithItems = Awaited<ReturnType<typeof CartRepo.getOrCreateActiveCart>>

export const CartRepo = {
  async getOrCreateActiveCart(userId: string) {
    const existing = await prisma.cart.findFirst({
      where: { userId, state: 'ACTIVE' },
      include: cartInclude,
    })
    if (existing) return existing

    await prisma.cart.create({
      data: { id: newId(), userId, state: 'ACTIVE' },
    })
    return prisma.cart.findFirstOrThrow({
      where: { userId, state: 'ACTIVE' },
      include: cartInclude,
    })
  },

  async findItem(cartId: string, itemId: string) {
    return prisma.cartItem.findFirst({ where: { id: itemId, cartId } })
  },

  async findItemByVariant(cartId: string, variantId: string) {
    return prisma.cartItem.findUnique({ where: { cartId_variantId: { cartId, variantId } } })
  },

  async findVariant(variantId: string) {
    return prisma.productVariant.findUnique({ where: { id: variantId } })
  },

  /** Recompute countProduct as the number of distinct line items and persist it. */
  async syncCountProduct(cartId: string) {
    const count = await prisma.cartItem.count({ where: { cartId } })
    await prisma.cart.update({ where: { id: cartId }, data: { countProduct: count } })
  },

  async createItem(cartId: string, variantId: string, quantity: number) {
    await prisma.cartItem.create({
      data: { id: newId(), cartId, variantId, quantity, price: 0, name: '', selected: true },
    })
    await this.syncCountProduct(cartId)
  },

  async incrementItemQuantity(itemId: string, by: number) {
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: { increment: by } } })
  },

  async updateItem(itemId: string, data: { quantity?: number; selected?: boolean }) {
    await prisma.cartItem.update({ where: { id: itemId }, data })
  },

  async deleteItem(cartId: string, itemId: string) {
    await prisma.cartItem.delete({ where: { id: itemId } })
    await this.syncCountProduct(cartId)
  },

  async setSelectedForAll(cartId: string, selected: boolean) {
    await prisma.cartItem.updateMany({ where: { cartId }, data: { selected } })
  },
}
```

Note: `CartItem.price`/`.name` are legacy fields from the original schema (a price/name snapshot taken when the item was added). This module deliberately does **not** rely on them for display — `cart.mapper.ts` always reads the live `variant.price`/`product.name` per the spec ("Prices are always re-read live... never trusted from stale storage"). They're set to placeholder values on insert and otherwise ignored; a future cleanup could drop them from the schema, but that's out of scope here since `checkout.service` also ignores them.

- [ ] **Step 3: Write the failing service tests**

```ts
// back-end/tests/modules/cart/cart.service.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '~/core/http/ApiError'
import { CartRepo } from '~/modules/cart/cart.repo'
import { CartService } from '~/modules/cart/cart.service'

vi.mock('~/modules/cart/cart.repo')

describe('CartService.addItem', () => {
  beforeEach(() => vi.resetAllMocks())

  it('rejects when the variant does not exist', async () => {
    vi.mocked(CartRepo.findVariant).mockResolvedValue(null)
    await expect(CartService.addItem('user-1', { variantId: 'v1', quantity: 1 })).rejects.toMatchObject({
      statusCode: 404,
    })
  })

  it('merges quantity when the variant is already in the cart', async () => {
    vi.mocked(CartRepo.findVariant).mockResolvedValue({ id: 'v1', stockQuantity: 10 } as never)
    vi.mocked(CartRepo.getOrCreateActiveCart).mockResolvedValue({ id: 'cart-1' } as never)
    vi.mocked(CartRepo.findItemByVariant).mockResolvedValue({ id: 'item-1', quantity: 2 } as never)

    await CartService.addItem('user-1', { variantId: 'v1', quantity: 3 })

    expect(CartRepo.incrementItemQuantity).toHaveBeenCalledWith('item-1', 3)
    expect(CartRepo.createItem).not.toHaveBeenCalled()
  })

  it('creates a new line item when the variant is not already in the cart', async () => {
    vi.mocked(CartRepo.findVariant).mockResolvedValue({ id: 'v1', stockQuantity: 10 } as never)
    vi.mocked(CartRepo.getOrCreateActiveCart).mockResolvedValue({ id: 'cart-1' } as never)
    vi.mocked(CartRepo.findItemByVariant).mockResolvedValue(null)

    await CartService.addItem('user-1', { variantId: 'v1', quantity: 2 })

    expect(CartRepo.createItem).toHaveBeenCalledWith('cart-1', 'v1', 2)
  })
})
```

- [ ] **Step 4: Run to verify failure, then implement the service**

Run: `cd back-end && npm test -- cart.service` → FAIL.

```ts
// back-end/src/modules/cart/cart.service.ts
import { ApiError } from '~/core/http/ApiError'
import { CartRepo } from '~/modules/cart/cart.repo'
import { toCartDto } from '~/modules/cart/cart.mapper'
import type { AddCartItemInput, UpdateCartItemInput } from '~/modules/cart/cart.types'

export const CartService = {
  async getCart(userId: string) {
    const cart = await CartRepo.getOrCreateActiveCart(userId)
    return toCartDto(cart)
  },

  async addItem(userId: string, input: AddCartItemInput) {
    const variant = await CartRepo.findVariant(input.variantId)
    if (!variant) throw ApiError.NotFound('Product variant not found')

    const cart = await CartRepo.getOrCreateActiveCart(userId)
    const existingItem = await CartRepo.findItemByVariant(cart.id, input.variantId)

    if (existingItem) {
      await CartRepo.incrementItemQuantity(existingItem.id, input.quantity)
    } else {
      await CartRepo.createItem(cart.id, input.variantId, input.quantity)
    }

    const refreshed = await CartRepo.getOrCreateActiveCart(userId)
    return toCartDto(refreshed)
  },

  async updateItem(userId: string, itemId: string, input: UpdateCartItemInput) {
    const cart = await CartRepo.getOrCreateActiveCart(userId)
    const item = await CartRepo.findItem(cart.id, itemId)
    if (!item) throw ApiError.NotFound('Cart item not found')
    if (input.quantity !== undefined && input.quantity < 1) {
      throw ApiError.BadRequest('Quantity must be at least 1')
    }

    await CartRepo.updateItem(itemId, input)

    const refreshed = await CartRepo.getOrCreateActiveCart(userId)
    return toCartDto(refreshed)
  },

  async removeItem(userId: string, itemId: string) {
    const cart = await CartRepo.getOrCreateActiveCart(userId)
    const item = await CartRepo.findItem(cart.id, itemId)
    if (!item) throw ApiError.NotFound('Cart item not found')

    await CartRepo.deleteItem(cart.id, itemId)

    const refreshed = await CartRepo.getOrCreateActiveCart(userId)
    return toCartDto(refreshed)
  },

  async setSelectAll(userId: string, selected: boolean) {
    const cart = await CartRepo.getOrCreateActiveCart(userId)
    await CartRepo.setSelectedForAll(cart.id, selected)

    const refreshed = await CartRepo.getOrCreateActiveCart(userId)
    return toCartDto(refreshed)
  },
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `cd back-end && npm test -- cart.service`
Expected: `3 passed`

- [ ] **Step 6: Validation, controller, routes**

```ts
// back-end/src/modules/cart/cart.validation.ts
import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

export const AddCartItemSchema = z.object({
  body: z.object({
    variantId: z.string().trim().min(1),
    quantity: z.coerce.number().int().min(1),
  }),
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})

export const UpdateCartItemSchema = z.object({
  body: z
    .object({
      quantity: z.coerce.number().int().min(1).optional(),
      selected: z.boolean().optional(),
    })
    .refine((data) => data.quantity !== undefined || data.selected !== undefined, {
      message: 'At least one of quantity or selected is required',
    }),
  query: ZodEmptyObject,
  params: z.object({ id: z.string().trim().min(1) }),
})

export const CartItemIdSchema = z.object({
  body: ZodEmptyObject,
  query: ZodEmptyObject,
  params: z.object({ id: z.string().trim().min(1) }),
})

export const SelectAllSchema = z.object({
  body: z.object({ selected: z.boolean() }),
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})
```

```ts
// back-end/src/modules/cart/cart.controller.ts
import { Response } from 'express'

import { AuthRequest } from '~/core/auth/auth.middleware'
import { CartService } from '~/modules/cart/cart.service'
import type { AddCartItemInput, UpdateCartItemInput } from '~/modules/cart/cart.types'

export const CartController = {
  get: async (req: AuthRequest, res: Response) => {
    return res.json(await CartService.getCart(req.user!.id))
  },
  addItem: async (req: AuthRequest, res: Response) => {
    return res.status(201).json(await CartService.addItem(req.user!.id, req.body as AddCartItemInput))
  },
  updateItem: async (req: AuthRequest, res: Response) => {
    return res.json(
      await CartService.updateItem(req.user!.id, String(req.params.id), req.body as UpdateCartItemInput),
    )
  },
  removeItem: async (req: AuthRequest, res: Response) => {
    return res.json(await CartService.removeItem(req.user!.id, String(req.params.id)))
  },
  selectAll: async (req: AuthRequest, res: Response) => {
    return res.json(await CartService.setSelectAll(req.user!.id, Boolean(req.body.selected)))
  },
}
```

```ts
// back-end/src/modules/cart/cart.routes.ts
import { Router } from 'express'

import { authenticate } from '~/core/auth/auth.middleware'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { CartController } from '~/modules/cart/cart.controller'
import {
  AddCartItemSchema,
  CartItemIdSchema,
  SelectAllSchema,
  UpdateCartItemSchema,
} from '~/modules/cart/cart.validation'

const r = Router()

r.use(authenticate)

r.get('/', asyncHandler(CartController.get))
r.post('/items', validateRequest(AddCartItemSchema), asyncHandler(CartController.addItem))
r.patch('/items/:id', validateRequest(UpdateCartItemSchema), asyncHandler(CartController.updateItem))
r.delete('/items/:id', validateRequest(CartItemIdSchema), asyncHandler(CartController.removeItem))
r.patch('/select-all', validateRequest(SelectAllSchema), asyncHandler(CartController.selectAll))

export default r
```

- [ ] **Step 7: Wire into `routes/index.ts`**

```ts
import cartRoutes from '~/modules/cart/cart.routes'
// ...
router.use('/cart', cartRoutes)
```

- [ ] **Step 8: Full test run + typecheck**

Run: `cd back-end && npm test && npm run typecheck`
Expected: all green.

- [ ] **Step 9: Commit**

```bash
git add back-end/src/modules/cart back-end/src/routes/index.ts back-end/tests/modules/cart
git commit -m "feat: add Cart API (add/update/remove items, select-all, live pricing)"
```

---

# Part D — Checkout & Order APIs

### Task 9: `DEFAULT_SHIPPING_FEE` env var

**Files:**
- Modify: `back-end/src/config/env.ts`
- Modify: `back-end/.env.example`
- Modify: `back-end/.env`

- [ ] **Step 1: Add the env var to the schema**

In `back-end/src/config/env.ts`, add to the `schema` object:
```ts
  // Flat shipping fee (VND) used in Phase 1, before real shipping-provider rates exist (Phase 2).
  DEFAULT_SHIPPING_FEE: z.coerce.number().min(0).default(30000),
```

- [ ] **Step 2: Document it in `.env.example`**

Add:
```
# Checkout (Phase 1 — flat shipping fee until a real shipping provider is integrated)
DEFAULT_SHIPPING_FEE=30000
```

- [ ] **Step 3: Add it to the local `.env`** (same value, or leave unset to use the Zod default)

- [ ] **Step 4: Verify env parsing doesn't break**

Run: `cd back-end && npm run typecheck`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add back-end/src/config/env.ts back-end/.env.example
git commit -m "feat: add DEFAULT_SHIPPING_FEE env var for Phase 1 checkout"
```

(Do not commit `.env` — it's gitignored; verify with `git status` that it doesn't appear staged.)

---

### Task 10: Checkout module (idempotent COD order creation)

This is the highest-risk part of the plan — read the spec's "Checkout API" section again before starting if anything below is unclear.

**Files:**
- Create: `back-end/src/modules/checkout/checkout.types.ts`
- Create: `back-end/src/modules/checkout/checkout.validation.ts`
- Create: `back-end/src/modules/checkout/checkout.idempotency.ts`
- Create: `back-end/src/modules/checkout/checkout.repo.ts`
- Create: `back-end/src/modules/checkout/checkout.service.ts`
- Create: `back-end/src/modules/checkout/checkout.controller.ts`
- Create: `back-end/src/modules/checkout/checkout.routes.ts`
- Modify: `back-end/src/routes/index.ts`
- Test: `back-end/tests/modules/checkout/checkout.service.test.ts`
- Test: `back-end/tests/modules/checkout/checkout.repo.test.ts`

- [ ] **Step 1: Types**

```ts
// back-end/src/modules/checkout/checkout.types.ts
export type CheckoutLineItem = {
  variantId: string
  quantity: number
}

export type CheckoutInput = {
  addressId: string
  paymentMethod: 'cod' | 'online'
  discountCode?: string
  buyNowItem?: CheckoutLineItem
}
```

- [ ] **Step 2: Validation**

```ts
// back-end/src/modules/checkout/checkout.validation.ts
import { z } from 'zod'

import { ZodEmptyObject } from '~/core/validate/validateRequest'

export const CheckoutSchema = z.object({
  body: z.object({
    addressId: z.string().trim().min(1),
    paymentMethod: z.enum(['cod', 'online']),
    discountCode: z.string().trim().min(1).optional(),
    buyNowItem: z
      .object({
        variantId: z.string().trim().min(1),
        quantity: z.coerce.number().int().min(1),
      })
      .optional(),
  }),
  query: ZodEmptyObject,
  params: ZodEmptyObject,
})
```

The `Idempotency-Key` header is read directly in the controller (headers aren't part of this body/query/params validator) and is required — missing it is a 400.

- [ ] **Step 3: Idempotency helper (thin wrapper over the existing soft-fail `~/lib/redis`)**

```ts
// back-end/src/modules/checkout/checkout.idempotency.ts
import { redis } from '~/lib/redis'

const TTL_SECONDS = 60 * 60 * 24 // 24h

function key(userId: string, idempotencyKey: string) {
  return `checkout:idem:${userId}:${idempotencyKey}`
}

export const CheckoutIdempotency = {
  /** Returns the previously created order id for this key, or null if unseen (or Redis is unavailable — soft-fail, see ~/lib/redis). */
  async getOrderId(userId: string, idempotencyKey: string): Promise<string | null> {
    return redis.get(key(userId, idempotencyKey))
  },

  async remember(userId: string, idempotencyKey: string, orderId: string): Promise<void> {
    await redis.set(key(userId, idempotencyKey), orderId, TTL_SECONDS)
  },
}
```

**Known limitation, by design:** `~/lib/redis` no-ops when `REDIS_URL` is unset (see its existing implementation) — in that environment, idempotency dedup silently does not happen (every checkout call creates a fresh order; it doesn't corrupt data, it just won't collapse duplicate submissions). This repo's `.env` already has `REDIS_URL` configured, so dedup is active in this environment; this note is here so nobody is surprised if it's ever unset elsewhere.

- [ ] **Step 4: Repo — the checkout transaction**

```ts
// back-end/src/modules/checkout/checkout.repo.ts
import { ApiError } from '~/core/http/ApiError'
import { ErrorCode } from '~/core/http/errorCodes'
import { env } from '~/config/env'
import { prisma } from '~/lib/prisma'
import { newId } from '~/utils/id'
import { generateOrderNumber } from '~/utils/orderNumber'
import type { CheckoutLineItem } from '~/modules/checkout/checkout.types'

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

const orderInclude = { items: true } as const
export type OrderWithItems = Awaited<ReturnType<typeof prisma.order.findUniqueOrThrow<{ include: typeof orderInclude }>>>

/** Cart-based flow: the caller's ACTIVE cart's selected items. Buy-now flow: the single given item. */
async function resolveLineItems(
  tx: Tx,
  userId: string,
  buyNowItem: CheckoutLineItem | undefined,
): Promise<CheckoutLineItem[]> {
  if (buyNowItem) return [buyNowItem]

  const cart = await tx.cart.findFirst({ where: { userId, state: 'ACTIVE' } })
  if (!cart) return []

  const items = await tx.cartItem.findMany({ where: { cartId: cart.id, selected: true } })
  return items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
}

async function clearConsumedCartItems(tx: Tx, userId: string) {
  const cart = await tx.cart.findFirst({ where: { userId, state: 'ACTIVE' } })
  if (!cart) return

  const deleted = await tx.cartItem.deleteMany({ where: { cartId: cart.id, selected: true } })
  if (deleted.count > 0) {
    await tx.cart.update({ where: { id: cart.id }, data: { countProduct: { decrement: deleted.count } } })
  }
}

function computeDiscountAmount(
  discount: { type: string; value: unknown; maxValue: unknown },
  subtotal: number,
): number {
  const value = Number(discount.value)
  const maxValue = Number(discount.maxValue)
  const raw = discount.type === 'PERCENTAGE' ? (subtotal * value) / 100 : value
  return Math.min(raw, maxValue, subtotal)
}

export const CheckoutRepo = {
  /**
   * Runs the whole checkout as one transaction: resolve items → validate stock
   * → validate/apply discount → compute totals → create Order+OrderItems →
   * decrement stock → bump discount counters → clear consumed cart items.
   * Throwing anywhere inside rolls the whole thing back (native Prisma/MySQL
   * transaction semantics — nothing here catches and swallows an error).
   */
  async runCheckout(params: {
    userId: string
    idempotencyKey: string
    addressId: string
    discountCode?: string
    buyNowItem?: CheckoutLineItem
  }): Promise<OrderWithItems> {
    const address = await prisma.address.findFirst({
      where: { id: params.addressId, userId: params.userId },
    })
    if (!address) {
      throw ApiError.NotFound('Address not found', { addressId: params.addressId }, ErrorCode.ADDRESS_NOT_FOUND)
    }

    return prisma.$transaction(async (tx) => {
      const lineItems = await resolveLineItems(tx, params.userId, params.buyNowItem)
      if (lineItems.length === 0) {
        throw ApiError.BadRequest('Cart is empty', undefined, ErrorCode.CART_EMPTY)
      }

      let subtotal = 0
      const resolvedItems: Array<{
        variantId: string
        quantity: number
        price: number
        productName: string
        variantLabel: string
        imageUrl: string | null
      }> = []

      for (const line of lineItems) {
        const variant = await tx.productVariant.findUnique({
          where: { id: line.variantId },
          include: {
            product: { select: { name: true, thumbnail: true } },
            options: { include: { optionValue: true } },
          },
        })
        if (!variant || variant.stockQuantity < line.quantity) {
          throw ApiError.Conflict(
            `Insufficient stock for variant ${line.variantId}`,
            { variantId: line.variantId },
            ErrorCode.INSUFFICIENT_STOCK,
          )
        }

        const price = Number(variant.price)
        subtotal += price * line.quantity
        resolvedItems.push({
          variantId: line.variantId,
          quantity: line.quantity,
          price,
          productName: variant.product.name,
          variantLabel: variant.options.map((o) => o.optionValue.value).join(' / '),
          imageUrl: variant.imgUrl ?? variant.product.thumbnail ?? null,
        })
      }

      let discountAmount = 0
      let discountId: string | null = null

      if (params.discountCode) {
        const discount = await tx.discount.findUnique({ where: { code: params.discountCode } })
        const now = new Date()

        if (!discount || !discount.isActive) {
          throw ApiError.BadRequest('Discount code is invalid', undefined, ErrorCode.DISCOUNT_INVALID)
        }
        if (now < discount.startDate || now > discount.endDate) {
          throw ApiError.BadRequest('Discount code has expired', undefined, ErrorCode.DISCOUNT_EXPIRED)
        }
        if (subtotal < Number(discount.minOrderValue)) {
          throw ApiError.BadRequest(
            'Order does not meet the minimum value for this discount',
            undefined,
            ErrorCode.DISCOUNT_INVALID,
          )
        }
        if (discount.usesCount >= discount.maxUses) {
          throw ApiError.Conflict('Discount usage limit reached', undefined, ErrorCode.DISCOUNT_LIMIT_REACHED)
        }

        const userUse = await tx.discountUserUse.findUnique({
          where: { discountId_userId: { discountId: discount.id, userId: params.userId } },
        })
        if (userUse && userUse.usesCount >= discount.maxUsesPerUser) {
          throw ApiError.Conflict(
            'You have reached the usage limit for this discount',
            undefined,
            ErrorCode.DISCOUNT_LIMIT_REACHED,
          )
        }

        discountAmount = computeDiscountAmount(discount, subtotal)
        discountId = discount.id
      }

      const shippingFee = env.DEFAULT_SHIPPING_FEE
      const total = Math.max(0, subtotal + shippingFee - discountAmount)
      const orderId = newId()

      await tx.order.create({
        data: {
          id: orderId,
          orderNumber: generateOrderNumber(),
          userId: params.userId,
          recipientName: address.recipientName,
          phone: address.phone,
          provinceName: address.provinceName,
          wardName: address.wardName,
          addressDetail: address.detail,
          subtotal,
          shippingFee,
          discountAmount,
          discountCode: params.discountCode ?? null,
          total,
          paymentMethod: 'COD',
          idempotencyKey: params.idempotencyKey,
          items: {
            create: resolvedItems.map((item) => ({
              id: newId(),
              variantId: item.variantId,
              productName: item.productName,
              variantLabel: item.variantLabel,
              imageUrl: item.imageUrl,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
      })

      for (const item of resolvedItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } },
        })
      }

      if (discountId) {
        await tx.discount.update({ where: { id: discountId }, data: { usesCount: { increment: 1 } } })
        await tx.discountUserUse.upsert({
          where: { discountId_userId: { discountId, userId: params.userId } },
          update: { usesCount: { increment: 1 } },
          create: { discountId, userId: params.userId, usesCount: 1 },
        })
      }

      if (!params.buyNowItem) {
        await clearConsumedCartItems(tx, params.userId)
      }

      return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: orderInclude })
    })
  },

  async findById(id: string) {
    return prisma.order.findUnique({ where: { id }, include: orderInclude })
  },
}
```

- [ ] **Step 5: Write the repo-level rollback test**

This verifies we never accidentally wrap the transaction body in a try/catch that swallows errors — the actual DB rollback is Prisma/MySQL's job, not ours; our job is to not get in its way.

```ts
// back-end/tests/modules/checkout/checkout.repo.test.ts
import { describe, expect, it, vi } from 'vitest'

import { prisma } from '~/lib/prisma'
import { CheckoutRepo } from '~/modules/checkout/checkout.repo'

vi.mock('~/lib/prisma', () => ({
  prisma: {
    address: { findFirst: vi.fn() },
    $transaction: vi.fn(),
  },
}))

describe('CheckoutRepo.runCheckout', () => {
  it('propagates an error thrown mid-transaction instead of swallowing it', async () => {
    vi.mocked(prisma.address.findFirst).mockResolvedValue({
      id: 'addr-1',
      recipientName: 'A',
      phone: '0912345678',
      provinceName: 'Hà Nội',
      wardName: 'Ba Đình',
      detail: '1 Đường A',
    } as never)

    vi.mocked(prisma.$transaction).mockImplementation(async (fn: (tx: unknown) => unknown) => {
      // Simulate Prisma invoking the callback and it throwing partway through —
      // a real $transaction would roll back every write made via `tx` before this point.
      return fn({
        cart: { findFirst: vi.fn().mockResolvedValue(null) },
      } as never)
    })

    await expect(
      CheckoutRepo.runCheckout({
        userId: 'user-1',
        idempotencyKey: 'key-1',
        addressId: 'addr-1',
      }),
    ).rejects.toMatchObject({ code: 'CART_EMPTY' })
  })
})
```

- [ ] **Step 6: Run it**

Run: `cd back-end && npm test -- checkout.repo`
Expected: `1 passed` (confirms the error surfaces uncaught — the meaningful guarantee we can verify without a live DB).

- [ ] **Step 7: Write the failing service tests (business rules — the real value of this task's tests)**

```ts
// back-end/tests/modules/checkout/checkout.service.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CheckoutIdempotency } from '~/modules/checkout/checkout.idempotency'
import { CheckoutRepo } from '~/modules/checkout/checkout.repo'
import { CheckoutService } from '~/modules/checkout/checkout.service'

vi.mock('~/modules/checkout/checkout.repo')
vi.mock('~/modules/checkout/checkout.idempotency')

describe('CheckoutService.checkout', () => {
  beforeEach(() => vi.resetAllMocks())

  it('rejects non-COD payment methods with 501', async () => {
    await expect(
      CheckoutService.checkout('user-1', 'key-1', { addressId: 'a1', paymentMethod: 'online' }),
    ).rejects.toMatchObject({ statusCode: 501 })
    expect(CheckoutRepo.runCheckout).not.toHaveBeenCalled()
  })

  it('short-circuits on a repeated Idempotency-Key and does not re-run the transaction', async () => {
    vi.mocked(CheckoutIdempotency.getOrderId).mockResolvedValue('order-1')
    vi.mocked(CheckoutRepo.findById).mockResolvedValue({ id: 'order-1' } as never)

    const result = await CheckoutService.checkout('user-1', 'key-1', {
      addressId: 'a1',
      paymentMethod: 'cod',
    })

    expect(result).toEqual({ id: 'order-1' })
    expect(CheckoutRepo.runCheckout).not.toHaveBeenCalled()
  })

  it('runs the transaction and remembers the idempotency key on a fresh request', async () => {
    vi.mocked(CheckoutIdempotency.getOrderId).mockResolvedValue(null)
    vi.mocked(CheckoutRepo.runCheckout).mockResolvedValue({ id: 'order-2' } as never)

    const result = await CheckoutService.checkout('user-1', 'key-2', {
      addressId: 'a1',
      paymentMethod: 'cod',
    })

    expect(result).toEqual({ id: 'order-2' })
    expect(CheckoutIdempotency.remember).toHaveBeenCalledWith('user-1', 'key-2', 'order-2')
  })
})
```

- [ ] **Step 8: Run to verify failure, then implement the service**

Run: `cd back-end && npm test -- checkout.service` → FAIL.

```ts
// back-end/src/modules/checkout/checkout.service.ts
import { ApiError } from '~/core/http/ApiError'
import { CheckoutIdempotency } from '~/modules/checkout/checkout.idempotency'
import { CheckoutRepo } from '~/modules/checkout/checkout.repo'
import type { CheckoutInput } from '~/modules/checkout/checkout.types'

export const CheckoutService = {
  async checkout(userId: string, idempotencyKey: string, input: CheckoutInput) {
    if (input.paymentMethod !== 'cod') {
      throw ApiError.NotImplemented('Only COD is supported in this phase')
    }

    const cachedOrderId = await CheckoutIdempotency.getOrderId(userId, idempotencyKey)
    if (cachedOrderId) {
      const existing = await CheckoutRepo.findById(cachedOrderId)
      if (existing) return existing
    }

    const order = await CheckoutRepo.runCheckout({
      userId,
      idempotencyKey,
      addressId: input.addressId,
      discountCode: input.discountCode,
      buyNowItem: input.buyNowItem,
    })

    await CheckoutIdempotency.remember(userId, idempotencyKey, order.id)
    return order
  },
}
```

- [ ] **Step 9: Run to verify it passes**

Run: `cd back-end && npm test -- checkout.service`
Expected: `3 passed`

- [ ] **Step 10: Controller + routes**

```ts
// back-end/src/modules/checkout/checkout.controller.ts
import { Response } from 'express'

import { ApiError } from '~/core/http/ApiError'
import { AuthRequest } from '~/core/auth/auth.middleware'
import { CheckoutService } from '~/modules/checkout/checkout.service'
import type { CheckoutInput } from '~/modules/checkout/checkout.types'

export const CheckoutController = {
  checkout: async (req: AuthRequest, res: Response) => {
    const idempotencyKey = req.header('Idempotency-Key')
    if (!idempotencyKey) {
      throw ApiError.BadRequest('Idempotency-Key header is required')
    }
    const order = await CheckoutService.checkout(req.user!.id, idempotencyKey, req.body as CheckoutInput)
    return res.status(201).json(order)
  },
}
```

```ts
// back-end/src/modules/checkout/checkout.routes.ts
import { Router } from 'express'

import { authenticate } from '~/core/auth/auth.middleware'
import { asyncHandler } from '~/core/asyncHandler'
import { validateRequest } from '~/core/validate/validateRequest'
import { CheckoutController } from '~/modules/checkout/checkout.controller'
import { CheckoutSchema } from '~/modules/checkout/checkout.validation'

const r = Router()

r.post('/', authenticate, validateRequest(CheckoutSchema), asyncHandler(CheckoutController.checkout))

export default r
```

- [ ] **Step 11: Wire into `routes/index.ts`**

```ts
import checkoutRoutes from '~/modules/checkout/checkout.routes'
// ...
router.use('/checkout', checkoutRoutes)
```

- [ ] **Step 12: Full test run + typecheck**

Run: `cd back-end && npm test && npm run typecheck`
Expected: all green.

- [ ] **Step 13: Manual end-to-end smoke test against the running dev server**

This is worth doing now, before building the read/cancel/admin endpoints on top — it's the core of the whole feature.

1. Log in via the existing auth endpoints (or grab a token from the seeded users in `prisma/seed.ts`) to get a Bearer token.
2. `POST /api/addresses` with a real seeded province/ward code (from Task 6/7) to create an address.
3. `POST /api/cart/items` with a real `variantId` from your seeded product data.
4. `POST /api/checkout` with `Idempotency-Key: test-key-1`, the created `addressId`, `paymentMethod: "cod"`.
   Expected: `201` with the order, `total = subtotal + DEFAULT_SHIPPING_FEE`, the cart item gone from a follow-up `GET /api/cart`, and the variant's `stockQuantity` decremented (check via `GET /api/products/:id` as admin, or Prisma Studio).
5. Repeat the exact same `POST /api/checkout` call with the same `Idempotency-Key: test-key-1`.
   Expected: `201` with the **same** order id, and stock is **not** decremented a second time.

- [ ] **Step 14: Commit**

```bash
git add back-end/src/modules/checkout back-end/src/routes/index.ts back-end/tests/modules/checkout
git commit -m "feat: add idempotent COD checkout endpoint"
```
