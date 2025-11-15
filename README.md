# Art Bay Frontend

This is a Next.js 15 storefront for the Art Bay marketplace API (`https://art-bay-e7451b528caa.herokuapp.com/`). It supports JWT and DRF Token auth flows, Stripe checkout, products loaded from the Art Bay API or static example data, and user profile/addresses/orders.

## Environment

- Copy `.env.example` to `.env` (or `.env.local`) and fill in the values you receive from Stripe, your database provider, Google, etc.
- Keep `.env` untracked—real credentials must come from your local developer machine or from Netlify environment variables.
- Keys starting with `NEXT_PUBLIC_` are expected to be published to the browser; other keys must remain server-only.

```
NEXT_PUBLIC_API_BASE_URL=https://art-bay-e7451b528caa.herokuapp.com
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

## Public Repo & Security

This repository is public so others can view the code and contribute via issues and pull requests. Do not commit real secrets (e.g. Stripe keys, database URIs, JWT secrets) to the repo—only use placeholder values in example configuration files and keep real credentials in local, untracked `.env` files.

If you have previously pushed real secrets to a public repository, you should rotate those keys (e.g. in Stripe and your database provider) and remove the secrets from the git history.

## License

This project is not open source and is provided under a custom license.

- You may view and clone the code, run it locally for personal evaluation, and contribute via pull requests.
- You may not use this code commercially, redistribute it, or create public or private forks or derivative projects without prior written permission.

See `LICENSE` for the full license text.
