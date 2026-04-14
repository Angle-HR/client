---
description: Commits and pushes staged or selected changes with a proper commit message following the project's conventions. Use when the user wants to commit changes, save work, and share them remotely.
---

# Commit and push changes (staged or selected)

## Goal

Create a **git commit** with a proper commit message following the project's conventions and **push** it to the remote repository, either for staged changes or by selecting specific files to stage and commit.

## Prerequisites the agent checks

1. **Repository root** — Run from the clone root (where `.git` lives).
2. **Git status** — Check if there are changes to commit (staged or unstaged).
3. **Working directory clean** — Ensure no merge conflicts or other git issues.

## Workflow (agent runs this)

1. **Check git status** to see what changes exist:

   ```bash
   git status --porcelain
   ```

2. **If no changes** — Inform the user there's nothing to commit.

3. **If changes exist** — Show the user what will be committed:
   - **Staged changes**: `git diff --cached --stat`
   - **Unstaged changes**: `git diff --stat`

4. **Stage changes** based on what should be committed:
   - **Stage all changes**: `git add .`
   - **Stage specific files**: `git add <file1> <file2> ...`
   - **Stage by pattern**: `git add *.md` etc.

5. **Create commit message** following project conventions:
   - Check for `CONTRIBUTING.md` for commit message format
   - Use conventional commit format if applicable: `type(scope): description`
   - Keep first line under 50 characters, body wrapped at 72

6. **Create the commit**:

   ```bash
   git commit -m "<commit-message>"
   ```

7. **Push to remote** to share the changes:

   ```bash
   git push
   ```

   Verify the push succeeded and show the user the remote status.

## Commit message guidelines

### Common types (if using conventional commits)

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code formatting, no logic changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks, dependencies

### Good commit message structure

```
type(scope): brief description

More detailed explanatory text, wrapped to 72 characters. Explain
what and why, not how. Use bullet points for lists:

- Point one
- Point two

Fixes #123 (if applicable)
```

## Useful variants

- **Amend last commit**: `git commit --amend && git push --force-with-lease`
- **Empty commit**: `git commit --allow-empty -m "chore: trigger CI" && git push`
- **Sign commit**: `git commit -S -m "message" && git push` (if GPG signing enabled)
- **Commit without push**: Use if you want to commit locally only (rare cases)

## Error handling

1. **Pre-commit hooks fail** — Show the hook output and suggest fixes
2. **No changes staged** — Offer to stage changes or show how to stage
3. **Merge conflicts** — Stop and explain how to resolve conflicts first
4. **Identity not configured** — Guide user to set `git config user.name` and `user.email`
5. **Push fails** — Check for network issues, authentication, or remote conflicts; suggest `git pull` if needed
6. **Remote not configured** — Help set up remote with `git remote add origin <url>`

## Safety checks

- **Never commit sensitive data** — Check for keys, passwords, tokens in diff
- **Review large changes** — Warn if committing many files at once
- **Check for WIP/debug code** — Look for console.log, debugger, etc.

## Constraints

- **Don't force push** unless explicitly requested
- **Don't commit to main/master** without explicit instruction
- **Don't bypass pre-commit hooks** unless user explicitly asks
- **Always show what will be committed** before creating the commit
