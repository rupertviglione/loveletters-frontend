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
1. E-commerce store for poetic merchandise (t-shirts, tote bags, posters, notebooks, pins, bundles)
2. Multi-language support (PT/EN)
3. Dark/Light theme toggle
4. Contact form
5. Admin dashboard with JWT auth
6. Stripe payment integration

## What's Been Implemented (2026-04-12)

### Changes Made This Session:
1. **Removed "Poesia que se veste"** from home page hero section and SEO description
2. **Swapped sections**: "WRITE THAT LOVE LETTER" now appears first, "THIS IS A LOVE POEM" second
3. **Removed italic** from "E quando as palavras..." paragraph
4. **Improved typewriter blending** on Contact page: gradient fade edges, reduced opacity, mix-blend-mode
5. **Fixed dark mode**:
   - Logo now uses `dark:brightness-0 dark:invert` for visibility
   - Warm dark color scheme (30 10% 8% background, warm cream text)
   - Accent color slightly brighter in dark mode for better visibility
   - Contact page typewriter adapts to dark mode (invert + hue-rotate)
   - Form inputs adapt text color based on theme
6. **New favicon**: Envelope with heart design (SVG) replacing generic "ll" text
7. **Backend setup**: Configured with JWT auth, seeded 17 products

### Testing: All tests passed (100% backend, 100% frontend)

## Prioritized Backlog

### P0 (Critical)
- Stripe payment integration (keys not yet configured)

### P1 (High)
- "Drops ou mini-colecções" - Product organization into collections/drops (awaiting author clarification on structure)
- Real product images (currently using unsplash/pexels placeholders)

### P2 (Medium)
- Order management in admin dashboard
- Email notifications for orders
- SEO optimization with real OG images

### P3 (Nice to have)
- Product search/filter improvements
- Wishlist functionality
- Social media sharing

## User Personas
1. **Customer**: Portuguese-speaking, interested in poetic merchandise
2. **Admin**: Store owner managing products, orders, contacts
3. **Author**: Content creator providing poetry and collection structure

## Next Tasks
- Wait for author clarification on "Drops ou mini-colecções" structure
- Configure real Stripe keys for payment processing
- Replace placeholder product images with real ones
