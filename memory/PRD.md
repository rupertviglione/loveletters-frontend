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
- React 19 + Create React App (CRACO) + Tailwind + react-hot-toast + axios.
- Single SPA hitting an external FastAPI backend (Render); CORS open.
- Stripe Checkout in TEST mode.
- Hosted on Netlify via `netlify.toml`; `REACT_APP_BACKEND_URL` set in env.

## What's been implemented (2026-06-05)

### /success — full rewrite of `src/pages/Success.js`
- 15-attempt × 2-second polling loop against `/api/checkout/status/{session_id}`.
- Treats `paid === true || payment_status === 'paid' || status === 'paid'` as success.
- Automatic fallback to `/api/orders/by-session/{session_id}` if the status endpoint errors
  (e.g. 500 on archived sessions).
- Renders order number, items (with selected_options), total, shipping address;
  shows "Enviámos um email de confirmação para X" with the customer email; warns if
  `confirmation_email_sent_at` is null.
- Clears `ll-cart` in localStorage on first success.
- Timeout state shows "O teu pagamento está a ser processado..." + **Tentar de novo**
  button (`success-retry-button` `data-testid`) that restarts the polling.

### Backoffice orders — `src/pages/AdminDashboard.js`
- Orders tab toggle "Activas" / "Arquivadas" (`orders-tab-active`, `orders-tab-archived`).
- Archive button on active orders → `POST /admin/orders/{id}/archive`.
- Unarchive button on archived orders → `POST /admin/orders/{id}/unarchive`.
- Empty-state copy adapts to current view.
- Item display now uses `title_pt` (fixes the "1x Produto" label).

### Backoffice contacts / messages — `src/pages/AdminDashboard.js`
- Activas / Arquivadas sub-tabs (`contacts-tab-active`, `contacts-tab-archived`).
- Auto-poll `/admin/contacts` every 25s while the tab is active and the page is visible.
- Reply modal (`reply-modal`, `reply-subject`, `reply-message`, `reply-attachments`,
  `reply-submit`):
  - Multipart `POST /admin/contacts/{id}/reply` with field name `attachment` (multi).
  - Browser sets the multipart boundary (no manual `Content-Type`).
  - Bearer auth.
  - Shows attachments count in success toast; falls back to error toast when
    `success === false` / `sent === false`.
- Archive / Unarchive buttons per row.
- Inline display of `contact.replies[]` history.

### Public contact form — `src/pages/Contact.js`
- Success toast wording updated to:
  *"Recebemos a tua mensagem! Vais receber um email de confirmação em instantes.
   Respondemos o mais rapidamente possível."* (+ EN translation).

### Auth / token expiry — `src/services/api.js`, `src/pages/AdminLogin.js`,
   `src/pages/AdminDashboard.js`
- New helpers: `adminGetOrders`, `adminGetArchivedOrders`, `adminArchiveOrder`,
  `adminUnarchiveOrder`, `adminGetContacts`, `adminGetArchivedContacts`,
  `adminArchiveContact`, `adminUnarchiveContact`, `adminReplyContact`,
  `getOrderBySession`.
- Both `apiFetch` and the axios interceptor call `handleAdminUnauthorized` on 401,
  which does a hard `window.location.replace("/admin/login?expired=1")` for any
  `/admin/*` path (except `/admin/login`).
- `AdminLogin` displays a yellow "A sessão expirou..." banner when `?expired=1` is present.
- `verifyAuth` no longer logs the user out on transient network errors (only on real 401s).
- Hardened `apiFetch` against `response.clone()` failures caused by external fetch
  instrumentation in the preview environment.

### Verified via testing agent (iteration_5) + manual screenshot
- Admin login + expired banner ✅
- Orders active/archived toggle + unarchive button ✅
- Contacts active/archived toggle + 25s auto-poll ✅
- Reply modal multipart wiring ✅ (backend currently has slow/failing SMTP send,
  but request reaches the API and is stored in `contact.replies[]`)
- Public contact form new toast ✅
- /success fallback to `/orders/by-session` for archived session ✅ (renders order
  LL-20260605-4B5493, €36.00, items, shipping, clears cart)
- /success timeout state with retry button ✅
- 401 hard redirect to `?expired=1` ✅ (after the `verifyAuth` + `clone()` fixes)

## Not changed (per requirements)
- Catalogue, product detail, filters
- Static pages (About, FAQ, T&Cs, Shipping & Returns)
- Admin login endpoint / form
- `POST /api/checkout/session`

## Backlog / next actions
- **Backend**: `POST /api/admin/contacts/{id}/reply` is slow/hangs in some cases
  (likely synchronous SMTP send). The frontend handles `success: false` / `sent: false`
  responses, but UX would benefit from the backend moving SMTP to a background task.
- **Backend**: `GET /api/checkout/status/{session_id}` returns 500 for archived
  sessions — the frontend now falls back to `/orders/by-session` automatically, but
  this should be fixed server-side.
- **Frontend (optional)**: Split `AdminDashboard.js` (currently 1.4k LOC) into
  `OrdersTab`, `ContactsTab`, `ReplyModal`, `ProductForm` files; replace remaining
  `alert()` / `confirm()` calls with toasts / a confirm dialog.
- **Frontend (optional)**: Consolidate the dual HTTP stack (raw fetch via `apiFetch`
  vs axios via `api`) into one.
- **Enhancement**: add a one-tap "Copy tracking URL" button on shipped orders in the
  backoffice; surface a "x novas encomendas hoje" stat on the dashboard landing.

## User personas
- **Loja** (Margarida): backoffice operator — needs fast order/message triage,
  archive/unarchive, reply by email with attachments, see new-item badges.
- **Cliente**: reaches `/success` after Stripe Checkout — needs immediate confirmation
  of order #, items, total, shipping and a clear "email sent to X" message.

## Test credentials
See `/app/memory/test_credentials.md`.
