# Admin Panel API Integration Guide

> **Date:** July 2, 2026  
> **Base URL:** `https://ecommerce-api-stg.fistech.org/api/v1`  
> **Auth:** Bearer JWT token required for internal endpoints

---

## Table of Contents

1. [Subcategory Module (New)](#1-subcategory-module-new)
2. [Category Hierarchy — Parent + Children](#2-category-hierarchy--parent--children)
3. [Product Creation — Subcategory Selection (Cascading)](#3-product-creation--subcategory-selection-cascading)
4. [New Product Fields: shortDescription & position](#4-new-product-fields-shortdescription--position)
5. [Gallery Changes (Bulk Delete Fix & Multi Upload)](#5-gallery-changes-bulk-delete-fix--multi-upload)
6. [Product Filtering by Subcategory](#6-product-filtering-by-subcategory)
7. [Migration](#7-migration)

---

## 1. Subcategory Module (New)

A subcategory is a **Category that has a parent**. It uses the same `categories` table but is managed through dedicated endpoints. Every subcategory requires a `parentId` (the parent category's UUID).

### Data Model (Category entity)

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Auto-generated |
| `title` | String (required) | Category/subcategory name |
| `icon` | String (optional) | Icon URL |
| `banner` | String (optional) | Banner image URL |
| `position` | Number (default: 0) | Sort order |
| `parentId` | UUID (nullable) | **For subcategories only** — the parent category ID |
| `parent` | Object (nullable) | Populated parent category object |
| `children` | Array | **For parent categories** — list of subcategories |

### Internal CRUD Endpoints (Admin Panel)

**Base:** `internal/sub-categories`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/internal/sub-categories` | List all subcategories (with `?parentId=` to filter) |
| `GET` | `/internal/sub-categories/:id` | Get single subcategory |
| `POST` | `/internal/sub-categories` | Create a subcategory |
| `PATCH` | `/internal/sub-categories/:id` | Update a subcategory |
| `DELETE` | `/internal/sub-categories/:id` | Delete a subcategory |
| `DELETE` | `/internal/sub-categories/bulk` | Bulk delete subcategories |

**POST/PATCH request body (Create/Update):**

```json
{
  "title": "Science Fiction",           // required
  "parentId": "uuid-of-parent-category", // required for create, optional for update
  "icon": "https://...",                // optional
  "banner": "https://...",              // optional
  "position": 1,                        // optional, default: 0
  "isActive": true                      // optional
}
```

**GET response example:**

```json
{
  "success": true,
  "data": [
    {
      "id": "abc-123",
      "title": "Science Fiction",
      "icon": "...",
      "banner": "...",
      "position": 1,
      "parentId": "parent-uuid",
      "parent": { "id": "parent-uuid", "title": "Fiction" },
      "isActive": true,
      "createdAt": "2026-07-02T..."
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5 }
}
```

### Web Endpoints (Public / Customer-Facing)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/web/sub-categories` | List all subcategories (sorted by position ASC). Use `?parentId=` to get children of a specific category |
| `GET` | `/web/sub-categories/:id` | Get single subcategory |

---

## 2. Category Hierarchy — Parent + Children

Categories now return their **parent** and **children** (subcategories) in the API response.

### Internal Endpoints

**Base:** `internal/categories`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/internal/categories` | List categories (with `parent` relation) |
| `GET` | `/internal/categories/:id` | Get single category (with `parent` relation) |
| `POST` | `/internal/categories` | Create a category |
| `PATCH` | `/internal/categories/:id` | Update a category |

### Web Endpoints (Public)

**Base:** `web/categories`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/web/categories` | List categories with `parent` **and** `children` included. Sorted by position ASC, active only |
| `GET` | `/web/categories/:id` | Get single category with `parent` and `children` |

**Web GET response example:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cat-1",
      "title": "Fiction",
      "position": 0,
      "children": [
        { "id": "sub-1", "title": "Science Fiction", "parentId": "cat-1" },
        { "id": "sub-2", "title": "Romance", "parentId": "cat-1" }
      ],
      "isActive": true,
      "createdAt": "..."
    }
  ]
}
```

### Admin Panel UI — How to Build Cascading Dropdowns

1. **Fetch categories:** `GET /web/categories` → returns categories with their `children` array
2. **First dropdown:** Show parent categories (items that have `children.length > 0`)
3. **Second dropdown (subcategory):** When a category is selected, populate this dropdown with the selected category's `children`
4. **On product create/edit form:**
   - Category dropdown = parent categories
   - Subcategory dropdown = children of selected category (auto-populated)

*Alternatively*, fetch subcategories via `GET /web/sub-categories?parentId=<categoryId>` if you need only the subcategories of a specific parent.

---

## 3. Product Creation — Subcategory Selection (Cascading)

Products now accept a **`subcategoryId`** field alongside `categoryId`.

### Updated Product Create/Update DTOs

Both `POST /internal/products` and `PATCH /internal/products/:id` now accept:

```json
{
  // ... existing fields (title, slug, mrp, etc.)

  "categoryId": "parent-category-uuid",     // optional — the main category
  "subcategoryId": "subcategory-uuid",       // NEW — optional, select a subcategory

  // ... existing fields (categories array, genres, etc.)
}
```

**Important:** The `categories` array (junction table, used for many-to-many category tagging) still exists:

```json
{
  "categories": [
    { "categoryId": "cat-uuid-1" },
    { "categoryId": "cat-uuid-2" }
  ]
}
```

And `subcategoryId` is separate — it's a direct foreign key to the Category entity (not through the junction table).

### Admin Panel Product Form — Suggested UI Flow

1. **Category dropdown:** List parent categories (from `GET /web/categories`)
2. **Subcategory dropdown:** When a category is selected, fetch subcategories via `GET /web/sub-categories?parentId=<selectedCategoryId>` and populate this dropdown
3. **On save:** Send both `categoryId` and `subcategoryId` in the product create/update payload
4. **On edit:** Pre-populate both dropdowns from the product's `categoryId` and `subcategoryId` values

### API Response Changes (Product Detail)

The product detail endpoint now returns the subcategory alongside the category:

```json
{
  "id": "prod-123",
  "title": "Dune",
  "categoryId": "fiction-uuid",
  "category": { "id": "fiction-uuid", "title": "Fiction" },
  "subcategoryId": "sci-fi-uuid",
  "subcategory": { "id": "sci-fi-uuid", "title": "Science Fiction" },
  // ... other fields
}
```

This applies to:
- `GET /web/products/:id`
- `GET /web/products/by-slug/:slug`
- `GET /web/products/by-code/:code`
- `GET internal/products/:id`
- `GET /internal/products/by-slug/:slug`
- `GET /internal/products/by-code/:code`

---

## 4. New Product Fields: shortDescription & position

### `shortDescription`

| Field | Type | Required | Description |
|---|---|---|---|
| `shortDescription` | String | No | A brief product description. On the frontend, users can input rich text (HTML). The API stores it as a text string, so you can send HTML content directly. |

**Example payload:**
```json
{
  "shortDescription": "<p>This is a <strong>short description</strong> with rich text.</p>"
}
```

This field is returned in all product list and detail responses:
- `GET /web/products` (list) — yes, included in select
- `GET /web/products/:id` (detail) — yes
- All internal product endpoints — yes

### `position`

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `position` | Number | No | `0` | Sort order for the product listing |

**How it works:**
- `GET /web/products` now defaults to sorting by `position ASC` (previously sorted by `createdAt DESC`)
- Products with lower `position` values appear first
- This allows admin panel users to manually order products

**Example payload:**
```json
{
  "position": 1
}
```

---

## 5. Gallery Changes (Bulk Delete Fix & Multi Upload)

### Bulk Delete Fix

The `DELETE /internal/gallery/bulk` endpoint was returning a validation error:

```
property deletedBy should not exist
```

**This is now fixed.** The bulk delete DTO now accepts a `deletedBy` field (added automatically by the interceptor).

**No changes needed on the frontend** — you can send the exact same request as before:

```json
{
  "ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

### Multiple File Uploads

The upload limit for multiple files has been increased from **5 → 20 files** at once.

| Endpoint | Max Files | Endpoint |
|---|---|---|
| `POST /internal/gallery/upload` | 1 file (single upload) | `POST /web/gallery/upload` |
| `POST /internal/gallery/uploads` | **20 files** | `POST /web/gallery/uploads` |

For multi-upload, use `multipart/form-data` with field name `files` (plural):

```html
<form>
  <input type="file" name="files" multiple />
</form>
```

```javascript
// Example: Upload 20 files at once
const formData = new FormData();
files.forEach(file => formData.append('files', file));

await axios.post('/api/v1/internal/gallery/uploads', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Supabase Storage Deletion

When a gallery file is deleted (single or bulk), the file is now automatically removed from Supabase storage. Previously only the database record was deleted. No frontend changes needed.

---

## 6. Product Filtering by Subcategory

The product listing endpoint now supports filtering by subcategory.

### `GET /web/products`

| Query Param | Type | Example | Description |
|---|---|---|---|
| `categoryId` | UUID | `?categoryId=abc-123` | Filter by parent category **(also includes products from its subcategories)** |
| `subcategoryId` | UUID | `?subcategoryId=xyz-789` | Filter by specific subcategory |

**Behavior:**
- `?categoryId=parent-uuid` → returns products that have this category OR any of its subcategories assigned (via the `categories` junction table)
- `?subcategoryId=sub-uuid` → returns products that have this exact subcategory assigned via `subcategoryId`
- `?categoryId=parent-uuid&subcategoryId=sub-uuid` → AND combination of both filters

**Examples:**
```
GET /web/products?categoryId=fiction-uuid
  → Returns products in "Fiction" OR any of its subcategories ("Sci-Fi", "Romance", etc.)

GET /web/products?subcategoryId=sci-fi-uuid
  → Returns products specifically tagged with subcategory "Science Fiction"

GET /web/products?categoryId=fiction-uuid&subcategoryId=sci-fi-uuid
  → Returns products that are in "Fiction" category AND specifically "Sci-Fi" subcategory
```

---

## 7. Migration

A TypeORM migration has been created to add the new database columns.

**Migration file:** `src/database/migrations/1782945107055-AddSubcategoryIdToProductsAndParentIdToCategories.ts`

**Changes:**
1. Adds `parentId` column (UUID, nullable) + foreign key to `categories` table (self-referencing for the category hierarchy)
2. Adds `subcategoryId` column (UUID, nullable) + foreign key to `products` table (references `categories.id`)

**Run migration:**
```bash
yarn db:migration:run
```

---

## Summary of All Changes

| Feature | What Changed | Frontend Impact |
|---|---|---|
| **Subcategory CRUD** | New routes: `internal/sub-categories` and `web/sub-categories` | Build subcategory management UI in admin panel |
| **Category hierarchy** | `GET /web/categories` now returns `children` array | Build cascading dropdowns |
| **Product subcategory** | New `subcategoryId` field on product create/update | Add subcategory dropdown to product form |
| **shortDescription** | New optional text field on product | Rich text input in product form |
| **position** | New sort field on product; listing defaults to `position ASC` | Reorder UI in admin panel |
| **Gallery bulk delete** | Fixed `deletedBy` validation error | No frontend change needed — just send `ids` array |
| **Gallery multi-upload** | Limit increased from 5 → 20 files | Can upload up to 20 files at once |
| **Gallery storage cleanup** | Files deleted from Supabase on gallery delete | No frontend change needed |
| **Product filter** | `?subcategoryId=` filter; `?categoryId=` cascades to subcategories | Add subcategory filter in product listing UI |

---

*End of integration guide. For questions, contact the backend team.*
