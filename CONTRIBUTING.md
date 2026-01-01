# Contributing

Thanks for considering a contribution. Please follow these guidelines to keep changes easy to review and safe to ship.

## Quick Start

1) Install dependencies: `npm install`
2) Run the dev server: `npm run dev`
3) Run checks before pushing:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test`

## Branching

- Use short, descriptive branch names (e.g. `fix/cart-merge`).
- Keep PRs focused on a single concern when possible.

## Commit Guidelines

- Write concise commit messages (imperative voice).
- Reference issues when applicable (e.g. `Fixes #123`).

## Pull Request Checklist

- [ ] Scope is focused and described in the PR summary.
- [ ] `npm run lint` and `npm run typecheck` pass.
- [ ] Tests updated or added for behavior changes.
- [ ] Docs updated if public behavior or env vars changed.
- [ ] Screenshots provided for UI changes (desktop and mobile).

## Reporting Issues

When filing a bug, include:

- Steps to reproduce.
- Expected vs. actual behavior.
- Screenshots or short recordings when helpful.
- Environment details (browser, OS, Node version).
