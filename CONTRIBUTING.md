# Contributing to Angle HR Web

Thank you for your interest in contributing. This document describes how we work together on this repository.

## Code of conduct

All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Participation is conditioned on respectful, professional behavior.

## How to contribute

1. **Fork** the repository and create a branch from `main` (or the branch your change targets).
2. **Make your changes** with clear commits (see [Commit messages](#commit-messages)).
3. **Run checks locally:** lint, format, typecheck, and tests (`make check` or the equivalent npm scripts).
4. **Open a pull request** against the appropriate branch (usually `main`). Fill in the PR template and link related issues.

## Branch naming

Use a short prefix so history stays easy to scan:

| Prefix      | Use for                          |
| ----------- | -------------------------------- |
| `feat/`     | New features                     |
| `fix/`      | Bug fixes                        |
| `chore/`    | Tooling, deps, chores            |
| `docs/`     | Documentation only               |
| `refactor/` | Behavior-preserving code changes |

Examples: `feat/applicant-profile`, `fix/login-redirect`.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/) enforced via [commitlint](https://github.com/conventional-changelog/commitlint) in this repo.

Common types:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation
- `chore:` — maintenance (deps, config)
- `refactor:` — refactor without behavior change
- `test:` — tests only
- `ci:` — CI configuration

Example:

```text
feat: add applicant search filters
```

Optional scope: `feat(auth): add session refresh`.

## Pull request process

1. **One logical change per PR** when possible; large changes are easier to review when split.
2. **Update docs** if you change behavior, env vars, or contributor-facing workflow.
3. **CI must pass** — required checks are configured on protected branches. After your first green Actions run, copy exact check names into rulesets (see [.github/branch-protection/README.md](.github/branch-protection/README.md)).
4. **Review** — maintainers will review; address feedback or ask questions on the PR.

## Questions

See [SUPPORT.md](SUPPORT.md) for where to ask questions. For sensitive security issues, use [SECURITY.md](SECURITY.md) instead of public issues.
