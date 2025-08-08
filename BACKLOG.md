### Conventions

- **Priority**: P0 (must-have), P1 (high), P2 (medium), P3 (nice-to-have)
- **Milestone**: [MVP], [Beta], [GA]
- **Status**: [Todo], [In Progress], [Blocked], [Done]
- Notes: Acceptance criteria are defined for MVP items only. Numbers in parentheses reference the full backlog items below.

### MVP (Phase 1) — must-haves

1) Unified credentials login with fallback (1) [MVP][P0][In Progress]
- Calls `POST /auth/login/` first; on non-success, falls back to `POST /authentication/login/`
- Surfaces backend error messages verbatim for 400/401; blocked/rate-limited states show helpful UI
- On success, saves JWT as `Bearer` or DRF token as `Token` and future requests carry `Authorization` via interceptor
- Preserves return-to path pre-login; closes header modal on success
- Files: `src/components/Header.tsx`, `src/lib/auth.ts`, `src/lib/api.ts`

2) Token storage, hydration, and auto-logout (2,3,10) [MVP][P0][In Progress]
- Tokens persisted to storage and in-memory; `useStore` hydrates auth state on app load without SSR breakage
- 401 from API triggers token clear + re-login prompt without losing current route
- Logout clears all tokens via a single call and resets store state
- Files: `src/store/useStore.ts`, `src/lib/api.ts`, `src/components/Header.tsx`

3) Google OAuth login button (4) [MVP][P1][In Progress]
- Renders Google button; sends auth code to `POST /auth/google/login/`
- Handles non-JSON or variant token field names; stores JWT or DRF token and authenticates user
- Clear error messages and retry affordance
- Files: `src/components/GoogleAuthButton.tsx`, `src/components/Header.tsx`

4) Products index with search + category (25,37) [MVP][P0][In Progress]
- Fetches from `/products/` supporting `?search` and `?category` params; state reflectable via URL
- Renders empty state when no results
- Reasonable formatting of price and images; basic pagination ready (URL param passthrough)
- Files: `src/app/products/page.tsx`, `src/components/ProductItem.tsx`

5) Product detail page with related products (26,27,28,29) [MVP][P0][In Progress]
- Loads product from `/products/{id}/`; displays images gallery with fallback and zoom
- Renders key product attributes (price, description, ratings) with safe defaults
- Related rail by category excludes current product
- Files: `src/app/products/[productId]/page.tsx`, `src/components/ProductDetailsClient.tsx`, `src/components/ProductCarousel.tsx`

6) Cart connected to server endpoints (45,46) [MVP][P0][Todo]
- Reads current cart via `GET /cart/` and displays item names, quantities, and totals
- Quantity updates are optimistic, rollback on error; add/remove calls use POST/PUT/DELETE `/cart/`
- Guest cart merges on login when supported, else shows non-destructive message
- Files: `src/lib/cartApi.ts`, `src/components/CartClient.tsx`, `src/app/cart/page.tsx`, `src/store/useStore.ts`

7) Checkout order creation with Stripe card (59,60,62) [MVP][P0][In Progress]
- Submits `payment_method_id` to `POST /orders/` and handles error states without double-submitting
- Success clears cart and routes to confirmation; failures show inline error and allow retry
- Prepare for 3DS handling where backend returns `requires_action` (copy + retry path)
- Files: `src/components/CheckoutForm.tsx`, `src/app/checkout/page.tsx`

8) Order detail with live status updates (63,64,70) [MVP][P1][In Progress]
- Loads order via `GET /orders/{id}/`; subscribes to `ws(s)://…/ws/orders/{id}/` with reconnect on close
- UI timeline reflects status changes as messages arrive; polling fallback when WS fails
- Files: `src/app/orders/[orderId]/page.tsx`, `src/lib/baseUrl.ts`

9) Basic addresses management UI (18,19,22) [MVP][P1][Todo]
- List, create, update, delete via `/addresses/` with `is_default_shipping` and `is_default_billing`
- Toggle default via PATCH; inline validation and error surfacing
- Files: `src/app/addresses/page.tsx`

10) A11y fundamentals for auth modal and forms (77,78,81) [MVP][P1][Todo]
- Auth modal traps focus, ESC closes, labeled inputs, and roles announced for errors
- Forms have `aria-describedby` for inline errors; tab order is logical
- Files: `src/components/Header.tsx`, `src/components/CheckoutForm.tsx`

11) Image and bundle performance essentials (84,85,86,88) [MVP][P2][Todo]
- Code-split heavy client components and lazy-load below-the-fold content
- Use next/image where feasible with appropriate sizes; prefetch critical routes
- Prefer server components for data fetching where possible to reduce client JS
- Files: `src/components/ProductDetailsClient.tsx`, `src/app/products/*`

12) Developer flow: E2E smoke for happy path (100) [MVP][P2][Todo]
- Playwright covers: login, view products, add-to-cart, checkout success, order status page loads
- Test data and environment docs included
- Files: `tests/e2e/*` (to be added)

## Engineering Backlog (Frontend)

This backlog lists 100 frontend improvements aligned with available APIs and features (auth JWT/Token + Google, products, cart, addresses, orders, Stripe, WebSockets). Numbering is global across sections.

### Authentication & Account
1. Implement unified login flow that first calls `/auth/login/` (JWT) and falls back to `/authentication/login/` (Token), preserving precise error messaging per backend response.
2. Persist tokens in memory and secure storage (localStorage as today) with a consistent accessor, and route all API calls via `api` interceptor for `Authorization` header.
3. Add auto-logout and refresh handling when 401 occurs; prompt re-login and preserve return-to path.
4. Build Google OAuth button using auth-code flow calling `/auth/google/login/`, with robust non-JSON response handling and explicit user feedback.
5. Provide password visibility toggle and client-side validation for email/password fields with inline error states.
6. Add “Remember me” and session length copy to set user expectations; respect backend token expiry.
7. Create blocked/rate-limited state UI for auth endpoints (e.g., show backoff, contact support) using backend error codes.
8. Implement “Logout everywhere” UI stub that clears local tokens now and prepares for future device-session API.
9. Add post-auth onboarding step that confirms email verification and guides to addresses/profile setup.
10. Centralize auth state in `useStore` with hydration from storage on app load and SSR-safe checks.

### Profile & Settings
11. Profile page to render user object fields returned from login responses and future `/profile/` endpoint when available.
12. Avatar upload UI using pre-signed URLs (ready to connect to future backend media endpoints).
13. Notifications preferences UI (email/SMS/push toggles) mapped to future preferences endpoints.
14. GDPR data export download UI (polling status + download link) aligned with backend export job endpoint.
15. Account deletion flow with confirmation, grace-period messaging, and success/undo banners (wire later to backend).
16. Security activity section: recent logins list UI ready for future device/session endpoint.
17. Phone verification entry and OTP code UI to integrate with Twilio verification endpoints later.

### Addresses
18. Address book page consuming `/addresses/` for list, create, update, delete; reflect `is_default_shipping` and `is_default_billing`.
19. Address create form with per-country fields and client validation; set defaults via PATCH to `/addresses/{id}/` when toggled.
20. Inline edit for addresses with optimistic UI and rollback on API error.
21. Soft delete/restore UI patterns (archive list) for when backend supports soft delete semantics.
22. Auto-select default shipping/billing addresses during checkout; allow override.
23. Integrate third-party postal validation UX (pending backend); show suggestions and normalized formats.
24. Deduplication hints when entering similar addresses (visual feedback, confirm merge).

### Products & Catalog
25. Products index page consumes `/products/` with `search` and `category` query params; preserve state in URL for shareability.
26. Product detail page consumes `/products/{id}/`; normalize fields (images array, numeric price) and display badges for inventory/backorder when provided.
27. Related products rail using `/products/?category=…` excluding current product id.
28. Variant selection UI (size/color) prepared for per-variation SKUs and inventory from backend.
29. Image gallery with thumbnails, zoom, swipe, and graceful fallback to `FallbackImage`.
30. Price formatting and currency handling via Intl API with locale awareness.
31. Pagination controls and infinite-scroll option using `next`/`previous` style pagination when backend provides it.
32. Skeleton loaders for grid and detail pages; shimmer placeholders for images.
33. Breadcrumbs using category hierarchy (ready for category tree endpoint).
34. Recently viewed products stored client-side; show on product and home pages.
35. Product badges: “New”, “Preorder”, “Backorder”, “Low stock” based on backend flags.
36. Compare products feature (client-side) with sticky mini-compare drawer.

### Search & Filters
37. Debounced search input that updates query params and fetches `/products/?search=…` via `fetch`.
38. Filter sidebar with facets (category, price range, tags) mapped to backend filter params.
39. Sort dropdown (newest, price asc/desc, popularity) reflecting backend sort params.
40. Autocomplete dropdown calling an `/autocomplete/` endpoint when available; fallback to client-side suggestions.
41. “Chips” for active filters with quick clear; persist state on navigation using URL.
42. Empty-state improvements (creative copy, quick links) when no results.
43. Keyboard-accessible search: focus trap, arrow navigation in suggestions, Enter to submit.
44. Save search (client-side) with recent queries list and quick re-run.

### Cart
45. Connect cart UI to server cart endpoints: GET/POST/PUT/DELETE `/cart/` using types in `cartApi.ts`, reconciling with local cart for guest users.
46. Optimistic updates for quantity changes with rollback if PUT fails.
47. Merge guest cart with user cart on login; visual conflict resolution if products changed/unavailable.
48. Mini-cart dropdown from header with subtotal and quick actions.
49. Save-for-later list UI separate from cart; move items between lists.
50. Per-item notes/gift options component with validation; display during checkout and order review.
51. Pricing breakdown (items, discounts, taxes, shipping estimate) consumption once backend exposes calculation endpoint.
52. Idempotency key support on cart mutations (client-generated keys attached to requests) for resilience.
53. Accessible quantity steppers with min/max and async validation hints.

### Checkout & Payments
54. Multi-step checkout: address selection, shipping method (placeholder until backend), payment, review.
55. Stripe integration improvements: move to Payment Element when enabled; CardElement remains fallback.
56. 3DS challenge UX with clear messaging and retry; surface Stripe `requires_action` statuses gracefully.
57. Coupon/promo code input with optimistic preview; call discount preview endpoint when available.
58. Shipping methods UI (rates, ETAs) consuming backend shipping quotes when provided.
59. Order review step showing items, totals, taxes; confirm before POST to `/orders/`.
60. Error boundary and retry for payment submission; avoid duplicate charges using disable + idempotency.
61. Post-payment success screen with order id, summary, and CTA to view order status.
62. Handle payment retries for `requires_payment_method` by re-rendering payment step with inline error.

### Orders & Realtime
63. Order status page consumes `/orders/{id}/` and subscribes to `ws://…/ws/orders/{id}/` for live status updates; reconnect with backoff.
64. Visual timeline of status changes (Placed, Paid, Fulfilled, Shipped, Delivered) using backend events as they arrive.
65. Allow cancel/modify order pre-fulfillment if backend permits; disable otherwise with helpful copy.
66. Tracking section rendering carrier/tracking once available.
67. Download invoice/receipt button; wired to PDF link when backend provides it.
68. “Buy again” action to rebuild cart from order items, with substitution prompts for unavailable products.
69. Toast notifications for realtime status changes while user is browsing elsewhere.
70. Graceful fallback when WebSocket fails: poll `/orders/{id}/` at intervals.

### Reviews & Q&A
71. Review list and submission UI: star rating, text, photo upload (staged), pending moderation indicator.
72. Helpfulness voting with immediate visual feedback; debounce to avoid rapid repeats.
73. Report review flow with confirmation and thank-you messaging.
74. Verified purchase badge display based on order linkage from backend.
75. Q&A component with question submission and answers; sort by recent/helpful.
76. Empty states encouraging first reviews with guidelines.

### Accessibility & Internationalization
77. Full a11y audit: landmarks, headings, labels, color contrast, focus outlines, skip links.
78. Ensure all modals (e.g., login) trap focus and are keyboard dismissible; ARIA roles set.
79. Localize copy and currency/date formatting with i18n scaffold; support multiple locales.
80. RTL layout support and mirrored icons where appropriate.
81. Accessible forms with inline errors using `aria-describedby` and role=alert announcements.
82. High-contrast mode and reduced motion preferences respected.

### Performance & Caching
83. Adopt SWR for client fetching of detail resources (e.g., product details in cart) with stable cache keys.
84. Code-split heavy components (`ProductDetailsClient`, gallery, carousel) and lazy-load below-the-fold.
85. Optimize images (next/image) with proper sizes, priority and responsive breakpoints.
86. Add skeletons and prefetch critical routes (products, cart) using Next.js prefetch.
87. Avoid blocking work on main thread; defer non-critical analytics and experiment beacons.
88. Review hydration and ensure server components fetch where possible to reduce client JS.

### Security
89. Strictly scope tokens: clear on logout, clear on auth errors; never expose in logs.
90. CSP review for external scripts (Stripe, Google Auth); document required directives.
91. Defensive CSRF strategy for any cookie-backed endpoints (if used); confirm with backend.
92. Input sanitization on user-generated content (reviews, notes) before display.

### Offline & Resilience
93. Offline cart persistence with eventual sync on reconnect; conflict resolution UI.
94. Retries with exponential backoff for flaky network calls (cart, orders, addresses) and friendly banners.
95. Network status indicator with actionable tips when offline.

### Analytics & Experimentation
96. Instrument key funnels (auth, add-to-cart, checkout, payment) with events; ensure PII-safe payloads.
97. Feature flags for experimental UI (e.g., infinite scroll vs pagination) with kill switches.
98. A/B test hooks around product card layout, checkout steps, and promo code entry.

### Developer Experience & Testing
99. Storybook stories for core components (ProductItem, ProductDetailsClient, Header auth modal, CheckoutForm) with realistic mocks.
100. E2E tests (Playwright) covering auth, add-to-cart, checkout happy path, and order status realtime updates.