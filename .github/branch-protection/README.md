# Branch protection and rulesets

This folder holds **reference** ruleset definitions for maintainers. GitHub’s UI and APIs evolve; validate any JSON against [Repository rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) before applying.

## Required status checks (Actions)

After the first successful PR run, open the PR **Checks** tab and copy the **exact** check names into your ruleset. With the default workflows in this repo, you typically require jobs from the **Merge gate** workflow, for example:

- `Lint, format, and typecheck` (from workflow _Code quality_)
- `Unit tests` (from workflow _Test_)
- `Next.js build` (from workflow _Build_)

Names can vary slightly by GitHub version; always copy from a real run.

Alternatively, require the **Merge gate** workflow as a whole if your plan supports a single aggregate check.

## Suggested policy

| Branch    | Policy                                                                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `main`    | Require pull request before merging; require status checks to pass; **no direct pushes**; **linear history** (rebase or squash as you prefer). |
| `staging` | Require pull request; require checks; allow **squash merge** for integration testing.                                                          |

## Importing rulesets

1. In the repository or organization **Settings → Rules → Rulesets**, create or edit a ruleset.
2. Optionally export an existing ruleset from another repo (same org) and adapt [`ruleset-main.json`](ruleset-main.json) / [`ruleset-staging.json`](ruleset-staging.json).
3. Replace placeholders such as `YOUR_ORG/angle-hr-web` and required check names with values from your Actions tab.

The JSON files here are **templates** and may need field adjustments for the [REST API version](https://docs.github.com/en/rest/repos/rules) you use.
