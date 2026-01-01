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

## Release Checklist

1) Update `CHANGELOG.md`:
   - Move items from `[Unreleased]` into a new version section.
2) Bump the version in `package.json`.
3) Run checks:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test`
   - `npm run test:e2e`
4) Commit, tag, and push:
   - `git tag -a vX.Y.Z -m "vX.Y.Z"`
   - `git push`
   - `git push --tags`
5) GitHub Actions will publish the release automatically from `CHANGELOG.md`.
   - Release runs lint, typecheck, unit, and e2e tests before publishing.
   - Tags with a hyphen (e.g. `v1.2.3-rc.1`) are published as prereleases.

## Reporting Issues

When filing a bug, include:

- Steps to reproduce.
- Expected vs. actual behavior.
- Screenshots or short recordings when helpful.
- Environment details (browser, OS, Node version).
