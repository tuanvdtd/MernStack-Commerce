# Checkout Phase 1: Cart, Order & COD Checkout — Design

Status: Approved (design). Implementation not started.
Scope: `back-end/` (Express + TypeScript + Prisma/MySQL) and `front-end/` (React).

## Background

`checkout.md` describes a complete checkout feature spanning order creation, VN
address handling, shipping-provider integration, online payment gateways,
webhook/idempotency handling, and separate order/payment/shipment status
tracking. That scope bundles three subsystems that can be built and shipped
independently:

1. **Phase 1 (this spec)** — Order/checkout core with Cash on Delivery (COD)
   only. A fully working, self-contained vertical slice: add to cart, address
   book, place a COD order, track it, admin manages it.
2. **Phase 2 (future spec)** — Real shipping provider integration: province/
   ward lookup from the provider, live shipping fee calculation, shipment
   creation, tracking webhook, retry/duplicate-shipment handling.
3. **Phase 3 (future spec)** — Online payment gateway integration: payment
   intent/redirect flow, webhook/callback signature verification, idempotent
   payment status updates, retry/duplicate-webhook handling.

Phase 1 establishes the data model (`Order`, `OrderItem`, `Address`,
`orderStatus`/`paymentStatus`/`shipmentStatus`) and the idempotency pattern
that Phases 2 and 3 will build on, so later phases are additive rather than
requiring rework of the core.

### Codebase context that shaped this design

- The active backend is `back-end/` (317 recent commits vs. 6 for the legacy
  `nodejs-api/`), using Prisma against MySQL/MariaDB, with Redis, RabbitMQ,
  and Elasticsearch already wired in.
- Modules follow a consistent per-feature layout:
  `*.routes.ts / *.controller.ts / *.service.ts / *.repo.ts / *.validation.ts
  / *.mapper.ts / *.types.ts`.
- `Cart`/`CartItem` exist in `schema.prisma` but have **no backend module and
  no frontend wiring** — `front-end/src/pages/Cart.tsx` uses hardcoded local
  state. This phase builds the real Cart API as a prerequisite for checkout.
- `Address` currently only has `street`/`city` — no VN administrative
  structure. Vietnam's mid-2025 administrative reform merged 63 provinces
  into 34 and eliminated the district level, moving to a 2-tier structure
  (tỉnh/thành phố → xã/phường). The new `Address` model reflects this.
- `front-end/` already ships UI shells for `Checkout.tsx`, `TrackOrder.tsx`,
  `account/AccountAddresses.tsx`, `account/AccountOrders.tsx`,
  `admin/OrdersList.tsx`, `admin/OrderDetail.tsx` — all on mock/local data.
  This phase wires them to real APIs.
- Auth: JWT Bearer token, `authenticate` + `requirePermission` middleware,
  RBAC via `config/rbacConfig.ts` (`VIEW_ADMIN` / `VIEW_USER`). No guest
  checkout — placing/viewing orders requires an authenticated user; only
  order *tracking* is public (order number + phone).

## Data Model

### Address (replaces `street`/`city`)

```prisma
model Address {
  id            String   @id
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  label         String?  // "Home", "Office"
  recipientName String
  phone         String   // VN phone format, see Address & Location API section
  provinceCode  String   // GSO code, 34 provinces post-2025 merger
  provinceName  String
  wardCode      String   // GSO code, post-2025 merger (no district level)
  wardName      String
  detail        String   // house number, street
  isDefault     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
}
```

### CartItem (add `selected`)

Adds one field to the existing model to support the frontend's per-item
checkbox selection (checkout can act on a subset of the cart):

```prisma
model CartItem {
  // ...existing fields unchanged
  selected  Boolean  @default(true)
}
```

### Order / OrderItem (new)

Order snapshots recipient/address and item name/price at creation time so
later edits to `Address` or `Product` never retroactively change a placed
order.

```prisma
enum OrderStatus {
  PENDING    @map("pending")
  CONFIRMED  @map("confirmed")
  SHIPPED    @map("shipped")
  DELIVERED  @map("delivered")
  CANCELLED  @map("cancelled")
}

enum PaymentMethod {
  COD    @map("cod")
  ONLINE @map("online")   // reserved for Phase 3; rejected with 501 in Phase 1
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
  id              String         @id
  orderNumber     String         @unique
  userId          String
  user            User           @relation(fields: [userId], references: [id], onDelete: Restrict)
  items           OrderItem[]

  // Address snapshot (denormalized, immutable)
  recipientName   String
  phone           String
  provinceName    String
  wardName        String
  addressDetail   String

  subtotal        Decimal        @db.Decimal(12, 2)
  shippingFee     Decimal        @db.Decimal(12, 2) @default(0)
  discountAmount  Decimal        @db.Decimal(12, 2) @default(0)
  discountCode    String?
  total           Decimal        @db.Decimal(12, 2)

  orderStatus     OrderStatus    @default(PENDING)
  paymentMethod   PaymentMethod
  paymentStatus   PaymentStatus  @default(UNPAID)
  shipmentStatus  ShipmentStatus @default(NOT_SHIPPED)

  note            String?        @db.VarChar(500)
  idempotencyKey  String?        @unique

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

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
  variantLabel String         // e.g. "Natural Titanium / 256GB"
  imageUrl     String?
  price        Decimal        @db.Decimal(12, 2)
  quantity     Int

  @@index([orderId])
  @@index([variantId])
}
```

### VN Location reference data (new, supports the address form)

A static seeded dataset (34 provinces → wards) sourced from public GSO data,
exposed read-only. Phase 2 may reuse this table or add provider-specific
codes alongside it if the chosen shipping provider needs different
identifiers — no assumption is made here about which provider that will be.

```prisma
model Province {
  code  String @id
  name  String
  wards Ward[]
}

model Ward {
  code       String   @id
  name       String
  provinceCode String
  province   Province @relation(fields: [provinceCode], references: [code])

  @@index([provinceCode])
}
```

## Cart API

New module: `back-end/src/modules/cart/`. One ACTIVE cart per user
(auto-created on first add). Prices are always re-read live from
`ProductVariant` when returning cart contents — never trusted from stale
storage.

- `GET /api/cart` — current user's ACTIVE cart with items (joined to
  variant/product for name, image, live price, stock).
- `POST /api/cart/items` — body `{variantId, quantity}`; merges quantity if
  the variant is already in the cart.
- `PATCH /api/cart/items/:id` — body `{quantity}` and/or `{selected}`.
- `DELETE /api/cart/items/:id` — remove one line item.
- `PATCH /api/cart/select-all` — body `{selected: boolean}`, bulk-toggles all
  items (matches the frontend "select all" checkbox).

All routes: `authenticate` only, scoped to `req.user.id`.

`Cart.countProduct` is maintained as a denormalized count of distinct line
items, updated in the same transaction as any add/remove/quantity-change
(it's currently unused by the frontend, but kept correct rather than left to
drift since it already exists on the model).

## Address & Location API

New module: `back-end/src/modules/addresses/`. All routes: `authenticate`
only, scoped to `req.user.id`.

- `GET /api/addresses` — list the current user's saved addresses.
- `POST /api/addresses` — create. Body: `{label?, recipientName, phone,
  provinceCode, wardCode, detail, isDefault?}`. `provinceCode`/`wardCode`
  are validated against the seeded `Province`/`Ward` tables (`404
  LOCATION_NOT_FOUND` if unknown, and the ward must belong to the given
  province). `phone` is validated against a VN mobile/landline pattern
  (`/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/`, covering current VN mobile prefixes).
  If this is the user's first address, or `isDefault: true` is passed, it
  becomes the default.
- `PATCH /api/addresses/:id` — update any of the same fields; same
  validation rules apply.
- `DELETE /api/addresses/:id` — delete; `409 ADDRESS_IN_USE` is not needed
  since `Order` stores an address *snapshot*, not a foreign key, so deleting
  an `Address` never affects past orders. If the deleted address was the
  default and other addresses remain, the most-recently-updated remaining
  one is promoted to default.
- `PATCH /api/addresses/:id/default` — sets this address as default.

**Enforcing a single default address per user:** the schema has no DB-level
uniqueness constraint on `isDefault` (Prisma/MySQL can't express "unique
`true` per `userId`" directly), so this is enforced at the service layer:
setting `isDefault: true` on one address (via create, update, or the
`/default` endpoint) runs inside a transaction that first sets
`isDefault = false` on all of the user's other addresses, then sets it on
the target. All three write paths funnel through the same
`addressService.setAsDefault()` helper so this invariant can't be bypassed.

**Location API** (public, read-only, no auth — needed before a user has
logged in isn't required here since it's only used inside the authenticated
address form, but there's no reason to gate it):
- `GET /api/locations/provinces` — list all 34 provinces (`code`, `name`).
- `GET /api/locations/provinces/:code/wards` — list wards for a province.

**Seed data source:** the `Province`/`Ward` tables are populated by a
one-off seed script (`back-end/prisma/scripts/seedLocations.ts`, following
the existing pattern in `prisma/scripts/`) from a static JSON file checked
into the repo. That JSON is generated ahead of implementation from the
official post-merger administrative dataset published by Vietnam's General
Statistics Office / provincial resolutions (34 provinces, ward-level,
effective July 2025) — sourcing and generating this file is a prerequisite
task in the implementation plan, not something assumed to already exist.

## Checkout API

`POST /api/checkout`

Request:
```json
{
  "addressId": "string",
  "paymentMethod": "cod",
  "discountCode": "string?",
  "buyNowItem": { "variantId": "string", "quantity": 1 }
}
```
Header: `Idempotency-Key: <client-generated UUID>` (required).

`paymentMethod` other than `"cod"` returns `501 Not Implemented` in Phase 1.

`buyNowItem` is optional and mutually exclusive with the cart-based flow: when
present, checkout uses **only** that single variant/quantity as the order's
line items and does not touch the cart at all (nothing is read from or
removed from `CartItem`). This supports a "Buy now" button on
`ProductDetail.tsx` that purchases one item without first adding it to the
cart. When absent, checkout falls back to the cart-based flow below.

Server logic, executed as one Prisma `$transaction`:

1. Check Redis key `checkout:idem:<userId>:<Idempotency-Key>`. If present,
   short-circuit and return the previously created order (no re-processing).
2. Resolve the line items to order:
   - If `buyNowItem` is present, use that single `{variantId, quantity}` pair
     directly (still re-validated against live price/stock in step 4).
   - Otherwise, load the user's ACTIVE cart and filter to `selected = true`
     items. `400 CART_EMPTY` if none.
3. Load `addressId`; `404 ADDRESS_NOT_FOUND` if it doesn't belong to the
   user.
4. For each selected item, lock/re-check
   `ProductVariant.stockQuantity >= quantity`; `409 INSUFFICIENT_STOCK`
   (naming the offending variant) if not. Recompute `subtotal` from live
   `ProductVariant.price` — client-sent prices are never trusted.
5. If `discountCode` present, validate against `Discount`: active,
   within `startDate`/`endDate`, `subtotal >= minOrderValue`,
   `usesCount < maxUses`, and per-user `DiscountUserUse.usesCount <
   maxUsesPerUser`. Errors: `DISCOUNT_INVALID` / `DISCOUNT_EXPIRED` /
   `DISCOUNT_LIMIT_REACHED`. Compute `discountAmount` (capped by
   `maxValue` for percentage discounts).
6. Compute `shippingFee` — **flat/config-driven value in Phase 1** (env var
   or a simple constant); no live shipping-provider rate lookup yet
   (that's Phase 2).
7. Create `Order` + `OrderItem[]` (snapshot `productName`, `variantLabel`,
   `imageUrl`, `price`, and the address fields), decrement
   `ProductVariant.stockQuantity` for each item, and — if a discount was
   applied — upsert-increment `DiscountUserUse.usesCount` **and** increment
   `Discount.usesCount` (the global counter that step 5's `maxUses` check
   reads; both counters must move together or the global cap can never be
   enforced). Delete the consumed (`selected`) `CartItem`s (skipped entirely
   for the `buyNowItem` path, since nothing was read from the cart), set
   `orderStatus = PENDING`, `paymentMethod = COD`, `paymentStatus = UNPAID`,
   `shipmentStatus = NOT_SHIPPED`.
8. Store `Idempotency-Key → orderId` in Redis with a 24h TTL.
9. Return the created order.

Any failure rolls back the whole transaction and returns a specific error
code so the client can refresh cart state and retry.

Concurrency safety: the stock check and decrement happen inside the same
transaction as order creation, so two simultaneous checkouts contending for
the last unit of stock cannot both succeed.

## Order Endpoints

**User** (`authenticate`, scoped to `req.user.id`):
- `GET /api/orders` — paginated list, optional `orderStatus` filter.
- `GET /api/orders/:id` — detail; `404` if not owned by the caller.
- `POST /api/orders/:id/cancel` — allowed only when `orderStatus` is
  `PENDING` or `CONFIRMED` (`409 ORDER_NOT_CANCELLABLE` otherwise). Restores
  `stockQuantity` for each item; if a discount was applied, decrements both
  `DiscountUserUse.usesCount` and the `Discount.usesCount` global counter
  (mirroring the increment in checkout step 7, so the global cap stays
  accurate); sets `orderStatus = CANCELLED`.

**Public tracking** (no auth):
- `GET /api/orders/track?orderNumber=...&phone=...` — both parameters
  required (prevents order-number enumeration). Returns a trimmed view:
  status, timeline, items, shipping summary — no unrelated PII.

**Admin** (`authenticate` + `requirePermission(VIEW_ADMIN)`):
- `GET /api/admin/orders` — list all; filter by `orderStatus`,
  `paymentMethod`, search by order number/customer.
- `GET /api/admin/orders/:id` — full detail.
- `PATCH /api/admin/orders/:id/status` — body may update `orderStatus`
  and/or `shipmentStatus`/`paymentStatus`, validated against an allowed
  state-transition table (e.g. `CANCELLED` is terminal). This manual control
  is the Phase 1 stand-in for what Phase 2/3 will drive via
  carrier/payment webhooks.

### Status semantics (Phase 1, COD only)

- `paymentStatus`: starts `UNPAID`; admin flips to `PAID` once COD cash is
  confirmed collected, or to `FAILED`/`REFUNDED` around cancellation.
- `shipmentStatus`: starts `NOT_SHIPPED`; admin manually advances to
  `SHIPPED` → `DELIVERED` (Phase 2 replaces this with real carrier
  webhooks).
- `orderStatus` drives the customer-facing timeline and cancellation
  eligibility.

## Idempotency & Error Handling

- Order creation dedup: `Idempotency-Key` header + Redis, as described
  above. This is the primitive Phase 2 (shipment creation) and Phase 3
  (payment webhooks) are expected to reuse.
- Domain error codes: `CART_EMPTY`, `INSUFFICIENT_STOCK`, `DISCOUNT_INVALID`,
  `DISCOUNT_EXPIRED`, `DISCOUNT_LIMIT_REACHED`, `ADDRESS_NOT_FOUND`,
  `ORDER_NOT_CANCELLABLE`, `ORDER_NOT_FOUND`. All 4xx.
  **Note:** the existing `ApiError` (`back-end/src/core/http/ApiError.ts`)
  and `errorHandler` currently only carry/serialize `statusCode`, `message`,
  and `details` — there is no `code` field today. This phase extends
  `ApiError` with an optional `code` property and updates `errorHandler` to
  include it in the JSON response (`{ message, code, details }`) so the
  frontend can match on it programmatically. This is a small, backward-
  compatible extension (existing callers that don't pass `code` are
  unaffected), not a pre-existing capability being reused as-is.

## Frontend Integration

New API modules in `front-end/src/apis/`: `cartApi.ts`, `checkoutApi.ts`,
`orderApi.ts`, `addressApi.ts`, `locationApi.ts` — following the existing
`axiosConfig` + Bearer-token pattern.

- **`Cart.tsx`**: replace local `INITIAL_ITEMS` state with real
  `GET/POST/PATCH/DELETE /api/cart*` calls. `ProductDetail.tsx`'s "Add to
  cart" button calls `POST /api/cart/items` instead of only updating local
  state.
- **`ProductDetail.tsx`**: add a "Buy now" action alongside "Add to cart"
  that navigates to `Checkout.tsx` with a `buyNowItem` selection (e.g. via
  route state), bypassing the cart entirely.
- **`Checkout.tsx`**: source line items from `GET /api/cart` (filtered to
  `selected`) in the normal flow, or from the `buyNowItem` passed in when
  arriving via "Buy now". Source the address block from the user's default
  `Address` with an edit/picker flow, wire "Place order" to
  `POST /api/checkout` (including `buyNowItem` when applicable) with a
  generated `Idempotency-Key`. `CheckoutPaymentSection` /
  `PaymentGatewayModal` show COD only in Phase 1; card/e-wallet options are
  shown as "coming soon" rather than removed outright, to minimize rework
  when Phase 3 lands.
- **`AccountAddresses.tsx`**: wired to `addressApi`, calling the Address API
  described above (list/create/update/delete/set-default); its form gains a
  province → ward picker backed by the Location API.
- **`AccountOrders.tsx`**: wired to `GET /api/orders`.
- **`TrackOrder.tsx`**: wired to the public track endpoint; carrier/tracking-
  number fields are hidden unless `shipmentStatus` indicates a real
  carrier is involved (Phase 1 has none).
- **`admin/OrdersList.tsx` / `admin/OrderDetail.tsx`**: wired to the admin
  order endpoints; status option lists updated to match the new enums
  (`processing` is dropped; `refunded` moves from `orderStatus` to
  `paymentStatus`); address display drops the `district` field (2-tier
  address).

## Testing

- Unit tests for `checkout.service.ts`: happy-path COD order, insufficient
  stock, invalid/expired/limit-reached discount, duplicate
  `Idempotency-Key` (returns the same order, no double stock decrement),
  empty selected-item set.
- Unit tests for `order.service.ts` cancel logic: allowed vs. rejected
  source states, stock/discount-usage restoration.
- Integration-style test against a real test database verifying the
  checkout transaction actually rolls back on a mid-transaction failure.
- Frontend: manual end-to-end verification in a browser (add to cart →
  select items → checkout COD → view in account orders → track by order
  number → admin updates status) since this is UI-heavy; no success claim
  without actually exercising it.

## Out of Scope (deferred to Phase 2 / Phase 3)

- Live shipping-provider integration: real province/ward source, live fee
  calculation, shipment creation, tracking webhooks, duplicate-shipment
  handling.
- Online payment gateways: payment intent/redirect, webhook/callback
  signature verification, idempotent payment status updates from webhooks,
  retry/duplicate-webhook handling.
- Guest checkout (cart and orders require an authenticated user).
