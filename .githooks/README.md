# Git Hooks

This directory contains Git hooks for the Floumy project.

## Pre-commit Hook

The pre-commit hook automatically fixes lint issues in both the API and web parts of the project before committing changes.

### What it does

1. Checks if there are any staged changes in the API directory
2. If there are, runs `npm run lint:fix` in the API directory and stages the fixed files
3. Checks if there are any staged changes in the web directory
4. If there are, runs `npm run lint:fix` in the web directory and stages the fixed files

### Setup

The hook is already set up for this repository using:

```bash
git config core.hooksPath .githooks
```

### For new developers

New developers who clone this repository need to run the following command to enable the hooks:

```bash
git config core.hooksPath .githooks
```

Alternatively, you can add this command to your project's setup instructions or create a setup script that runs this command.

## Troubleshooting

If the pre-commit hook is not working:

1. Make sure the hook script is executable: `chmod +x .githooks/pre-commit`
2. Check that Git is configured to use the .githooks directory: `git config --get core.hooksPath`
3. Ensure that the lint:fix scripts are working correctly in both the API and web directories