# Sales, Ledger & Payments — API Documentation

This document covers the `sales`, `payments`, and `ledger` modules: every endpoint, its
request payload, and its response shape.

- **Base URL:** `/{API_PREFIX}` (e.g. `/api/v1`) — see `ENV.api.API_PREFIX`.
- **Auth:** All endpoints below are `internal` routes. They pass through
  `InternalRequestInterceptor`, which requires `request.verifiedUser` to exist and to carry the
  `internal` role (`ENUM_ACL_DEFAULT_ROLES.INTERNAL`). Skipped when `ENV.auth.skipAuth` is true.
  Send the bearer token the internal auth flow issues (`@ApiBearerAuth()`).
- **Audit fields:** `GlobalRequestInterceptor` injects `createdBy` (POST) / `updatedBy` (PATCH/PUT)
  from `verifiedUser` before the body reaches the service. You do not send these; they are ignored
  if supplied.

---

## 1. Response envelope

`ResponseInterceptor` is registered **globally**, so every response — including single-entity
endpoints — is wrapped:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Successful response",
  "data": { }
}
```

For list endpoints the service builds the `SuccessResponse` itself, which adds a `meta` object:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Sales fetched successfully",
  "data": [ ],
  "meta": { "total": 42, "page": 1, "limit": 10, "skip": 0 }
}
```

> A single entity returned by a service is auto-wrapped as
> `{ success, statusCode: 200, message: "Successful response", data: <entity> }`.

### Common base fields (every record)

All entities extend `BaseEntity`:

| Field       | Type      | Notes                                  |
| ----------- | --------- | -------------------------------------- |
| `id`        | uuid      | Primary key                            |
| `isActive`  | boolean   | Defaults to `true`                     |
| `createdBy` | object    | Verified user snapshot (JSONB)         |
| `updatedBy` | object    | Verified user snapshot (JSONB)         |
| `createdAt` | timestamp | Auto (`TIMESTAMP_UTC`)                 |
| `updatedAt` | timestamp | Auto (`TIMESTAMP_UTC`)                 |
| `deletedAt` | timestamp | `select: false` — never returned       |
| `deletedBy` | object    | `select: false` — never returned       |

### Enums

```ts
enum ENUM_PAYMENT_METHODS {
  CASH = 'cash', BKASH = 'bKash', NAGAD = 'nagad',
  ROCKET = 'rocket', UPAY = 'upay', BANK = 'bank',
}

enum ENUM_CUSTOMER_TYPES { B2B = 'B2B', B2C = 'B2C' }
```

---

## 2. Sales — `/internal/sales`

Controller: `SaleInternalController` → `SaleService`

### 2.1 `POST /internal/sales` — Create a sale

Creates the sale, its line items, decrements stock, updates weighted average selling prices,
optionally writes a `due` ledger entry, and generates the invoice PDF.

**Request body** (`CreateSaleDTO`):

```json
{
  "date": "2026-09-05",
  "customerId": "customer-uuid",
  "items": [
    {
      "productId": "product-uuid",
      "variantId": "product-variant-option-uuid",
      "quantity": 5,
      "sellingPrice": 120
    }
  ],
  "discount": 0,
  "paidAmount": 5000,
  "paymentMethod": "cash",
  "shippingTo": "Home",
  "shippingAddress": "12 Road, Dhaka",
  "shippingContact": "01700000000",
  "soldById": "user-uuid"
}
```

| Field             | Type            | Required | Notes                                                                 |
| ----------------- | --------------- | -------- | --------------------------------------------------------------------- |
| `date`            | date            | yes      | Sale date.                                                            |
| `customerId`      | uuid            | yes      | Used to resolve customer type (B2B/B2C) and shipping fallbacks.       |
| `items`           | `SaleItemDTO[]` | yes      | At least one line. See below.                                         |
| `discount`        | number          | yes      | Flat amount subtracted from the computed total.                       |
| `paidAmount`      | number          | yes      | Amount paid up front.                                                 |
| `paymentMethod`   | enum            | yes      | `ENUM_PAYMENT_METHODS`.                                               |
| `shippingTo`      | string          | yes      | Falls back to customer company name / name if blank.                  |
| `shippingAddress` | string          | no       | Falls back to customer address.                                       |
| `shippingContact` | string          | no       | Falls back to customer contact number.                                |
| `soldById`        | uuid            | yes      | Salesperson (user).                                                   |

**`SaleItemDTO`:**

| Field          | Type   | Required | Notes                                                                      |
| -------------- | ------ | -------- | -------------------------------------------------------------------------- |
| `productId`    | uuid   | yes      | Must exist.                                                                |
| `variantId`    | uuid   | no       | A `ProductVariantOption` id belonging to `productId`.                      |
| `quantity`     | number | yes      | Must not exceed available stock (variant stock when `variantId` is given).  |
| `sellingPrice` | number | yes      | The unit price **actually used for this sale**; may differ from catalogue. |

**Behaviour / computed values**

- `totalAmount` = Σ (`sellingPrice` × `quantity`).
- `grandTotal` = `totalAmount` − `discount`; `dueAmount` = `grandTotal` − `paidAmount`.
- `invoiceNo` is generated from the Postgres sequence `sales_invoice_seq` as `INV-0001`.
- Stock: when `variantId` is provided the variant's `stockQuantity` is decremented and the product's
  `stock` is kept in sync; otherwise the product's `stock` is decremented. `saleQuantity` is
  incremented on the relevant row.
- `sourcingPrice` on each `SaleItem` is a **snapshot** of the product's sourcing price at sale time,
  so historical margin stays correct.
- Weighted average selling price (`averageB2BSalesPrice` / `averageB2CSalesPrice`, with
  `b2bSoldQuantity` / `b2cSoldQuantity` as weights) is recalculated per product using the customer's
  `customerType`.
- If `dueAmount > 0`, a ledger entry is written:
  `{ entityType: 'customer', entityId, type: 'due', amount: dueAmount, referenceId: sale.id, referenceType: 'sale' }`.
- After commit, the invoice PDF is generated and stored (Cloudflare R2) and `invoiceUrl` is set.
  If generation fails the sale is **not** rolled back; the API throws
  `Invoice generation failed: ...` (retry via `GET /internal/sales/:id/invoice`).
- Whole flow runs in a DB transaction; any failure → rollback and `400 Bad Request` with the error
  message.

**Response:** `data` = the created `Sale` with `SALE_DETAIL_RELATIONS` (`items` with `product` and
`variant.variant`/`variant.variantOption`, `customer`, `soldBy`).

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Successful response",
  "data": {
    "id": "sale-uuid",
    "date": "2026-09-05",
    "invoiceNo": "INV-0003",
    "invoiceUrl": "https://.../INV-0003.pdf",
    "customerId": "customer-uuid",
    "customer": { "id": "customer-uuid", "name": "...", "customerType": "B2C", "...": "..." },
    "items": [
      {
        "id": "sale-item-uuid",
        "saleId": "sale-uuid",
        "productId": "product-uuid",
        "product": { "id": "...", "title": "T-Shirt", "productCode": "P-001", "...": "..." },
        "variantId": "pvo-uuid",
        "variant": {
          "id": "pvo-uuid",
          "sku": "TS-RED-L",
          "variant": { "id": "...", "title": "Color" },
          "variantOption": { "id": "...", "title": "Red" }
        },
        "quantity": 5,
        "sellingPrice": 120,
        "sourcingPrice": 90,
        "totalAmount": 600
      }
    ],
    "totalAmount": 600,
    "discount": 0,
    "grandTotal": 600,
    "paidAmount": 5000,
    "dueAmount": 0,
    "paymentMethod": "cash",
    "shippingTo": "Home",
    "shippingAddress": "12 Road, Dhaka",
    "shippingContact": "01700000000",
    "soldById": "user-uuid",
    "soldBy": { "id": "user-uuid", "name": "..." },
    "isActive": true,
    "createdBy": {},
    "updatedBy": {},
    "createdAt": "2026-09-05T10:00:00.000Z",
    "updatedAt": "2026-09-05T10:00:00.000Z"
  }
}
```

**Errors**

| Status | When                                                                       |
| ------ | -------------------------------------------------------------------------- |
| 400    | Stock insufficient, invalid selling price, variant not found for product, or any transactional failure. |
| 403    | Not an internal/verified user (interceptor).                                |

### 2.2 `GET /internal/sales` — List sales

**Query** (`FilterSaleDTO` = `BaseFilterDTO` + below):

| Field           | Type   | Notes                                                                 |
| --------------- | ------ | --------------------------------------------------------------------- |
| `page`          | number | Default `1`.                                                          |
| `limit`         | number | Default `10` here (base default is `10`).                             |
| `searchTerm`    | string | `Sale` declares no `SEARCH_TERMS`, so this is not applied.            |
| `startDate`     | string | `YYYY-MM-DD`. Filters on the `date` column (`DATE_FILTER_COLUMN`).     |
| `endDate`       | string | `YYYY-MM-DD`. Date-only values include the whole end day.             |
| `sortBy`        | string | Default `createdAt`.                                                  |
| `sortOrder`     | string | `ASC` / `DESC`, default `DESC`.                                       |
| `initialLoadIds`| string | JSON array of uuids, fetched first and prepended to `data`.           |
| `customerId`    | uuid   | Extra filter (applied to the list query).                             |
| `soldById`      | uuid   | Extra filter.                                                         |
| `paymentMethod` | enum   | Extra filter.                                                         |

**Response:** `SuccessResponse<Sale[]>` with full `SALE_DETAIL_RELATIONS` on every row.

### 2.3 `GET /internal/sales/:id` — Get one sale

Returns the sale **with items, customer and soldBy** (the same detail relations as create/list).
`404 Not Found` (`Sale not found: <id>`) if it does not exist.

### 2.4 `GET /internal/sales/:id/invoice` — Download invoice PDF

Returns `application/pdf` as a `StreamableFile`, generated on demand from live data. Filename is
`<invoiceNo>.pdf` (falls back to the id). `404` if the sale is missing.

### 2.5 `PATCH /internal/sales/:id` — Update a sale

**Body** (`UpdateSaleDTO`, all optional): `date`, `customerId`, `items`, `discount`, `paidAmount`,
`paymentMethod`, `shippingTo`, `shippingAddress`, `shippingContact`, `soldById`.

`404` if the sale does not exist.

> **Important:** update performs a plain row update — it does **not** re-run `createSale`'s logic.
> Totals (`totalAmount`, `grandTotal`, `dueAmount`), stock, line items and weighted averages are
> **not** recalculated and the invoice is not regenerated. Use create for anything that changes items.

**Response:** `data` = the updated `Sale` **without** relations.

### 2.6 `DELETE /internal/sales/:id` — Delete a sale

**Response:** `{ success: true, statusCode: 200, message: "Sale deleted successfully", data: null }`.

---

## 3. Payments — `/internal/payments`

Controller: `PaymentInternalController` → `PaymentService`

A payment is a cash movement against a customer or supplier. A customer payment is a collection
(money in); a supplier payment is money out. It optionally links to the sale/purchase it settles.

### 3.1 `POST /internal/payments` — Record a payment

**Request body** (`CreatePaymentDTO`):

```json
{
  "paymentDate": "2026-09-06",
  "entityType": "customer",
  "entityId": "customer-uuid",
  "amount": 1500,
  "paymentMethod": "cash",
  "referenceId": "sale-uuid",
  "referenceType": "sale",
  "note": "Partial payment for INV-0003"
}
```

| Field           | Type   | Required | Notes                                                                         |
| --------------- | ------ | -------- | ----------------------------------------------------------------------------- |
| `paymentDate`   | date   | yes      |                                                                               |
| `entityType`    | enum   | yes      | `customer` (collection) \| `supplier` (payment out).                          |
| `entityId`      | string | yes      | Customer/supplier id.                                                         |
| `amount`        | number | yes      |                                                                               |
| `paymentMethod` | enum   | yes      | `ENUM_PAYMENT_METHODS`.                                                       |
| `referenceId`   | string | no       | The **sale** or **purchase** id this payment settles.                         |
| `referenceType` | enum   | no       | `sale` \| `purchase`.                                                         |
| `note`          | string | no       | Max 500 chars.                                                                |

**Behaviour**

1. Saves the `Payment` row.
2. Writes a ledger entry with `type: 'paid'`, `referenceId: <payment id>`,
   `referenceType: 'payment'`, description `Payment received from customer` /
   `Payment made to supplier` (plus the note).
3. When `referenceId` + `referenceType` are provided, it also adjusts the referenced record:
   sale → `paidAmount += amount`, `dueAmount = max(0, dueAmount - amount)`; purchase → same.

**Response:** `data` = the raw saved `Payment` (not enriched).

> **Note:** the reference is not validated against `entityId` or `entityType`. If `referenceType` is
> `sale` but `referenceId` is not a real sale id, step 3 silently does nothing and the payment is
> still created. The `party`/`reference` enrichment only appears on the **GET** endpoints below.

### 3.2 `GET /internal/payments` — List payments (enriched)

**Query** (`FilterPaymentDTO` = `BaseFilterDTO` + `entityType`, `entityId`, `paymentMethod`).
Searches `note` (`Payment.SEARCH_TERMS`); date filter uses `paymentDate`
(`Payment.DATE_FILTER_COLUMN`); default sort `createdAt DESC`.

Each row is the payment plus two resolved extras:

- **`party`** — the customer/supplier resolved from `entityType` + `entityId` (or `null`).
- **`reference`** — the linked sale/purchase resolved from `referenceType` + `referenceId`, loaded
  with its items and counterparty (or `null`). Sale references use `SALE_DETAIL_RELATIONS`;
  purchase references use `PURCHASE_DETAIL_RELATIONS`.

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment fetched successfully",
  "data": [
    {
      "id": "payment-uuid",
      "paymentDate": "2026-09-06",
      "entityType": "customer",
      "entityId": "customer-uuid",
      "amount": 1500,
      "paymentMethod": "cash",
      "referenceId": "sale-uuid",
      "referenceType": "sale",
      "note": "Partial payment for INV-0003",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "...",
      "party": {
        "id": "customer-uuid",
        "name": "Rahim Stores",
        "customerType": "B2B",
        "contactNumber": "01700000000",
        "companyName": "...",
        "address": "..."
      },
      "reference": {
        "id": "sale-uuid",
        "invoiceNo": "INV-0003",
        "grandTotal": 6000,
        "paidAmount": 1500,
        "dueAmount": 4500,
        "items": [ { "id": "...", "quantity": 5, "sellingPrice": 120, "totalAmount": 600, "product": {}, "variant": {} } ],
        "customer": {}
      }
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 10, "skip": 0 }
}
```

Parties and references are bulk-loaded (`In(...)`), so there is no N+1 on the list.

### 3.3 `GET /internal/payments/:id` — Get one payment (enriched)

Same shape as a single list row, including `party` and `reference`. `404 Payment With ID <id> Not
Found` if missing.

### 3.4 `PATCH /internal/payments/:id` — Update a payment

**Body** (`UpdatePaymentDTO`, all optional): `paymentDate`, `entityType`, `entityId`, `amount`,
`paymentMethod`, `referenceId`, `referenceType`, `note`.

Performs a plain row update — **no** ledger entry is written and the linked sale/purchase's
`paidAmount`/`dueAmount` are **not** adjusted. `404` if missing.

**Response:** `data` = the updated `Payment` (raw, not enriched).

### 3.5 `DELETE /internal/payments/:id` — Delete a payment

**Response:** `{ success: true, statusCode: 200, message: "Payment deleted successfully", data: null }`.

---

## 4. Ledger — `/internal/ledger`

Controller: `LedgerInternalController` → `LedgerService`

The ledger is the append-only book of dues and payments against a customer or supplier. Balances are
derived: `balance = totalDue − totalPaid`.

### 4.1 `POST /internal/ledger` — Create a ledger entry

**Body** (`CreateLedgerDTO`):

| Field             | Type   | Required | Notes                                                    |
| ----------------- | ------ | -------- | -------------------------------------------------------- |
| `entityType`       | string | yes      | `customer` \| `supplier` (max 50).                        |
| `entityId`         | string | yes      | Party id.                                                 |
| `type`             | string | yes      | `due` \| `paid` (max 50).                                 |
| `amount`           | number | yes      |                                                           |
| `referenceId`      | string | no       | Origin id (e.g. sale id or payment id).                   |
| `referenceType`    | string | no       | `sale` \| `purchase` \| `payment` (max 50).               |
| `description`      | string | no       |                                                           |
| `transactionDate`  | date   | yes      |                                                           |

**Response:** `data` = the created `Ledger` entry. (Sale and payment creation call this internally.)

### 4.2 `GET /internal/ledger` — List (generic)

Uses the base list helper with **no relations**. Query is `any`; supports `page`, `limit`,
`searchTerm` (searches `description`), `startDate`/`endDate` (on `transactionDate`), `sortBy`,
`sortOrder`, `initialLoadIds`. Response is `SuccessResponse<Ledger[]>`.

### 4.3 `GET /internal/ledger/filter` — List (explicit filters)

**Query** (`FilterLedgerDTO`): `entityType`, `entityId`, `type`, plus `page`, `limit`, `startDate`,
`endDate` from `BaseFilterDTO`. Always ordered by `transactionDate DESC`.

**Response:** `SuccessResponse<Ledger[]>`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ledger entries fetched successfully",
  "data": [
    {
      "id": "ledger-uuid",
      "entityType": "customer",
      "entityId": "customer-uuid",
      "type": "due",
      "amount": 4500,
      "referenceId": "sale-uuid",
      "referenceType": "sale",
      "description": "Sale to customer - Due amount",
      "transactionDate": "2026-09-05",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 10, "skip": 0 }
}
```

> `/filter` is declared before `/:id`, so it is matched as its own route rather than as an id.

### 4.4 `GET /internal/ledger/customer/:customerId/balance`

Sums all ledger entries for `entityType: 'customer'`:

```json
{ "totalDue": 6000, "totalPaid": 1500, "balance": 4500 }
```

### 4.5 `GET /internal/ledger/supplier/:supplierId/balance`

Same shape, for `entityType: 'supplier'`.

### 4.6 `GET /internal/ledger/:id`

Returns the single `Ledger` entry (no relations). `404` if missing.

### 4.7 `PATCH /internal/ledger/:id`

**Body** (`UpdateLedgerDTO` = `PartialType(CreateLedgerDTO)`): any of the create fields.
`404` if missing. **Response:** `data` = the updated entry.

### 4.8 `DELETE /internal/ledger/:id`

**Response:** `{ success: true, statusCode: 200, message: "Ledger deleted successfully", data: null }`.

---

## 5. How the modules connect

```
Sale created
  └─ dueAmount > 0 ──▶ Ledger entry (type: 'due',  referenceType: 'sale')

Payment created
  ├─ Ledger entry (type: 'paid', referenceType: 'payment', referenceId: payment.id)
  └─ referenceType 'sale' | 'purchase'
        └─ updates sale/purchase paidAmount + dueAmount

Balance = Σ(type 'due') − Σ(type 'paid')   [customer & supplier]
```

- **`SALE_DETAIL_RELATIONS`** (`src/app/helpers/transaction-details.helper.ts`) —
  `items` (+`product`, `variant.variant`, `variant.variantOption`), `customer`, `soldBy`. Used by
  sale create/list/detail and by payments when resolving a sale reference.
- **`PURCHASE_DETAIL_RELATIONS`** — `items` (+`product`, `variant`), `supplier`, `purchasedBy`.
- **`loadParties` / `loadSales` / `loadPurchases` / `loadExpenses`** — bulk resolvers used by
  payments (and by the accounts transactions feed) to attach `party` and `reference` without N+1.
- Payments module imports `Customer`, `Supplier`, `Sale`, `Purchase` repositories and `LedgerService`.

---

## 6. Quick reference

| Method | Path                                            | Purpose                          | Response payload      |
| ------ | ----------------------------------------------- | -------------------------------- | --------------------- |
| POST   | `/internal/sales`                               | Create sale (+items, invoice)    | `Sale` w/ relations   |
| GET    | `/internal/sales`                               | List sales                       | `SuccessResponse<Sale[]>` w/ relations |
| GET    | `/internal/sales/:id`                           | Sale detail (+items)             | `Sale` w/ relations   |
| GET    | `/internal/sales/:id/invoice`                    | Invoice PDF                      | `application/pdf`     |
| PATCH  | `/internal/sales/:id`                           | Update sale (row only)           | `Sale`                |
| DELETE | `/internal/sales/:id`                           | Delete sale                      | `SuccessResponse`     |
| POST   | `/internal/payments`                            | Record payment (+ledger, +ref adjust) | `Payment`        |
| GET    | `/internal/payments`                            | List payments                    | `SuccessResponse<Payment + party + reference[]>` |
| GET    | `/internal/payments/:id`                        | Payment detail                   | `Payment + party + reference` |
| PATCH  | `/internal/payments/:id`                        | Update payment (row only)        | `Payment`             |
| DELETE | `/internal/payments/:id`                        | Delete payment                   | `SuccessResponse`     |
| POST   | `/internal/ledger`                              | Create ledger entry              | `Ledger`              |
| GET    | `/internal/ledger`                              | List ledger (generic)            | `SuccessResponse<Ledger[]>` |
| GET    | `/internal/ledger/filter`                       | List ledger (filters)            | `SuccessResponse<Ledger[]>` |
| GET    | `/internal/ledger/customer/:customerId/balance` | Customer balance                 | `{ totalDue, totalPaid, balance }` |
| GET    | `/internal/ledger/supplier/:supplierId/balance` | Supplier balance                 | `{ totalDue, totalPaid, balance }` |
| GET    | `/internal/ledger/:id`                          | Ledger entry detail              | `Ledger`              |
| PATCH  | `/internal/ledger/:id`                          | Update ledger entry              | `Ledger`              |
| DELETE | `/internal/ledger/:id`                          | Delete ledger entry              | `SuccessResponse`     |

A live, schema-derived version of this is also served by Swagger at `GET /docs`.
