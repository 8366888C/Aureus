# Aureus

A CLI tool to automate Git, GitHub repositories, husky hooks, and semantic versioning with built-in support for all major package managers.

## Installation

```bash
npm install -g aureus
# or
pnpm add -g aureus
# or
yarn global add aureus
# or
bun add -g aureus
```

## Quick Start

```bash
# Initialize a new project
aureus init

# Add individual components later
aureus create license
aureus create gitignore
aureus create github-repo

# View available templates
aureus view license
aureus view gitignore

# Make conventional commits
aureus commit
```

## Commands

### `aureus init [folder]`

Initialize a new project. Interactive prompts for package manager selection, then select components: license, gitignore, code-of-conduct, GitHub repo, issue templates, PR templates. By default, also adds GitHub Actions workflow and changelog.

```bash
aureus init
# or for a specific folder
aureus init my-project
```

### `aureus create <component>`

Add individual project components:

| Component | Description |
|-----------|-------------|
| `license` | Create a LICENSE file |
| `gitignore` | Create a .gitignore template |
| `pull-request` | Create a PR template |
| `issue` | Create issue templates |
| `code-of-conduct` | Create code of conduct |
| `github-actions` | Create GitHub Actions workflow |
| `github-repo` | Create GitHub repository |

```bash
aureus create license
aureus create gitignore
```

### `aureus view <component>`

View templates without creating files (same components as `create`).

```bash
aureus view license
aureus view gitignore
```

### `aureus commit`

Interactive conventional commit builder with type selection.

```bash
aureus commit
```

## Supported Package Managers

npm, pnpm, yarn, bun

## Requirements

- Node.js >= 18.0.0
- Git

## License

MIT
