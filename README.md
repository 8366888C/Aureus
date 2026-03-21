# aureus

A CLI tool to bootstrap, standardize, and automate repository workflows. Quickly set up new projects with modern development practices, commit conventions, semantic versioning, and GitHub integration.

## Installation

```bash
npm install -g aureus
```

## Quick Start

```bash
# Initialize a new project
aureus init my-project

# Or scaffold the current directory
aureus init
```

## Commands

### `aureus init [folder]`

Scaffolds a complete project setup. Defaults to the current directory.

Sets up git, a package manager, husky hooks, GitHub Actions, and any components you select:

- `license` — LICENSE file (60+ options)
- `gitignore` — language/framework-specific .gitignore (100+ templates)
- `pull-request` — PR template
- `issue` — GitHub issue templates (bug report, feature request, config)
- `code-of-conduct` — Contributor Covenant code of conduct
- `github-repo` — creates and configures a GitHub repository

---

### `aureus create <component>`

Add individual components to an existing project.

```bash
aureus create license
aureus create gitignore
aureus create pull-request
aureus create issue
aureus create code-of-conduct
aureus create husky-hooks
aureus create github-actions
aureus create github-repo
```

---

### `aureus view <component>`

Preview a template before creating it.

```bash
aureus view license
aureus view gitignore
aureus view pull-request
aureus view issue
aureus view code-of-conduct
aureus view husky-hooks
aureus view github-actions
```

---

### `aureus commit`

Interactive conventional commit prompt.

Guides you through selecting a commit type, writing a message, and flagging breaking changes. Supported types:

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `refactor` | Code rewrites or restructure |
| `build` | Changes that affect build components |
| `chore` | Changes that don't modify the main app |
| `test` | Add or correct tests |
| `ops` | Changes to operational components |
| `revert` | Reverts a previous commit |

---

### `aureus verify [file]`

Validates a commit message file against the conventional commits spec. Used automatically by the `commit-msg` husky hook.

```bash
aureus verify .git/COMMIT_EDITMSG
```

Exits with code `1` if the message is invalid.

---

### `aureus bump [--dry-run]`

Analyzes commits since the last tag, determines the appropriate semantic version bump, updates `package.json`, generates a changelog entry, and creates a git tag.

```bash
# Preview without applying changes
aureus bump --dry-run
```

Typically triggered automatically by the `pre-push` husky hook.

---

## Husky Hooks

When you run `aureus create husky-hooks` (or select it during `init`), two hooks are installed:

- **`commit-msg`** — runs `aureus verify` to enforce conventional commits
- **`pre-push`** — runs `aureus bump` to auto-version and tag before pushing

---

## Configuration

Preferences are saved to `~/.aureus/config.json` and reused as defaults on subsequent runs.

| Key | Description | Default |
|-----|-------------|---------|
| `author_name` | Your name | `""` |
| `package_manager` | Preferred package manager | `"pnpm"` |
| `license` | Default license | `"mit"` |
| `gitignore` | Default .gitignore template | `"Node"` |
| `github_repo_visibility` | Repository visibility | `"public"` |
| `github_remote_protocol` | Remote URL protocol | `"ssh"` |
| `github_username` | Your GitHub username | `""` |
| `contact` | Contact email for code of conduct | `""` |

---

## Requirements

- Node.js >= 18
- Git
- [GitHub CLI](https://cli.github.com/) (`gh`) — optional, required for `github-repo` features

## Package Manager Support

Aureus supports npm, pnpm, yarn, and bun, with auto-detection of whichever is already in use.

## License

MIT
