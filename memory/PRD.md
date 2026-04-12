# Love Letters - PRD

## Architecture
- **Frontend**: React 19, Tailwind CSS, Framer Motion, React.lazy code splitting, Axios
- **Backend**: FastAPI, Motor (MongoDB Atlas), Stripe, JWT auth, Security headers, Rate limiting
- **Database**: MongoDB Atlas (loveletters.pcoahxd.mongodb.net) with indexes
- **Deployment**: Netlify (frontend), Render (backend)

## What's Been Implemented (2026-04-12)

### Content Changes:
- Removed "Poesia que se veste" from hero + SEO
- Swapped sections: "WRITE THAT LOVE LETTER" first, "THIS IS A LOVE POEM" second
- Removed italic from "E quando as palavras..." paragraph

### Design & UX:
- Dark mode: warm color scheme, logo visible (invert filter), typewriter paper stays WHITE
- Hero: reduced size, CTA above fold, reduced background noise
- Shop: 4-col desktop / 2-col mobile grid, compact cards, hover states
- Contact typewriter: 100% width (full machine visible), opacity 0.8/0.85
- Footer simplified
- Instagram section on Home: 6-image grid, @we.love.loveletters, Follow button
- Favicon: typographic "LL." italic serif on red

### Technical:
- MongoDB Atlas connected (17 real products with real images)
- Checkout: loading spinner, double-submit prevention (useRef), error display
- Success page: 4 distinct states (checking/success/timeout/error)
- Code splitting: React.lazy for all non-home routes
- API service layer (/services/api.js)
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Rate limiting on admin login (5 attempts/5min per IP)
- DB indexes on id, created_at, session_id, category

### Code Review:
- Python lint: PASS (ruff)
- JavaScript lint: PASS (ESLint)
- No unused imports, no undefined variables
- All interactive elements have data-testid
- Responsive tested: mobile + desktop + dark mode

## Stripe Configuration
**AWAITING**: Author creates Stripe account:
1. Secret Key → configure in backend .env as STRIPE_API_KEY
2. Webhook URL: `https://loveletters-backend.onrender.com/api/webhook/stripe`
3. Webhook Secret → configure in backend .env as STRIPE_WEBHOOK_SECRET

## Next Tasks
1. Stripe keys from author
2. "Drops ou mini-colecoes" structure from author
3. Optional: React Query, real Instagram API feed, email notifications
