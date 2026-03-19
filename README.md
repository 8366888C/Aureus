# Aureus

CLI tool to bootstrap, standardize and automate repository workflows with built-in support for all major package managers.

[NPM Package](https://www.npmjs.com/package/aureus)

## Key Features

- Interactive project initialization with customizable components
- Conventional commit builder with type selection
- Automatic version bumping (major/minor/patch) based on commit messages
- Changelog generation from commit history
- GitHub repository creation via CLI
- Husky hooks for commit message validation
- GitHub Actions workflow templates
- Issue and pull request templates
- License and .gitignore templates
- Multi-package manager support

## Supported Package Managers

- npm
- pnpm
- yarn
- bun

## Requirements

- Node.js >= 18.0.0
- Git

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

## Commands

### `aureus init [folder]`

Initialize a new project with interactive prompts for package manager selection and customizable components.

```bash
aureus init
# or for a specific folder
aureus init my-project
```

### `aureus create <component>`

Add individual project components to an existing project:

| Component         | Description                    |
| ----------------- | ------------------------------ |
| `license`         | Create a LICENSE file          |
| `gitignore`       | Create a .gitignore template   |
| `pull-request`    | Create a PR template           |
| `issue`           | Create issue templates         |
| `code-of-conduct` | Create code of conduct         |
| `github-actions`  | Create GitHub Actions workflow |
| `github-repo`     | Create GitHub repository       |

```bash
aureus create license
aureus create gitignore
```

### `aureus view <component>`

View available templates without creating files (same components as `create`).

```bash
aureus view license
aureus view gitignore
```

### `aureus commit`

Interactive conventional commit with type selection.

```bash
aureus commit
```

## License

MIT
