---
description: Create a new branch following the project's branch naming policy
---

This workflow helps you create a new branch that follows the branch naming policy defined in CONTRIBUTING.md.

## Interactive Questions

### 1. Branch Type Selection

Please choose the type of branch you want to create:

**Options:**

- `feat` - New features
- `fix` - Bug fixes
- `chore` - Tooling, dependencies, chores
- `docs` - Documentation only
- `refactor` - Behavior-preserving code changes

### 2. Branch Description

Enter a short, descriptive name for your branch (use kebab-case):

- Examples: `applicant-profile`, `login-redirect`, `user-auth-flow`
- Avoid spaces and special characters
- Keep it concise but descriptive

### 3. Confirmation

Review your branch name and confirm creation:

## Implementation Steps

1. **Validate branch type** - Ensure the selected prefix is allowed
2. **Validate description** - Check for valid characters and format
3. **Check if branch exists** - Prevent overwriting existing branches
4. **Create branch** - Use git to create and switch to the new branch

## Git Commands

// turbo

```bash
# Check if branch already exists
git rev-parse --verify {branch-name} >/dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "Error: Branch '{branch-name}' already exists"
  exit 1
fi

# Create and switch to new branch
git checkout -b {branch-name}
echo "Successfully created and switched to branch: {branch-name}"
```

## Usage

Run `/create-branch` and follow the prompts to create a properly named branch that complies with the project's naming conventions.

## Examples

- `feat/applicant-profile` - Adding a new applicant profile feature
- `fix/login-redirect` - Fixing a login redirect issue
- `chore/upgrade-deps` - Upgrading project dependencies
- `docs/api-endpoints` - Adding API documentation
- `refactor/user-service` - Refactoring the user service code
