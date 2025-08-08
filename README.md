# TwiinZ Beard Frontend

This is a Next.js 15 app aligned to the Django e‑commerce backend. It supports JWT and DRF Token auth flows, Stripe checkout, Mongo-backed products, and user profile/addresses/orders.

## Environment

Set the API and Stripe keys in your environment (e.g. `.env.local`).

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

Notes:
- The frontend appends `/api/v1` automatically to `NEXT_PUBLIC_API_BASE_URL`.
- JWT endpoints are used when available; it falls back to DRF Token endpoints.

## Commands

- `npm run dev` start dev server
- `npm run build` build
- `npm start` serve production

## Key Routes

- `/products` product listing with search and category filter
- `/products/[productId]` product details
- `/cart` local cart with server-backed product details
- `/checkout` Stripe card element + order creation (`POST /orders/`)
- `/auth/login`, `/auth/register` credential forms (also accessible via header modal)
- `/profile` view/update profile (`/users/profile/`)
- `/addresses` manage addresses (`/addresses/`)
- `/orders`, `/orders/[orderId]` list/detail with live status over WebSocket

## Example Data

See `public/example/*.json` for products, categories, orders, and addresses used for offline demos.
