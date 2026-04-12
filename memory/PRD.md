# Love Letters - PRD

## Architecture
- **Frontend**: React 19, Tailwind CSS, Framer Motion, React Router DOM, Axios, React.lazy code splitting
- **Backend**: FastAPI, Motor (MongoDB async), Stripe, JWT auth, Security headers middleware, Rate limiting
- **Database**: MongoDB (loveletters) with indexes on id, created_at, session_id

## What's Been Implemented

### Session 1 (2026-04-12):
- Removed "Poesia que se veste", swapped hero sections, removed italic
- Fixed dark mode (logo visibility, warm color scheme)
- New favicon (LL italic serif on red)
- Backend configured, 17 products seeded

### Session 2 (2026-04-12):
- Typewriter fix (transparency, grayscale dark mode)
- Hero improvements (smaller, CTA above fold)
- Shop 4-column grid, compact product cards
- Footer simplified
- Backend /health endpoint + DB indexes

### Session 3 (2026-04-12):
- **Checkout loading states**: Spinner on submit button, disabled inputs/button during loading, error display area
- **Double-submit prevention**: useRef flag + loading state check
- **Success page**: Distinct states (checking/success/timeout/error), cleanup on unmount, single cart clear
- **Code splitting**: React.lazy for all non-home routes with Suspense + PageLoader fallback
- **API service layer**: /services/api.js with typed functions
- **Security headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy
- **Rate limiting**: Admin login limited to 5 attempts per 5 min window per IP
- **DB indexes**: Unique indexes on id fields, indexes on created_at and session_id

### Testing: 100% backend (12/12), 85% frontend (checkout loading states untestable without live Stripe)

## ChatGPT Suggestions - Completion Status

### DONE:
- [x] Hero: headline reduced, CTA above fold, reduced background noise
- [x] Layout: grid consistency, normalized alignments, text max-width
- [x] Shop: reduced card size, increased grid density, hierarchy (image/name/price), hover states
- [x] Filters: improved active states, interactive hover
- [x] Buttons: hover/active states, better contrast and padding
- [x] Footer: simplified
- [x] Checkout: loading state, prevent multiple submits, error display
- [x] Success page: backend verification, distinct states (success/pending/error), timeout fallback
- [x] Structure: API service layer (/services/api.js)
- [x] Code splitting by route (React.lazy)
- [x] Health endpoint (GET /health)
- [x] Security headers
- [x] Rate limiting on login
- [x] Database indexes
- [x] Stripe prices from backend only (already existed)
- [x] Webhook implementation (already existed)

### REMAINING:
- [ ] API versioning (/api/v1/) - LOW priority, can break existing clients
- [ ] React Query for data management - MEDIUM priority
- [ ] JWT refresh tokens + shorter expiry - MEDIUM priority
- [ ] Image conversion to WebP/AVIF - LOW priority
- [ ] Pagination on DB queries - LOW priority (small dataset)

## Stripe Configuration
**AWAITING**: Author needs to create Stripe account and share:
1. Secret Key (sk_live_... or sk_test_...)
2. Webhook Secret (whsec_...)
From: https://dashboard.stripe.com/apikeys

## Next Tasks
1. Configure real Stripe keys when author provides them
2. Wait for author on "Drops ou mini-colecoes" structure
3. Replace placeholder product images
