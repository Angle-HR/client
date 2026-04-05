# Angle HR Web

Open-source frontend for **Angle HR**, built with [Next.js](https://nextjs.org/), React, TypeScript, and Tailwind CSS.

## Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4
- **Language:** TypeScript (strict)

## Prerequisites

- **Node.js** — use the version in [`.nvmrc`](.nvmrc) (see also `engines` in [`package.json`](package.json)). With [nvm](https://github.com/nvm-sh/nvm): `nvm use`.

## Local setup

```bash
npm install
```

Copy environment variables (see [`.env.example`](.env.example)):

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

Start the dev server:

```bash
npm run dev
# or: make dev
```

Open [http://localhost:3000](http://localhost:3000).

## Code quality

- **ESLint** uses [`eslint-config-next`](https://www.npmjs.com/package/eslint-config-next), which bundles **`eslint-plugin-import`** and **`eslint-plugin-jsx-a11y`**. This repo adds an **`import/order`** rule in [`eslint.config.mjs`](eslint.config.mjs).
- **Prettier** is configured in [`.prettierrc`](.prettierrc); **`eslint-config-prettier`** disables conflicting ESLint rules.
- **TypeScript** runs with `strict` and `noUncheckedIndexedAccess` ([`tsconfig.json`](tsconfig.json)).
- **Git hooks:** [Husky](https://typicode.github.io/husky/) runs [lint-staged](https://github.com/lint-staged/lint-staged) on commit; [commitlint](https://github.com/conventional-changelog/commitlint) enforces Conventional Commits.

## Scripts

| Command                | Description                 |
| ---------------------- | --------------------------- |
| `npm run dev`          | Development server          |
| `npm run build`        | Production build            |
| `npm run start`        | Start production server     |
| `npm run lint`         | ESLint                      |
| `npm run format`       | Format with Prettier        |
| `npm run format:check` | Check formatting            |
| `npm run typecheck`    | TypeScript (`tsc --noEmit`) |
| `npm run test`         | Unit tests (Vitest, watch)  |
| `npm run test:ci`      | Unit tests (CI, single run) |

See [`Makefile`](Makefile) for shortcuts (`make lint`, `make test`, `make check`, etc.).

## Contributing

We welcome contributions. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before opening a pull request.

## Security

To report a vulnerability privately, see [SECURITY.md](SECURITY.md).

## Support

For questions and help, see [SUPPORT.md](SUPPORT.md).

## License

This project is licensed under the terms in [LICENSE](LICENSE).

## Demo and screenshots

- **Live demo:** _TBD — add Vercel preview or production URL when available._
- **Screenshots:** _TBD — add key UI screenshots for contributors._

## Maintainer setup (GitHub)

After creating the repository:

- Enable **Discussions** for community Q&A.
- Add repository **topics**, for example: `nextjs`, `typescript`, `open-source`, `hiring`, `hr-platform`.
- Set a short **description** and **website** URL (e.g. Vercel deployment).
- Ensure **Dependabot** is enabled (configured via [`.github/dependabot.yml`](.github/dependabot.yml)).
