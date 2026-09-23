# Employee Module — Frontend Integration Guide

This is the complete integration reference for the new **employee** feature: managing employees,
handing them money (advances), recording what they spend, and showing their running balance and
statement.

Everything here is already implemented on the backend and verified to compile/lint. Nothing on the
backend needs to change for you to integrate.

---

## 1. Concepts (read this first)

An employee keeps **company money as an advance / petty cash**:

| Action                          | Endpoint                          | Money effect                                                        |
| ------------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| Admin gives money to employee   | `POST /internal/payments`         | Company account (cash/bKash/bank…) **−= amount**; employee holds it |
| Employee spends that money      | `POST /internal/expense`          | Company account **unchanged** (already paid out); employee balance drops |
| Regular company expense         | `POST /internal/expense` (no `employeeId`) | Company account **−= amount** (old behaviour)              |

**Employee balance / cash in hand = Σ advances − Σ expenses.**

Worked example: advance 10,000 → breakfast 1,000 → travel 2,000 ⇒ balance **7,000**.

Ledger sign convention for employees: **advance = credit**, **expense = debit**,
`balance = credit − debit`.

---

## 2. Base URL, auth, headers

- **Base URL:** `http://<host>/{API_PREFIX}/...` where `API_PREFIX` is `api/v1` by default
  (see `environments/example.env`). Example: `http://localhost:3000/api/v1/internal/employee`.
- **Auth:** every route below is an `internal` route and requires a bearer token for a user whose
  roles include `internal`. Send `Authorization: Bearer <token>`.
- **Content type:** `application/json` for all bodies.
- Audit fields (`createdBy` / `updatedBy`) are injected server-side from the token — **do not send
  them**.

---

## 3. Response envelope

**Every** response is wrapped. List endpoints additionally include `meta`.

### Success (single item)

```json
{ "success": true, "statusCode": 200, "message": "Successful response", "data": { } }
```

### Success (list)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Employee fetched successfully",
  "data": [ ],
  "meta": { "total": 42, "page": 1, "limit": 10, "skip": 0 }
}
```

### Error

```json
{
  "success": false,
  "statusCode": 400,
  "message": "employeeId 'EMP-001' already exists",
  "errorMessages": ["employeeId 'EMP-001' already exists"]
}
```

Common status codes:

| Status | Meaning                                                                 |
| ------ | ----------------------------------------------------------------------- |
| 400    | Validation failed / business rule failed (`BadRequestException`)         |
| 403    | Missing/invalid token, or user lacks the `internal` role                 |
| 404    | Entity not found (e.g. `Employee not found: <id>`)                       |
| 409    | Duplicate unique value (`<field> already exists`)                        |

> **Validation errors** arrive as `400` with `message` = the **first** validation error and
> `errorMessages` = all of them.

---

## 4. Shared base fields (every record)

All records extend `BaseEntity`:

| Field       | Type      | Notes                            |
| ----------- | --------- | -------------------------------- |
| `id`        | uuid      |                                  |
| `isActive`  | boolean   | default `true`                   |
| `createdBy` | object    | JSONB snapshot                   |
| `updatedBy` | object    | JSONB snapshot                   |
| `createdAt` | timestamp |                                  |
| `updatedAt` | timestamp |                                  |

---

## 5. Enums

```ts
enum ENUM_PAYMENT_METHODS {
  CASH = 'cash',
  BKASH = 'bKash',
  NAGAD = 'nagad',
  ROCKET = 'rocket',
  UPAY = 'upay',
  BANK = 'bank',
}
```

Ledger entry `entityType` values: `customer` | `supplier` | **`employee`**.

Employee ledger entry `type` values: **`advance`** (money given) | **`expense`** (money spent).

---

## 6. TypeScript types (copy-paste)

```ts
export type PaymentMethod = 'cash' | 'bKash' | 'nagad' | 'rocket' | 'upay' | 'bank';

export interface BaseEntity {
  id: string;
  isActive: boolean;
  createdBy: Record<string, any>;
  updatedBy: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Employee extends BaseEntity {
  name: string;
  employeeId: string;      // human code, unique, e.g. "EMP-001"
  phoneNumber: string;
  email?: string | null;
  designation?: string | null;
}

export interface Payment extends BaseEntity {
  paymentDate: string;     // YYYY-MM-DD
  entityType: 'customer' | 'supplier' | 'employee';
  entityId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceId?: string | null;
  referenceType?: 'sale' | 'purchase' | null;
  note?: string | null;
  party?: Employee | null; // resolved on GET endpoints
  reference?: any | null;
}

export interface Expense extends BaseEntity {
  date: string;            // YYYY-MM-DD
  purpose: string;
  amountSpent: number;
  paymentMethod: PaymentMethod;
  employeeId?: string | null;
  spentBy?: string | null; // auto-filled with employee name
}

export interface EmployeeBalance {
  totalAdvance: number;
  totalExpense: number;
  balance: number;
}

export interface StatementRow {
  date: string;
  particulars: string | null;  // payment method
  narration: string;
  invoiceNo: string | null;
  qty: number | null;
  gross: number | null;
  debit: number;
  credit: number;
  balance: number;
}

export interface EmployeeStatement {
  party: {
    id: string;
    name: string;
    employeeId: string | null;
    phoneNumber: string | null;
    email: string | null;
    designation: string | null;
  };
  startDate: string | null;
  endDate: string | null;
  openingBalance: number;
  closingBalance: number;
  totals: { grossTotal: number; debitTotal: number; creditTotal: number };
  rows: StatementRow[];
}
```

---

## 7. Endpoints

### 7.1 Employees — `/internal/employee`

#### `POST /internal/employee` — create

**Body**

```json
{
  "name": "Nahid Hasan",
  "employeeId": "EMP-001",
  "phoneNumber": "01700000000",
  "email": "nahid@example.com",
  "designation": "Sales Executive"
}
```

| Field         | Type   | Required | Rules                          |
| ------------- | ------ | -------- | ------------------------------ |
| `name`        | string | yes      | max 255                        |
| `employeeId`  | string | yes      | max 100, **must be unique**    |
| `phoneNumber` | string | yes      | max 20                         |
| `email`       | string | no       | valid email, max 150           |
| `designation` | string | no       | max 255                        |

**Response** — `data` = created `Employee`.
**Errors** — `400` on validation; `409` if `employeeId` already exists.

#### `GET /internal/employee` — list

**Query** (all optional): `page`, `limit`, `searchTerm`, `startDate`, `endDate`, `sortBy`,
`sortOrder`, `initialLoadIds`, `designation`.

| Param           | Type   | Notes                                                                        |
| --------------- | ------ | ---------------------------------------------------------------------------- |
| `page`          | number | default `1`                                                                  |
| `limit`         | number | default `10`                                                                 |
| `searchTerm`    | string | searches `name`, `employeeId`, `phoneNumber`, `email`, `designation` (ILIKE)  |
| `startDate`/`endDate` | string | `YYYY-MM-DD`. Employee has no business date column → filters on `createdAt` |
| `sortBy`        | string | default `createdAt`                                                          |
| `sortOrder`     | string | `ASC` / `DESC`, default `DESC`                                               |
| `initialLoadIds`| string | JSON array of ids, e.g. `["uuid1","uuid2"]`, returned first                  |
| `designation`   | string | exact match                                                                  |

**Response** — `data` = `Employee[]`, `meta` = `{ total, page, limit, skip }`.

#### `GET /internal/employee/:id` — detail

`data` = `Employee`. `404` if missing.

#### `PATCH /internal/employee/:id` — update

Body: any of `name`, `employeeId`, `phoneNumber`, `email`, `designation` (all optional).
`data` = updated `Employee`.

#### `DELETE /internal/employee/:id` — delete

```json
{ "success": true, "statusCode": 200, "message": "Employee deleted successfully", "data": null }
```

---

### 7.2 Advancing money to an employee — `/internal/payments`

Money is handed to an employee by creating a **payment** with `entityType: "employee"`. This
automatically deducts the amount from the chosen company account.

#### `POST /internal/payments` — give advance

**Body**

```json
{
  "paymentDate": "2026-09-23",
  "entityType": "employee",
  "entityId": "employee-uuid",
  "amount": 10000,
  "paymentMethod": "bank",
  "note": "Monthly advance"
}
```

| Field           | Type   | Required | Rules                                                  |
| --------------- | ------ | -------- | ------------------------------------------------------ |
| `paymentDate`   | date   | yes      | `YYYY-MM-DD`                                           |
| `entityType`    | string | yes      | `customer` \| `supplier` \| `employee`                  |
| `entityId`      | string | yes      | employee uuid when `entityType` is `employee`           |
| `amount`        | number | yes      |                                                        |
| `paymentMethod` | string | yes      | one of `ENUM_PAYMENT_METHODS`                          |
| `referenceId`   | string | no       | only meaningful for sale/purchase                      |
| `referenceType` | string | no       | `sale` \| `purchase`                                    |
| `note`          | string | no       | max 500                                                |

**Response** — `data` = the raw created `Payment` (no `party`/`reference` on create).
A ledger entry `{ entityType: 'employee', type: 'advance', referenceType: 'payment' }` is written and
the payment method balance drops by `amount`.

#### `GET /internal/payments` — list

**Query** (all optional): `page`, `limit`, `searchTerm` (searches `note`), `startDate`/`endDate`
(on `paymentDate`), `sortBy`, `sortOrder`, `entityType`, `entityId`, `paymentMethod`.

> Filter an employee's advances with `entityType=employee&entityId=<uuid>`.

**Response** — each row = `Payment` **plus**:
- `party` — resolved counterparty. For employees this is the `Employee` object; for customers/suppliers unchanged.
- `reference` — linked sale/purchase (or `null`).

```json
{
  "id": "payment-uuid",
  "paymentDate": "2026-09-23",
  "entityType": "employee",
  "entityId": "employee-uuid",
  "amount": 10000,
  "paymentMethod": "bank",
  "note": "Monthly advance",
  "party": {
    "id": "employee-uuid",
    "name": "Nahid Hasan",
    "employeeId": "EMP-001",
    "phoneNumber": "01700000000",
    "designation": "Sales Executive"
  },
  "reference": null
}
```

#### `GET /internal/payments/:id` — detail

Same enriched shape as a list row. `404` if missing.

#### `PATCH /internal/payments/:id` — update

Body: all create fields optional. Syncs the ledger entry and re-deducts in accounts.
`data` = updated raw `Payment`.

#### `DELETE /internal/payments/:id`

```json
{ "success": true, "statusCode": 200, "message": "Payment deleted successfully", "data": null }
```

---

### 7.3 Employee spending — `/internal/expense`

#### `POST /internal/expense` — record a spend

**Body**

```json
{
  "date": "2026-09-23",
  "purpose": "Breakfast",
  "amountSpent": 1000,
  "paymentMethod": "cash",
  "employeeId": "employee-uuid"
}
```

| Field           | Type   | Required | Rules                                                                       |
| --------------- | ------ | -------- | --------------------------------------------------------------------------- |
| `date`          | date   | yes      | `YYYY-MM-DD`                                                                 |
| `purpose`       | string | yes      | max 255                                                                      |
| `amountSpent`   | number | yes      |                                                                              |
| `paymentMethod` | string | yes      | one of `ENUM_PAYMENT_METHODS` (stored, but does **not** move company balance) |
| `employeeId`    | uuid   | no       | when set → booked against the employee                                       |
| `spentBy`       | string | no       | auto-filled from the employee's name when `employeeId` is set                |

**Behaviour**
- With `employeeId`: writes an employee ledger entry `type: 'expense'`; **company balances unchanged**.
- Without `employeeId`: regular company expense; company balance **−= amount**.

**Response** — `data` = the raw created `Expense`.
**Errors** — `404` `Employee not found: <id>` if `employeeId` is invalid.

#### `GET /internal/expense` — list

**Query** (all optional): `page`, `limit`, `searchTerm` (searches `purpose`, `spentBy`),
`startDate`/`endDate` (on `date`), `sortBy`, `sortOrder`, `spentBy`, **`employeeId`**,
`paymentMethod`.

> Filter an employee's spends with `employeeId=<uuid>`.

**Response** — `data` = `Expense[]`, `meta` = `{ total, page, limit, skip }`.
Each row carries `employeeId` and `spentBy`. (The nested employee object is not included — resolve it
client-side from your employees list, or `GET /internal/employee/:id`.)

#### `GET /internal/expense/:id` — detail

`data` = `Expense`. `404` if missing.

#### `PATCH /internal/expense/:id` — update

Body: `date`, `purpose`, `amountSpent`, `paymentMethod`, `employeeId`, `spentBy` (all optional).
The ledger entry is recalculated (amount, date, owner), so the employee balance stays correct.
`data` = updated `Expense`.

#### `DELETE /internal/expense/:id`

```json
{ "success": true, "statusCode": 200, "message": "Expense deleted successfully", "data": null }
```

---

### 7.4 Employee statement & balance — `/internal/ledger`

#### `GET /internal/ledger/statement` — statement (like customer/supplier)

**Query**

| Param        | Type   | Required | Notes                                                |
| ------------ | ------ | -------- | ---------------------------------------------------- |
| `entityType` | string | yes      | `employee` (also `customer` \| `supplier`)            |
| `entityId`   | string | yes      | employee uuid                                        |
| `startDate`  | string | no       | `YYYY-MM-DD` — entries before it roll into opening   |
| `endDate`    | string | no       | `YYYY-MM-DD` — whole end day is included             |

**Response** (`data`)

```json
{
  "party": {
    "id": "employee-uuid",
    "name": "Nahid Hasan",
    "employeeId": "EMP-001",
    "phoneNumber": "01700000000",
    "email": "nahid@example.com",
    "designation": "Sales Executive"
  },
  "startDate": "2026-09-01",
  "endDate": "2026-09-30",
  "openingBalance": 0,
  "closingBalance": 7000,
  "totals": { "grossTotal": 0, "debitTotal": 3000, "creditTotal": 10000 },
  "rows": [
    { "date": "2026-09-23", "particulars": "bank", "narration": "Advance given — Monthly advance", "invoiceNo": null, "qty": null, "gross": null, "debit": 0, "credit": 10000, "balance": 10000 },
    { "date": "2026-09-23", "particulars": "cash", "narration": "Expense - Breakfast", "invoiceNo": null, "qty": null, "gross": null, "debit": 1000, "credit": 0, "balance": 9000 },
    { "date": "2026-09-23", "particulars": "cash", "narration": "Expense - Travel allowance", "invoiceNo": null, "qty": null, "gross": null, "debit": 2000, "credit": 0, "balance": 7000 }
  ]
}
```

- `rows` are ordered oldest → newest.
- `openingBalance` = net balance of entries **before** `startDate` (0 when no `startDate`).
- `closingBalance` = last row's `balance` (or `openingBalance` when there are no rows).

#### `GET /internal/ledger/employee/:employeeId/balance`

```json
{ "success": true, "statusCode": 200, "message": "Successful response",
  "data": { "totalAdvance": 10000, "totalExpense": 3000, "balance": 7000 } }
```

Great for a badge/chip on an employee card ("Cash in hand: ৳7,000").

#### `GET /internal/ledger/filter` — raw entries

**Query:** `entityType=employee&entityId=<uuid>`, `type` (`advance` | `expense`), `page`, `limit`,
`startDate`, `endDate`. Returns raw `Ledger[]` ordered `transactionDate DESC`.

---

### 7.5 Company accounts — `/internal/accounts`

#### `GET /internal/accounts/balances`

`data` = `{ totalBalance, accounts: [{ paymentMethod, balance }] }`.
Employee advances reduce the matching `paymentMethod` balance; `employeeId` expenses are excluded.

#### `GET /internal/accounts/transactions`

**Query:** `accountType` (payment method), `transactionType` (`cashIn` | `cashOut`),
`startDate`, `endDate`, `page`, `limit`.

> **Note the nesting:** this endpoint returns the business object inside the standard envelope:
> `data` = `{ data, total, page, limit, skip, totalCashIn, totalCashOut }`.
> Employee advances appear as `cashOut` rows with `description` = note or `Advance to employee` and
> `party` = the employee. Employee **expenses do not appear** here (cash already left at advance
> time) — they are visible on the employee statement instead.

---

## 8. End-to-end integration flow

```
1. Create the employee
   POST /internal/employee
   { "name": "Nahid Hasan", "employeeId": "EMP-001", "phoneNumber": "01700000000" }
   → save data.id as `employeeId` (uuid)

2. Give the employee money (advance)
   POST /internal/payments
   { "paymentDate": "2026-09-23", "entityType": "employee", "entityId": "<employeeId>",
     "amount": 10000, "paymentMethod": "bank", "note": "Monthly advance" }
   → company bank balance −10,000 ; employee balance +10,000

3. Employee spends
   POST /internal/expense
   { "date": "2026-09-23", "purpose": "Breakfast", "amountSpent": 1000,
     "paymentMethod": "cash", "employeeId": "<employeeId>" }
   → company balance unchanged ; employee balance −1,000

4. Show the running balance
   GET /internal/ledger/employee/<employeeId>/balance
   → { totalAdvance: 10000, totalExpense: 1000, balance: 9000 }

5. Show the full statement (month view)
   GET /internal/ledger/statement?entityType=employee&entityId=<employeeId>
       &startDate=2026-09-01&endDate=2026-09-30
   → openingBalance, rows[], closingBalance

6. (Optional) Show an employee's advance history
   GET /internal/payments?entityType=employee&entityId=<employeeId>
   GET /internal/expense?employeeId=<employeeId>
```

---

## 9. Suggested screens & data mapping

| Screen                        | Primary calls                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------- |
| Employee list                 | `GET /internal/employee` (+ optional `GET /internal/ledger/employee/:id/balance` per row or a batch) |
| Employee detail / profile     | `GET /internal/employee/:id`, `GET /internal/ledger/employee/:id/balance`      |
| Create / edit employee form   | `POST` / `PATCH /internal/employee`                                            |
| "Give advance" modal          | `POST /internal/payments` with `entityType: "employee"`                        |
| "Add spend" modal              | `POST /internal/expense` with `employeeId`                                     |
| Employee statement / passbook | `GET /internal/ledger/statement?entityType=employee`                           |
| Advances list                  | `GET /internal/payments?entityType=employee&entityId=<uuid>`                   |
| Spends list                    | `GET /internal/expense?employeeId=<uuid>`                                       |
| Company accounts               | `GET /internal/accounts/balances`, `GET /internal/accounts/transactions`       |

**UI notes**
- Display cash in hand prominently: green when `balance > 0` (employee holds company money), red
  when `balance < 0` (employee spent more than advanced).
- On the statement, map `credit` → money given and `debit` → money spent.
- Fetch the employee list once and build an `id → employee` map to label `expense.employeeId` and
  `payment.party`.
- Payment method values are case-sensitive and mixed-case (`bKash`), so don't lowercase them.

---

## 10. Gotchas / rules to respect

1. **`employeeId` on an employee is a code** (`"EMP-001"`, unique). On an **expense** and a
   **payment**, `entityId`/`employeeId` is the employee **uuid** (`Employee.id`). Don't mix them up.
2. **Employee expenses never change company balances.** Do not expect them in
   `/internal/accounts/transactions`.
3. **Advances are stored as payments** with `entityType: "employee"`. Reuse your existing
   payment-method picker; the account deduction is automatic.
4. `spentBy` is **auto-filled** from the employee name when `employeeId` is sent — you may omit it.
5. Editing an expense/payment **syncs its ledger entry**, so balances update immediately; no manual
   recalculation needed on the client. Refetch the balance/statement after any mutation.
6. Deleting an employee does not delete their ledger history; the statement route 404s once the
   employee record is gone.
7. All list endpoints default to `page=1`, `limit=10`, sorted `createdAt DESC` unless you pass
   `sortBy`/`sortOrder`.
8. Date-only filters (`YYYY-MM-DD`) include the **entire** end day.

---

## 11. Quick reference

| Method | Path                                                   | Purpose                          |
| ------ | ------------------------------------------------------ | -------------------------------- |
| POST   | `/internal/employee`                                   | Create employee                  |
| GET    | `/internal/employee`                                   | List employees (search/filters)  |
| GET    | `/internal/employee/:id`                               | Employee detail                  |
| PATCH  | `/internal/employee/:id`                               | Update employee                  |
| DELETE | `/internal/employee/:id`                               | Delete employee                  |
| POST   | `/internal/payments` (`entityType: "employee"`)        | Give an advance                  |
| GET    | `/internal/payments?entityType=employee&entityId=<id>` | Advance history (with `party`)   |
| GET    | `/internal/payments/:id`                               | Advance detail                   |
| PATCH  | `/internal/payments/:id`                               | Edit an advance                  |
| DELETE | `/internal/payments/:id`                               | Delete an advance                |
| POST   | `/internal/expense` (`employeeId`)                     | Record money spent by employee   |
| GET    | `/internal/expense?employeeId=<id>`                    | Employee spends                  |
| GET    | `/internal/expense/:id`                                | Expense detail                   |
| PATCH  | `/internal/expense/:id`                                | Edit an expense                  |
| DELETE | `/internal/expense/:id`                                | Delete an expense                |
| GET    | `/internal/ledger/statement?entityType=employee&entityId=<id>` | Employee statement      |
| GET    | `/internal/ledger/employee/:employeeId/balance`        | Cash in hand                     |
| GET    | `/internal/ledger/filter?entityType=employee&entityId=<id>` | Raw ledger entries          |
| GET    | `/internal/accounts/balances`                          | Company balance per method       |
| GET    | `/internal/accounts/transactions`                      | Company money-movement feed      |

Swagger (`GET /docs`) is the live, schema-derived version of the above.
