# Love Letters - PRD

## Original Problem Statement
Website: https://weloveloveletters.netlify.app/
Portuguese love poetry merchandising store. Frontend (React) + Backend (FastAPI + MongoDB).

## Architecture
- **Frontend**: React 19, Tailwind CSS, Framer Motion, React Router DOM, Axios
- **Backend**: FastAPI, Motor (MongoDB async), Stripe, JWT auth (python-jose, bcrypt)
- **Database**: MongoDB (loveletters)
- **Deployment**: Netlify (frontend), Railway (backend)

## Core Requirements
1. E-commerce store for poetic merchandise
2. Multi-language support (PT/EN)
3. Dark/Light theme toggle
4. Contact form
5. Admin dashboard with JWT auth
6. Stripe payment integration

## What's Been Implemented

### Session 1 (2026-04-12):
- Removed "Poesia que se veste" from hero + SEO
- Swapped sections: "WRITE THAT LOVE LETTER" first, "THIS IS A LOVE POEM" second
- Removed italic from "E quando as palavras..." paragraph
- Fixed dark mode: logo visible, warm color scheme
- New favicon (LL italic serif on red)
- Backend configured, 17 products seeded

### Session 2 (2026-04-12):
- **Typewriter fix**: Removed gradient borders, just slight transparency (0.75 light, 0.5 dark), grayscale in dark mode
- **Dark mode form**: White text fields in dark mode, legible
- **Hero improvements**: Reduced headline size, positioned higher, CTA above fold, reduced background noise (opacity 0.2)
- **Shop grid**: 4-column layout, smaller/denser cards, improved hover states
- **Product cards**: Compact design with line-clamp, better hierarchy
- **Footer**: Simplified, reduced visual impact
- **Backend**: Added /health endpoint, database indexes
- **Hover states**: CTA hover to accent color, filter button hover, card border hover

### Testing: All passed (100% backend, 95% frontend - only toast timing detection)

## ChatGPT Suggestions Status

### Done:
- Hero headline size reduced
- CTA above the fold
- Background noise reduced
- Grid density improved (4 cols)
- Card size reduced
- Better hover states on buttons/filters
- Footer simplified
- /health endpoint added
- Database indexes created
- Prices validated from backend (already existed)
- Webhook implemented (already existed)

### Backlog (P1):
- API versioning (/api/v1/)
- React Query for data management
- Lazy loading images (WebP/AVIF)
- JWT refresh tokens + shorter expiry
- Rate limiting on login
- Loading states on checkout
- Prevent multiple submits
- Success page payment verification
- Code splitting by route
- Security headers (CSP, X-Frame-Options)

### Deferred:
- "Drops ou mini-colecoes" - awaiting author clarification
- Real product images
- Stripe real keys configuration

## Next Tasks
1. Wait for author on "Drops" structure
2. Configure real Stripe keys
3. Implement checkout loading states + prevent double-submit
4. Add React Query for better data management
5. JWT refresh tokens
