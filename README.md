# Art Bay Frontend

This is a Next.js 15 storefront for the Art Bay marketplace API (`https://art-bay-e7451b528caa.herokuapp.com/`). It supports JWT and DRF Token auth flows, Stripe checkout, products loaded from the Art Bay API or static example data, and user profile/addresses/orders.

## Environment

- Copy `.env.example` to `.env` (or `.env.local`) and fill in the values you receive from Stripe, your database provider, Google, etc.
- Keep `.env` untracked; real credentials must come from your local developer machine or from Netlify environment variables.
- Keys starting with `NEXT_PUBLIC_` are expected to be published to the browser; other keys must remain server-only.

```
NEXT_PUBLIC_API_BASE_URL=https://art-bay-e7451b528caa.herokuapp.com
NEXT_PUBLIC_SITE_URL=https://art-bay-e7451b528caa.herokuapp.com/
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_LOGGING_ENABLED=false
NEXT_PUBLIC_LOGGING_ENDPOINT=https://your-log-endpoint.example.com/logs
```

Notes:
- The frontend appends `/api/v1` automatically to `NEXT_PUBLIC_API_BASE_URL`.
- JWT endpoints are used when available; it falls back to DRF Token endpoints.
- `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` are required at runtime.
- `NEXT_PUBLIC_SITE_URL` is used for Open Graph/Twitter metadata and defaults to `http://localhost:3000`.
- Optional client-side logging can be enabled by setting `NEXT_PUBLIC_LOGGING_ENABLED=true` and providing a `NEXT_PUBLIC_LOGGING_ENDPOINT`.

## Commands

- `npm run dev` start dev server
- `npm run build` build
- `npm start` serve production
- `npm run lint` lint
- `npm run typecheck` run TypeScript typecheck
- `npm run test` run unit tests (Vitest)
- `npm run test:e2e` run Playwright tests (requires `npx playwright install`)

## Testing

- Vitest uses the jsdom environment with shared setup in `src/test/setup.ts`. Add React Testing Library or fetch mocks there when needed.
- Playwright runs against `http://localhost:3000` and will spin up `npm run dev` automatically (see `playwright.config.ts`).
- If an e2e test needs live API data, set `NEXT_PUBLIC_API_BASE_URL` to a reachable backend in your local `.env`.

## EditorConfig

This repo ships a `.editorconfig` that standardizes UTF-8, LF line endings, and trailing whitespace rules.

## Docs

- `docs/ENVIRONMENT.md` environment variables and third-party setup.
- `docs/ARCHITECTURE.md` application architecture and data flow overview.
- `CONTRIBUTING.md` contribution guidelines and PR checklist.
- GitHub wiki: https://github.com/raven-dev-ops/E-Commerce_Frontend/wiki

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
- `src/app/products/page.tsx` uses `src/lib/exampleProducts.ts` to load the demo catalog.
- To swap to live API data, replace `getExampleProducts()` with an API fetch to `/products/` and update filtering to use the response shape.

## Security Headers and CSP

The application ships with baseline security headers in `next.config.ts`. If you tighten CSP, ensure these domains remain allowed:

- `https://js.stripe.com`, `https://api.stripe.com`, `https://hooks.stripe.com`
- `https://accounts.google.com`, `https://apis.google.com`, `https://*.googleapis.com`
- `https://*.googleusercontent.com` (Google identity assets)
- `NEXT_PUBLIC_API_BASE_URL` origin + its ws/wss equivalent (orders WebSocket)

## Public Repo & Security

This repository is public so others can view the code and contribute via issues and pull requests. Do not commit real secrets (e.g. Stripe keys, database URIs, JWT secrets) to the repo; only use placeholder values in example configuration files and keep real credentials in local, untracked `.env` files.

If you have previously pushed real secrets to a public repository, you should rotate those keys (e.g. in Stripe and your database provider) and remove the secrets from the git history.

Please follow `SECURITY.md` for reporting vulnerabilities and coordinated disclosure.

## License

This project is not open source and is not licensed for use, copying, modification, or distribution.

- All rights are reserved by the copyright holder.
- No license is granted except where explicitly agreed in writing.

See `LICENSE` for the full notice and details about third-party dependencies.
