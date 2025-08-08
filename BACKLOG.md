## Engineering Backlog (Backend)

This backlog lists 100 improvements aligned with the current Django + DRF + MongoEngine + Channels + Celery + Stripe/Twilio architecture. Items are grouped by area; numbering is global.

### Authentication
1. Unify token and JWT flows by adding an exchange endpoint to convert `Authorization: Token <key>` to JWT (SimpleJWT), simplifying mixed-auth modules.
2. Enable refresh token rotation with reuse detection (SimpleJWT blacklist) and add admin controls for forced rotation.
3. Add optional TOTP-based MFA (e.g., django-otp) gated by a `waffle` flag and backup codes.
4. Introduce Redis-backed login throttles per user, per IP, and per client fingerprint in addition to DRF throttling classes.
5. Enforce OAuth2 PKCE and state/nonce validation for Google login; add short-lived `one-time code` exchange endpoint for SPA flows.
6. Implement session/device management endpoints: list, revoke device sessions, “logout all” (JWT blacklist + session kill) with audit.
7. Add passwordless magic-link login (email) behind a feature flag with rate limits.
8. Track login locations/devices and send email notifications on new device sign-in (with opt-out).
9. Harden password policies: HaveIBeenPwned check, minimum length/entropy, and breach monitoring.

### Users & Profile
10. Extend user profile with verified phone number and SMS opt-in flags (Twilio), including OTP verification flow.
11. Provide GDPR export endpoint aggregating SQL (users/orders) and Mongo (products/reviews/cart) data into a downloadable archive.
12. Implement account deletion: anonymize orders and reviews, scrub PII, and schedule irreversible purge tasks.
13. Add avatar upload via pre-signed URLs (S3/GCS) with Celery-based image validation/transforms.
14. Add marketing and notifications preferences (email categories, SMS, push) with consent timestamps.
15. Track `last_seen_at` and client metadata; expose read-only to the user and staff.

### Addresses
16. Integrate address validation (USPS/Loqate) with async verification and status field on address records.
17. Normalize addresses (formatting, casing) and deduplicate across a user’s saved addresses.
18. Support soft delete/restore for addresses; hide from defaults automatically when deleted.
19. Internationalization of addresses (province/region schemas, postal code validation) with per-country rules.
20. Emit audit events on default shipping/billing changes with previous/new values.

### Products & Catalog (MongoDB)
21. Support per-variation inventory (size/color SKUs) with availability rules and backorder flags.
22. Add image pipeline: thumbnailing, WebP/AVIF, aspect-safe crops, and CDN cache invalidation hooks.
23. Implement product versioning/history collection for admin diff/audit and rollback.
24. Create slug change tracker with 301 redirect mapping and lookup by old slugs.
25. Add tag/facet fields and ensure compound indexes for common filters (category, tags, price range, rating).
26. Scheduled publish/unpublish windows; admin preview endpoints respect future state.
27. Product recommendations service: content-based (similar tags/categories) with fallback if sparse data.
28. Bundles/kits: virtual products composed of SKUs with bundle pricing and inventory allocation policy.
29. Backorder and preorder support with ETA, messaging, and fulfillment constraints.
30. Restock notifications: waitlist per product/variation; Celery job to notify upon inventory increase.
31. Soft-delete products with `archived` flag and admin restore; exclude from search by default.
32. Admin draft autosave for products with validation hints and safe publish.

### Search & Filters
33. Add full-text search: evaluate Postgres trigram/tsvector for SQL-backed fields and OpenSearch/Meilisearch bridge for Mongo.
34. Autocomplete endpoint with top queries and trending products cache in Redis.
35. Facet aggregation endpoint returning counts for categories/tags/price ranges, cached per query.
36. Sorting options: newest, price asc/desc, popularity, rating, with stable pagination.

### Cart (MongoDB)
37. Guest carts using signed cart token; merge with user cart on login with conflict resolution rules.
38. Idempotent cart mutations using client-supplied idempotency keys stored with TTL in Redis.
39. Optimistic concurrency on cart items using a `version` field to prevent lost updates.
40. Save-for-later list separated from the active cart; convert between lists.
41. Per-item notes/gift options stored with cart items; validated during checkout.
42. Cart pricing breakdown endpoint including items, discounts, taxes, shipping estimates.

### Discounts & Categories
43. Discount stacking rules engine with precedence and conflict detection; expose reasons when rejected.
44. Usage tracking by user and campaign; Mongo TTL shards for period resets (daily/weekly/monthly caps).
45. Discount preview endpoint to calculate effects without persisting changes.
46. Category tree with nested sets or materialized paths; breadcrumbs and full-path slugs.
47. Category merchandising fields (featured products, hero banners) with cache invalidation.
48. Voucher import/export with validation report; dry-run mode and partial acceptance with error CSV.
49. Free-gift promotion type that automatically inserts a cart item when eligible.

### Orders & Checkout
50. Idempotent checkout: Stripe idempotency keys, request hash deduplication, and safe retries.
51. Tax calculation integration (TaxJar/Avalara) with country/state fallbacks and caching.
52. Shipping rates via Shippo/EasyPost; support label purchase webhooks and tracking sync.
53. Split shipments and partial fulfillment; line-item level fulfillment statuses.
54. Post-checkout edits: address changes and item adjustments before fulfillment with strict audit trail.
55. Reliable inventory reservation with retry/backoff and dead-letter queue; compensating release on failure.
56. Order timeline with structured events (status change, payment, shipment, customer actions) for UI.
57. Gift receipts and gift messages stored per shipment; exclude prices when flagged.
58. PDF invoices/receipts generation using templating (WeasyPrint/WKHTML) and storage links.
59. Returns/RMA workflow with statuses, reasons, approvals, and refund coupling.
60. Fraud signals collection: velocity checks, device fingerprint, Stripe Radar/Sift hooks.
61. “Buy again” endpoint to rebuild cart from previous order with substitutions for unavailable items.

### Payments (Stripe)
62. Support additional payment methods (SEPA, iDEAL, Klarna, Apple Pay/Google Pay via PaymentRequest).
63. 3DS challenge handling with clear status transitions and webhook resilience.
64. Refunds API (full/partial) with Stripe integration, permission checks, and audit logs.
65. Payment retries for `requires_payment_method` statuses with reminders and limit policies.
66. Enhanced webhook verification: rotate secrets, strict timestamp tolerance, and signature validation logs.
67. Settlement reconciliation: scheduled job comparing orders to Stripe balances/payouts and opening discrepancies.
68. Delayed capture (authorize/capture) support for preorders and high-risk orders.

### Reviews & Ratings (MongoDB)
69. Helpfulness votes with per-user constraints and abuse detection heuristics.
70. Review photos upload with moderation queue and safe media scanning.
71. NLP-based sentiment tagging to aid moderation prioritization.
72. Verified purchase badge derived from Orders; deny if return/refund invalidates verification.
73. Report review flow with admin escalation and action outcomes.
74. Draft autosave for reviews to prevent loss before submission.
75. Product Q&A separate from reviews with moderation and voting.

### WebSockets & Realtime (Channels)
76. JWT auth on WS connect; mid-connection token refresh handling.
77. Add presence channels and typing indicators for support interactions (feature-flagged).
78. Apply per-connection and per-topic rate limiting with backpressure handling.
79. Use Redis Pub/Sub fan-out for horizontal scaling and message ordering guarantees.
80. Implement reconnect/resume with missed-event replay window using cursor/offset.

### GraphQL
81. Expand schema to include products, categories, reviews, and filters with pagination.
82. Persisted queries/APQ with Redis caching and validation layer.
83. Schema directives for auth and feature flags; hide experimental fields behind flags.
84. Automated schema docs and changelog generation with version pins.

### Audit & Logging
85. Enhance audit middleware to include field-level diffs for staff writes with PII redaction.
86. Immutable audit sink (S3/Cloud storage) with periodic integrity verification.
87. Correlation IDs across HTTP, Celery, Stripe/Twilio calls; propagate via headers and logging.
88. Admin UI for audit search with filters by user, model, action, and date range.

### Security & Compliance
89. Strengthen security headers: CSP, HSTS, Referrer-Policy, Permissions-Policy; add automated tests.
90. Field-level encryption for sensitive PII (e.g., phone) using key rotation strategy.
91. Secrets management via vault (e.g., AWS/GCP/HashiCorp) and dynamic config reload.
92. Per-endpoint rate limits and API keys for partner integrations with analytics.
93. CSRF double-submit strategy for non-cookie clients alongside existing CSRF protections.
94. Data retention policies and GDPR/CCPA compliance jobs with admin review reports.

### Performance & Caching
95. Redis cache namespace versioning and stampede protection (single-flight locks) for hot keys.
96. Systematic ORM query audits with `select_related/prefetch_related` and django-silk profiling gates in CI.
97. MongoDB index coverage for high-cardinality filters; offline index build commands and analyzers.
98. Read-through/write-through caching for product detail and category lists with cache invalidation hooks.

### Background Jobs & Scheduling
99. Celery task reliability: retries, exponential backoff, idempotency keys, and deduplication.
100. Periodic jobs dashboard: health checks, late task detection, and alerting integration (Sentry/Prometheus).