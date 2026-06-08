# Love Letters — Frontend PRD

## Original problem statement (2026-06-05)
Adapt the React frontend (`rupertviglione/loveletters-frontend`, deployed on Netlify
at `https://weloveloveletters.netlify.app`) to use new endpoints/contracts that the
FastAPI backend at `https://loveletters-backend.onrender.com` recently shipped:

1. **Page `/success`** — read `session_id`, poll `GET /api/checkout/status/{session_id}`
   every 2s up to ~30s, treat `paid === true` as success, show order details, clear cart;
   on timeout show "payment processing" + retry button. Fall back to
   `GET /api/orders/by-session/{session_id}` if status endpoint fails.
2. **Backoffice — Orders** — Activas / Arquivadas sub-tabs (`GET /api/admin/orders` vs
   `GET /api/admin/orders/archived`), keep Archive, add **Unarchive** button
   (`POST /api/admin/orders/{id}/unarchive`). Status / tracking edits via
   `PATCH /api/admin/orders/{id}`.
3. **Backoffice — Messages** — auto-refresh every 25s, sidebar badge via
   `GET /api/admin/notifications`, **Reply modal** (subject, message, attachments)
   via multipart `POST /api/admin/contacts/{id}/reply`, plus Activas / Arquivadas
   sub-tabs and Unarchive.
4. **Public contact form** — keep `POST /api/contact`, change the success toast.
5. **Token expiry** — 401 → redirect to `/admin/login?expired=1`.

Do NOT touch the public catalogue, static pages, admin login, or checkout-session creation.

## Architecture
- React 19 + Create React App (CRACO) + Tailwind + react-hot-toast.
- Single SPA hitting an external FastAPI backend (Render); CORS open.
- Stripe Checkout in TEST mode.
- Hosted on Netlify via `netlify.toml`; `REACT_APP_BACKEND_URL` set in env.
- Single HTTP stack: `fetch`-based `apiFetch` in `src/services/api.js`. Axios removed.

## What's been implemented

### 2026-06-05 — Backend contract migration (iteration 5)
- `/success`: full rewrite of `src/pages/Success.js` with 15-attempt × 2-second polling,
  automatic fallback to `/api/orders/by-session/{session_id}` on status-endpoint
  errors, order summary render, cart-clear, timeout screen + retry button.
- Backoffice orders: Activas / Arquivadas sub-tabs (`orders-tab-active|archived`),
  Archive + new **Unarchive** button (`POST /api/admin/orders/{id}/unarchive`).
- Backoffice messages: Activas / Arquivadas sub-tabs, 25s auto-refresh while tab
  is visible, **Reply modal** with subject/message/attachments multipart POST to
  `/admin/contacts/{id}/reply` (no manual `Content-Type` so browser sets the
  boundary). Inline reply history.
- Public contact form: new success toast wording.
- 401 handling: hard redirect to `/admin/login?expired=1` from a centralised
  `handleAdminUnauthorized`, yellow banner on AdminLogin.
- Hardened `apiFetch` (removed `response.clone()` usage; preview-environment
  fetch instrumentation was consuming the body).

### 2026-06-05 — Refactor pass (iteration 6)
- **Split `AdminDashboard.js`** (was ~1.5k LOC) into:
  - `pages/AdminDashboard.js` — thin orchestrator (~150 LOC; auth, tabs, notification badges)
  - `components/admin/ProductsTab.jsx`
  - `components/admin/ProductForm.jsx`
  - `components/admin/OrdersTab.jsx`
  - `components/admin/ContactsTab.jsx`
  - `components/admin/ReplyModal.jsx`
  - `components/admin/constants.js` — shared helpers (`getRecordId`, `isUnread`,
    `ORDER_STATUSES`, `COLLECTION_SUBCATEGORIES`, etc.)
- **Consolidated HTTP layer**: dropped axios; `apiFetch` is the single entry point.
  New helpers: `adminLogin`, `adminVerify`, `adminCreateProduct`,
  `adminUpdateProduct`, `adminDeleteProduct`, `adminGetOrders`,
  `adminGetArchivedOrders`, `adminPatchOrder`, `adminArchiveOrder`,
  `adminUnarchiveOrder`, `adminDeleteOrder`, `adminMarkOrderRead`,
  `adminGetContacts`, `adminGetArchivedContacts`, `adminArchiveContact`,
  `adminUnarchiveContact`, `adminDeleteContact`, `adminMarkContactRead`,
  `adminReplyContact`, `adminGetNotifications`, `getProducts`, `getProduct`,
  `createCheckoutSession`, `getCheckoutStatus`, `getOrderBySession`,
  `submitContact`. axios stays in `package.json` (unused; tree-shaken out).
- **`ConfirmDialog` modal** (`src/components/ConfirmDialog.jsx`) replaces every
  `window.confirm()` / `alert()` in the admin area. Used for: delete product,
  delete order, delete contact. Provides `confirm-dialog`, `confirm-cancel`,
  `confirm-ok` data-testids.
- **Loader spinner** on `OrdersTab` "Guardar alterações" and `ProductForm`
  "GUARDAR" buttons (lucide `Loader` + `animate-spin`) replaces text-only state.
- **Responsive orders panel**: order header switches from `flex-col` on mobile to
  `flex-row` on `sm:` (≥640px). Action buttons row remains wrap-friendly. Same
  treatment applied to contacts rows.
- **Order item display**: now reads `item.title_pt` first (fixes the stale
  "1x Produto" label in the backoffice — now shows "O poema e tu" etc.).

## Verified
- Testing agent iteration_5 — initial migration: PASSED with two issues fixed in-session
  (verifyAuth 401 redirect lost `?expired=1`; `response.clone()` crash).
- Testing agent iteration_6 — refactor pass: 13/13 scenarios PASS, no regressions.
  Archived order `LL-20260605-4B5493` left intact for re-test.
- Testing agent iteration_7 (2026-06-08) — Outbox + banner + Success simplification:
  15/16 scenarios PASS. The only failure is backend-side: live
  `POST /api/admin/email/diagnose` hangs >90s on Render; frontend now applies a
  client-side 30s `AbortController` timeout and surfaces a friendly toast.

## Iteration 8 (2026-06-08) — Backend hardening alignment
Backend shipped build `2026-06-hardening` with: bounded diagnose (≤15s, always
JSON), truncated body in outbox listing (`body_truncated` / `body_full_length`),
login rate-limit (HTTP 429 + `Retry-After`), `token_expires_in_minutes` on
verify, 422 with CORS headers, optional pagination on /products, and
`timing_ms` on /reply.

Frontend adjustments:
- **DiagnoseResult.jsx** — new structured panel for `/email/diagnose`:
  overall pill (`SONDA OK` / `SONDA FALHOU` + `duration_ms`), three step badges
  (connect / auth / send) coloured by value, error line with `error_type`,
  SMTP config block (host:port, use_tls, auth_user, from_email, password set
  flag + length), collapsible raw JSON. `OutboxTab.jsx` swapped its raw `<pre>`
  for `<DiagnoseResult />`. Diagnose AbortController reduced from 30s → 20s.
- **AdminLogin.js** — `429` is now mapped to a friendly
  `Demasiadas tentativas. Tenta novamente em {Retry-After}s.` message instead
  of "Invalid credentials" (reads the response header via `err.response.headers`).
- **AdminDashboard.js** — reads `token_expires_in_minutes` from `/admin/verify`,
  shows an amber `Sessão expira em N min` pill in the header when N ≤ 30 (also
  schedules a `setTimeout` that auto-logs out exactly at expiry to avoid stale
  401s mid-action).
- **api.js → `formatApiError(err, fallback)`** — central helper that
  understands FastAPI shapes: array of `{loc, msg, type}` (422), string detail,
  and `{message|error}` objects. Used by Contact and ReplyModal.
- **Contact.js** — 422 from `POST /api/contact` now surfaces the first 2 field
  errors via `formatApiError` (`Verifica os campos: email: field required`).
- **ReplyModal.jsx** — switched to `formatApiError`; in dev builds, prints a
  console.debug line with server-side `timing_ms.total` (and parse / enqueue
  splits) vs the client round-trip, useful to isolate network from backend.
- **`<style jsx>` warning fix** — removed the styled-jsx attribute from
  Home.js, Shop.js and Contact.js (CRA doesn't process it; React 19 was
  warning "Received true for a non-boolean attribute jsx"). The `<style>`
  tags work the same.

Not adopted this round (intentional):
- `?limit=&skip=` pagination on `/api/products` — current catalogue
  comfortably fits under the 2000-item ceiling; can be added when traffic
  justifies it.
- The Outbox listing now truncates `body` to 500 chars server-side. Because
  the row UI never showed `body` (only subject is truncated client-side) and
  the detail modal already fetches `GET /api/admin/mail-outbox/{id}` for the
  full body, no UI work was needed.

## Iteration 7 (2026-06-08) — what was added
- **Backoffice Outbox tab** (`/app/frontend/src/components/admin/OutboxTab.jsx` +
  `OutboxDetailModal.jsx` + `outboxHelpers.js`). 4 status pills, filters by
  status/kind, free-text search, row-level Retry/Cancel, bulk "Retry all failed"
  (confirm dialog), "Diagnose SMTP" + "Send test email" buttons, polling every
  30s, kind humanisation in PT. Wired to:
    - `GET /api/admin/mail-outbox`, `GET /api/admin/mail-outbox/{id}`,
    - `GET /api/admin/mail-outbox/stats`,
    - `POST /api/admin/mail-outbox/{id}/{retry,cancel}`,
    - `POST /api/admin/mail-outbox/retry-all`,
    - `POST /api/admin/email/diagnose` (with 30s AbortController timeout),
    - `POST /api/admin/email/test`.
- **Free-shipping banner** (`/app/frontend/src/components/FreeShippingBanner.js` +
  `SiteConfigContext.js`). Fixed red top bar, copy + threshold sourced from
  `GET /api/config`, hidden on `/contact`, `/shipping-returns`, `/admin/*`.
  Header now offsets `top-[28px]` when banner is visible.
- **Cart free-shipping hint** — `Faltam X€ para envio gratuito.` when subtotal
  < threshold; `Envio gratuito desbloqueado!` once subtotal ≥ threshold.
  testids: `free-shipping-progress`, `free-shipping-unlocked`.
- **Success page** — simplified copy to
  `O teu pedido foi confirmado. Enviámos a confirmação para {email}.` (the
  "Estamos a tentar" warning fork was removed entirely; `emailWarning` state
  retired).

## Not changed (per requirements)
- Catalogue, product detail, filters, /shop, /product/[id].
- Static pages (About, FAQ, T&Cs, Shipping & Returns).
- Admin login endpoint / form structure.
- `POST /api/checkout/session`.

## Backlog / next actions
- **Backend (out of frontend scope, reported to user)**:
  - `POST /api/admin/email/diagnose` hangs indefinitely on Render — needs a
    server-side asyncio timeout around the SMTP probe and a guaranteed JSON
    response on failure.
  - `POST /api/admin/contacts/{id}/reply` has slow/timeout-prone SMTP send;
    move to background task / queue.
  - `GET /api/checkout/status/{session_id}` returns 500 for archived sessions;
    frontend already falls back to `/orders/by-session` but the endpoint should
    be fixed server-side.
- **Frontend nice-to-haves**:
  - Extract `<OutboxTable />`, `<OutboxActions />`, `<OutboxFilters />` from
    OutboxTab.jsx (~520 lines) if more features land.
  - Optional `?notify=false` toggle on the Save button for silent status updates.
  - Add a "copy tracking URL" button on shipped orders.
  - Highlight the `webmail_url` from the reply response so the operator can
    open the sent email in webmail directly.
  - Surface a "X novas encomendas hoje" stat on the dashboard landing.

## User personas
- **Loja** (Margarida): backoffice operator — needs fast order/message triage,
  archive/unarchive, reply by email with attachments, see new-item badges.
- **Cliente**: reaches `/success` after Stripe Checkout — needs immediate confirmation
  of order #, items, total, shipping and a clear "email sent to X" message.

## Test credentials
See `/app/memory/test_credentials.md`.
