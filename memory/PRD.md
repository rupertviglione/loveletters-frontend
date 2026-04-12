# Love Letters - PRD

## Architecture
- **Frontend**: React 19, Tailwind CSS, Framer Motion, React.lazy code splitting
- **Backend**: FastAPI, Motor (MongoDB Atlas), Stripe, JWT auth, Security headers, Rate limiting
- **Database**: MongoDB Atlas (loveletters.pcoahxd.mongodb.net) with indexes

## What's Been Implemented

### Session 1-3 (2026-04-12):
- Content changes (removed "Poesia que se veste", swapped sections, removed italic)
- Dark mode fix (logo visibility, warm color scheme)
- Checkout loading states + double-submit prevention
- Code splitting, API service layer, security headers, rate limiting, DB indexes

### Session 4 (2026-04-12):
- **MongoDB Atlas**: Connected to real Atlas cluster with 17 real products + real images
- **Typewriter contact page**: Reduced to 100% width (shows full machine body, keys, base), opacity 0.8
- **Dark mode typewriter**: Removed grayscale filter - image stays natural with paper WHITE (not grey), typewriter whites visible
- **Form fields**: Always black text on white paper (natural, not dark-mode adapted since they sit on white paper)
- **Favicon**: Typographic "LL." italic serif on red background, cache-busted (?v=3)
- **Mobile responsiveness verified**: Home, Shop (2-col), Product Detail, Contact - all working well

## Stripe Configuration
**AWAITING**: Author needs to:
1. Create account at https://dashboard.stripe.com
2. Share Secret Key (sk_live_... or sk_test_...)
3. Configure webhook at: `https://loveletters-backend.onrender.com/api/webhook/stripe`
4. Share Webhook Secret (whsec_...)

## Next Tasks
1. Stripe keys from author
2. "Drops ou mini-colecoes" structure from author
3. Optional: React Query, JWT refresh tokens
