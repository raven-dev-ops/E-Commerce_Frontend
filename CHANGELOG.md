# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows
Semantic Versioning.

## [Unreleased]

- Add entries here for changes that will ship in the next release.

## [0.1.2] - 2025-12-31

### Added

- Added changelog and release checklist to standardize release notes.
- Added GitHub Actions release automation that publishes from `CHANGELOG.md`.

## [0.1.1] - 2025-12-31

### Security

- Upgrade Next.js to 15.5.9 (via ^15.4.7) to address multiple advisories.
- Upgrade axios to 1.13.2 to address GHSA-4hjh-wcwx-xvwj.
- Pin transitive dependencies (esbuild, glob, qs, brace-expansion) via npm overrides.

## [0.1.0] - 2025-12-31

### Added

- Architecture and environment documentation plus contribution guidelines.
- Vitest and Playwright test coverage for critical flows.
- Global error boundary and optional client-side logging.

### Changed

- Hardening for auth, cart sync, checkout idempotency, and API normalization.
- Security headers and CSP baseline in Next.js config.

### Fixed

- Product image path handling and accessibility improvements across forms.
