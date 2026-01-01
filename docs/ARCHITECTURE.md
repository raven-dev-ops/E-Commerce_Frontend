# Architecture Overview

## Stack

- Next.js 15 app router (`src/app`) with React components.
- Zustand for client-side auth/cart state (`src/store/useStore.ts`).
- Axios API client with refresh handling (`src/lib/api.ts`).
- Zod schemas to normalize API payloads (`src/lib/schemas.ts`).
- Stripe Elements for checkout (`src/components/CheckoutForm.tsx`).

## Structure

- `src/app`: Route segments and page-level logic.
- `src/components`: Reusable UI components.
- `src/lib`: API client, auth, schemas, caching, and utilities.
- `src/store`: Zustand store for auth + cart state.
- `src/types`: Shared TypeScript types.
- `public`: Static assets and demo JSON.

## Data Flows

### Auth

1) Login/register calls `src/lib/auth.ts`.
2) Tokens are normalized and stored in `src/lib/authStorage.ts`.
3) `src/store/useStore.ts` hydrates auth state on load and listens for changes.
4) `src/lib/api.ts` injects `Authorization` and refreshes tokens on 401s.

### Cart

1) Cart actions update local state and localStorage in `src/store/useStore.ts`.
2) When authenticated, cart actions sync to `/cart/` via `src/lib/cartApi.ts`.
3) On login, the store merges guest cart and server cart.

### Checkout

1) Stripe Elements collects payment details.
2) `src/lib/apiClient.ts` calls `POST /orders/` with idempotency keys.
3) 3DS/confirmation flows are handled in `src/components/CheckoutForm.tsx`.

### Orders

1) `GET /orders/` and `GET /orders/{id}/` via `src/lib/apiClient.ts`.
2) Live updates over WebSocket in `src/app/orders/[orderId]/page.tsx`.
3) WebSocket reconnects with backoff and falls back to polling.

## Error Handling and Logging

- Global error boundary: `src/app/error.tsx`.
- Optional client logging: `src/lib/logger.ts` (gated by env).
- API errors normalized via `getApiErrorMessage` in `src/lib/api.ts`.

## Testing

- Unit/component tests with Vitest (`src/test`, `src/components/__tests__`).
- E2E tests with Playwright (`tests/e2e`).
