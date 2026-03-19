# Aureus

CLI tool to bootstrap, standardize and automate repository workflows with built-in support for all major package managers.

[NPM Package](https://www.npmjs.com/package/aureus) | [Issues](https://github.com/8366888C/aureus/issues)

## Key Features

- Interactive project initialization with customizable components
- Conventional commit builder with type selection
- Commit message validation via Husky `commit-msg` hook
- Automatic version bumping (major/minor/patch) based on commit history
- Changelog generation from commit history on push
- GitHub repository creation via CLI
- Husky hooks pre-configured out of the box
- GitHub Actions workflow for automatic release on version tags
- Issue and pull request templates
- License and .gitignore templates (100+ options)
- Multi-package manager support

## Supported Package Managers

- npm
- pnpm
- yarn
- bun

## Requirements

- Node.js >= 18.0.0`
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

What it does in order:

1. Prompts for components to include and package manager
2. Runs `<pm> init` (or `<pm> install` if a lockfile is detected)
3. Initializes a git repository (if not already one)
4. Installs and configures Husky with default hooks
5. Generates a GitHub Actions release workflow
6. Creates an empty `CHANGELOG.md`
7. Adds a base `.gitignore` with `node_modules/`
8. Runs each selected component (license, gitignore, issue templates, etc.)
9. Stages everything and creates an initial commit, then pushes

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
aureus create github-repo
```

### `aureus view <component>`

View available templates without creating files (same components as `create`, except `github-repo`).

```bash
aureus view license
aureus view gitignore
aureus view pull-request
aureus view issue
aureus view code-of-conduct
aureus view github-actions
```

### `aureus commit`

Interactive conventional commit builder. Prompts for commit type, message, and whether the change is breaking.

```bash
aureus commit
```

Supported commit types:

| Type       | Description                                                          |
| ---------- | -------------------------------------------------------------------- |
| `feat`     | A new feature                                                        |
| `fix`      | A bug fix                                                            |
| `refactor` | Code rewrites or restructure                                         |
| `build`    | Changes to build components (build tool, CI pipeline, deps, version) |
| `chore`    | Changes that don't modify the main app (docs, dev env, gitignore)    |
| `test`     | Add missing tests or correct existing tests                          |
| `ops`      | Commits affecting operational components (infra, deployment, backup) |
| `revert`   | Reverts to a previous commit                                         |

Breaking changes append `!` to the type (e.g. `feat!: drop Node 16 support`).

### `aureus verify [file]`

Validates that a commit message follows the [Conventional Commits](https://www.conventionalcommits.org/) spec. Exits with code `1` if invalid.

Automatically called by the Husky `commit-msg` hook installed during `aureus init`.

```bash
aureus verify -- .git/COMMIT_EDITMSG
```

Format enforced:

```
<type>[optional scope][optional !]: <description>
```

### `aureus bump [--dry-run]`

Inspects commit history since the last git tag, bumps the version in `package.json`, and prepends a new entry to `CHANGELOG.md`. Then creates a tagged release commit.

Automatically called by the Husky `pre-push` hook installed during `aureus init`.

**Version bump rules:**

| Commit pattern                              | Bump    |
| ------------------------------------------- | ------- |
| `!` in type or `breaking change` in message | `major` |
| `feat:` prefix                              | `minor` |
| `fix:` prefix                               | `patch` |
| anything else                               | none    |

```bash
# Preview what would happen without writing any files
aureus bump --dry-run

# Apply version bump, update CHANGELOG.md, and create a git tag
aureus bump
```

After bump creates a `v*` tag, the GitHub Actions workflow (installed by `aureus init` or `aureus create github-actions`) automatically creates a GitHub Release.

## Automated Workflow

After `aureus init`, the following automation is in place on every project:

```
git commit  →  commit-msg hook  →  aureus verify
                                       ↓ (invalid: exit 1)
                                       ↓ (valid: commit succeeds)

git push    →  pre-push hook    →  aureus bump
                                       ↓ (bumps version + CHANGELOG)
                                       ↓ (creates vX.Y.Z tag)
                                       ↓ (pushes tag → GitHub Actions)
                                           → GitHub Release created
```

> The `pre-push` hook sets `AUREUS_INTERNAL_PUSH=true` to prevent recursive triggering when it pushes the bump commit and tag.

## Configuration

Aureus persists your preferences to `~/.aureus/config.json`. This file is created on first run with defaults and updated as you make selections.

```json
{
  "author_name": "",
  "package_manager": "pnpm",
  "license": "mit",
  "gitignore": "Node",
  "contact": "",
  "commit_type": "feat",
  "commit_message": "",
  "is_breaking": false,
  "github_repo_visibility": "public",
  "github_remote_protocol": "ssh",
  "github_username": "",
  "init_options": [
    "code-of-conduct",
    "github-repo",
    "gitignore",
    "issue",
    "license",
    "pull-request"
  ]
}
```

All interactive prompts are pre-filled with these saved values, so repeated use requires minimal input.

## Templates

### Licenses

13 templates available:

`agpl-3.0`, `apache-2.0`, `bsd-2-clause`, `bsd-3-clause`, `bsl-1.0`, `cc0-1.0`, `epl-2.0`, `gpl-2.0`, `gpl-3.0`, `lgpl-2.1`, `mit`, `mpl-2.0`, `unlicense`

### .gitignore

150+ language and framework templates sourced from [github/gitignore](https://github.com/github/gitignore), including `Node`, `Python`, `Go`, `Rust`, `Flutter`, `Unity`, `Terraform`, and many more.

### GitHub Actions

Installs `.github/workflows/aureus-release.yml` — triggers on `v*` tags, creates a GitHub Release using `softprops/action-gh-release` with auto-generated release notes.

### Issue Templates

Three YAML-based GitHub issue forms:

- `bug-report.yml`
- `feature-request.yml`
- `config.yml` (blank issue config)

### Pull Request Template

Standard `PULL_REQUEST_TEMPLATE.md` placed in `.github/`.

### Code of Conduct

Contributor Covenant template with configurable contact details, placed in `.github/CODE_OF_CONDUCT.md`.

## License

MIT
