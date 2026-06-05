# Test credentials — Love Letters frontend

> Backend is the **live Render** API at `https://loveletters-backend.onrender.com`.
> The Stripe key configured on the backend is in **TEST** mode (card `4242 4242 4242 4242`).

## Backoffice (admin) login
- URL: `https://weloveloveletters.netlify.app/admin/login`  (or local: `http://localhost:3000/admin/login`)
- Username: `tmargaridarodrigues`
- Password: `weloveloveletters2026!admin`
- Endpoint: `POST /api/admin/login` -> returns `{ access_token, token_type }`
- Token expiry: 8h. On 401 the UI redirects to `/admin/login?expired=1` (yellow banner).

## Stripe test card
- Number: `4242 4242 4242 4242`
- Expiry: any future date
- CVC: any 3 digits

## Sample data on the live backend (as of 2026-06-05)
- 1 archived order: `LL-20260605-4B5493` (€36.00, paid) — used for testing the `/success` fallback path
- 0 active orders / 0 active contacts (clean state)
