# Commerce CRM & ERP Architectural Design Decisions

This document synthesizes industry best practices from leading enterprise and commerce systems (Shopify Admin, Zoho Books/Inventory, Odoo, Medusa Admin, Vyapar, WooCommerce) tailored to RF Riddhy's Next.js 16 + MongoDB architecture.

---

## 1. Data Tables & CRM UX Architecture

### Industry Benchmark
- **Shopify & Medusa Admin:** Keep URL query parameters (`?q=&status=&page=&sort=`) as the single source of truth for table state. This allows refreshing, bookmarking, and sharing exact filtered views among staff.
- **Zoho & Salesforce:** Provide persisted "Saved Views" (e.g., "Low Stock Appliances", "Pending Invoices") per user or role, alongside debounced search (300ms) with keyboard shortcut navigation (`/` to focus search).
- **Table Density & Sticky Layouts:** Provide dense / compact / comfortable row heights, sticky headers with `position: sticky; top: 0; z-index: 10`, column toggles stored in localStorage, and optimistic updates for quick edits (price/stock).

### RF Riddhy Implementation
1. **Server-Side Query Pipeline:**
   - Search uses MongoDB `$text` index with fallback regex matching on `name`, `slug`, `sku`, `brand`, and `category`.
   - Dynamic aggregation pipeline returns `{ items, total, page, limit, facets }`. Facet aggregation runs in parallel or via `$facet` to return live counts for status (`draft`, `active`, `archived`), category, tags, and stock status (`in`, `low`, `out`) without N+1 queries.
2. **State Synchronization:**
   - React state syncs bidirectionally with URLSearchParams using Next.js `useRouter` / `useSearchParams`.
   - Active filter pills display selected constraints with single-click dismissal and "Clear All".
3. **Bulk Actions:**
   - Multi-row selection checkbox (with "select page" vs "select all filtered") triggering a floating action toolbar: bulk status update, bulk tag addition/removal, bulk category reassignment, archive, and export.
4. **Quick Edit:**
   - Inline cell editing for price, MRP, and available stock with optimistic UI update, rollback on failure, and toast notifications.

---

## 2. Product Catalogue & Media Drawer

### Industry Benchmark
- **Odoo & Shopify:** Complex entities are edited via right-side slide-over drawers or modular tabbed workspaces (General, Media, Pricing & Tax, Inventory & Fulfillment, Merchandising/Tags, Warranty, SEO).
- **Soft Deletion / Archival:** E-commerce systems never hard-delete products that exist in historical orders or stock movements. Instead, they transition products to `archived` status, preserving referential integrity.
- **SKU & Variant Rules:** Unique SKU per sellable SKU unit. Primary product retains canonical gallery where index 0 is primary thumbnail.

### RF Riddhy Implementation
1. **Drawer Architecture:** Slide-over modal drawer (`AdminProductDrawer`) divided into distinct tabs:
   - **General:** Name, slug, category, brand, type (`furniture` | `appliance`), description, model type.
   - **Media:** Drag-and-drop file upload zone, thumbnail gallery with drag/drop reordering, primary badge, alt text editor, and media library selector.
   - **Pricing & Tax:** Selling price, MRP, discount %, GST rate (default 18%), HSN code.
   - **Inventory:** Default warehouse stock, low-stock threshold, reserved units indicator.
   - **Tags & Merchandising:** Multi-select tag chips (`best-selling`, `popular`, `trending`, `new-arrival`, `featured`, `deal`), pin/hide overrides, custom badge text.
   - **Warranty:** Coverage duration (months/years), policy selection, start-rule override.
   - **SEO:** Meta title, description, keywords.
2. **Media Processing Engine:**
   - Server-side processing via `sharp`: strip metadata, auto-orient, convert to WebP at multiple responsive breakpoints (`thumb` 200px, `medium` 600px, `large` 1200px, `original` 2000px), plus a tiny 16px blur placeholder base64 data URL stored in MongoDB.
   - File storage abstraction supporting both local disk (`storage/uploads/products/YYYY/MM/...`) served via authenticated/cached Next.js Route Handler and Cloudinary for ephemeral environments (Vercel).

---

## 3. Order Lifecycle & Finite State Machine

### Industry Benchmark
- **Shopify & ERPs:** Explicit finite state machine preventing illegal state transitions (e.g. an order cannot move from `draft_cart` directly to `delivered` without passing through payment and fulfillment).
- **Immutable Timeline:** Every transition produces an append-only `OrderEvent` with `from`, `to`, `actorId`, `note`, and timestamp.

### RF Riddhy State Machine
```
[draft_cart] ──> [reserved] ──> [payment_pending] ──> [paid] ──> [confirmed] ──> [processing] ──> [packed] ──> [shipped] ──> [out_for_delivery] ──> [delivered] ──> (optional: [installation_scheduled] ──> [installed]) ──> [completed]
     │                 │                │
     └──> [cancelled]  └──> [expired]  └──> [payment_failed]
                                                │
[delivered] ──> [return_requested] ──> [returned] ──> [refund_pending] ──> [refunded]
```
- **Side Effects on Transitions:**
  - `reserved`: Holds stock via `Reservation` records.
  - `paid`: Consumes reservation into permanent `StockMovement (sale)`, issues sequential `Invoice`, activates/schedules `ProductRegistration` for warranty.
  - `cancelled` / `expired`: Releases reservations atomically.
  - `refunded`: Generates sequential `CreditNote`, restocks inventory if returned.

---

## 4. Indian GST Invoicing Architecture

### Statutory & Industry Rules (CBIC / GST Act / Vyapar / Zoho Books)
1. **Invoice Numbering:**
   - Must be unique per financial year (April 1 to March 31).
   - Maximum 16 characters, alphanumeric with hyphens/slashes.
   - Format: `RF/YYYY-YY/NNNNNN` (e.g. `RF/2026-27/000001`).
   - Atomic generation via MongoDB `$inc` on a sequence counter collection per financial year. Numbers are strictly sequential and never reused.
2. **Tax Computation & Place of Supply:**
   - **Intra-state** (Seller State == Buyer State, e.g. Delhi to Delhi): Split equally into **CGST** (e.g. 9%) and **SGST** (9%).
   - **Inter-state** (Seller State != Buyer State, e.g. Delhi to Haryana): Assessed as **IGST** (18%).
3. **Mandatory Invoicing Fields:**
   - Seller Legal Name, Address, State, State Code, GSTIN.
   - Buyer Name, Billing Address, Shipping Address, State, State Code, Buyer GSTIN (B2B) or "Unregistered" (B2C).
   - Line items: Description, HSN/SAC code, Quantity, Unit Price, Discount, Taxable Value, CGST/SGST/IGST rates & amounts.
   - Total amount in figures and words (Indian numbering system: Lakhs/Crores).
4. **Credit Notes:**
   - Separate sequential sequence `RF/CN/YYYY-YY/NNNNNN`.
   - References original invoice number, original date, and reason for credit (return/reversal).
5. **PDF Generation:**
   - Generated dynamically using `pdfkit` (streaming or buffered response) with thermal/A4 professional typography, brand logo, terms & conditions, and authorized signatory line.

---

## 5. Warranty & Service Lifecycle

### Industry Benchmark
- **AppleCare / Dell / Samsung:** Direct serial number tracking, automatic activation upon retail checkout or courier delivery confirmation, transparent customer self-service lookup by phone/order.
- **Offline / Dealer Registrations:** Grace periods for manual registration with purchase proof upload; manual verification queue in admin.

### RF Riddhy Implementation
1. **Auto-Registration on Purchase:**
   - When an order transitions to `paid` (or `delivered` based on policy), a background worker or event handler creates 1 `ProductRegistration` document per quantity unit:
     - `orderId`, `orderNumber`, `productId`, `sku`, `unitIndex: 0..N-1`.
     - Unique compound index on `(orderId, sku, unitIndex)` guarantees idempotency on webhook replays.
     - `purchaseDate` = order date; `activationDate` = purchase date or delivery date; `expiryDate` = `activationDate + durationDays`.
2. **Late Customer Registrations (Offline Purchases):**
   - Customer submits invoice/receipt, date, optional serial number.
   - Expiry is calculated strictly from `purchaseDate + durationDays`, not registration date.
   - Status is marked `verified: false`, pending approval in admin registration queue.
3. **Active Days Remaining & Expiry:**
   - Computed dynamically using `daysRemaining(expiryDate)` in `Asia/Kolkata` timezone.
   - Derived status: `active`, `expiring_soon` (<= 30 days), `expired`.
4. **Claims & Extension:**
   - Customers can file claims directly from their account for active items.
   - Admin can assign claims, update SLA, and approve replacements or engineer visits.

---

## 6. Merchandising & Computed Rails

### Algorithmic Definition
1. **Best Selling:**
   - Calculated over a rolling 30-day window: sum of fulfilled/paid order item quantities per product.
2. **Popular:**
   - Engagement weighted score: `(views30d * 1) + (wishlistCount * 3) + (cartAdds30d * 5)`.
3. **Trending:**
   - Growth velocity: `Score(last 7 days) / max(Score(prior 7 days), 1)`.
4. **New Arrivals:**
   - Active products created within the last 30 days (`createdAt >= now - 30 days`).
5. **Manual Overrides:**
   - `tagOverrides.pin: [tag]` forces inclusion at the front of the rail.
   - `tagOverrides.hide: [tag]` excludes the product regardless of metric.
   - Merchandising admin interface allows custom ordering and campaign scheduling.

---

## 7. High-Performance Excel (.xlsx) & CSV Architecture

### Industry Benchmark
- **ExcelJS Streaming:** Exporting large datasets (10k+ records) in memory leads to Node.js heap exhaustion. Using `exceljs` workbook streaming directly writes chunks to HTTP response.
- **Formula Injection Mitigation:** Any text starting with `=, +, -, @` is sanitized with a leading single quote (`'`).

### Multi-Sheet Workbook Design
1. **Sheet 1: Data Table (e.g. Products / Orders / Invoices):**
   - Brand color header `#D97706` (amber gold) or `#0F172A` (slate dark) with bold white text.
   - Frozen top row (`views: [{ state: 'frozen', ySplit: 1 }]`).
   - Auto-filters enabled across all columns.
   - Explicit column widths, number formats (`₹#,##0.00`), date formats (`dd-mmm-yyyy`).
   - Conditional styling (e.g., status badges, low-stock highlight).
2. **Sheet 2: Summary Metrics:**
   - Aggregated metrics (count by category, total inventory value, average price).
3. **Sheet 3: Filter Metadata:**
   - Timestamp of generation, exporting admin user, and exact filter parameters applied.
