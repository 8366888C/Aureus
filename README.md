# Aureus

CLI tool to bootstrap, standardize and automate repository workflows. It sets up modern project scaffolding, commit conventions, semantic versioning and GitHub integration with minimal manual work

[![aureus](https://nodei.co/npm/aureus.svg)](https://npmjs.com/package/aureus)

## Features

- Standardize commit messages with conventional commits
- Husky hooks for commit message validation and version bumping
- Semantic versioning and changelog generation
- GitHub integration with GitHub Actions
- GitHub repository creation with GitHub CLI
- License and code of conduct generation
- Pull request template generation
- GitHub issue template generation
- Supports npm, pnpm, yarn and bun

---

## Get Started

### Installation

```bash
npm install -g aureus
```

### Requirements

- Node.js 18 or newer
- Git
- [Github CLI](https://cli.github.com/) optional but required for `github-repo` features

### Quick Start

```bash
# initialize a new project in a folder
aureus init my-project

# or scaffold the current directory
aureus init

# or use npx
npx aureus init my-project
npx aureus init
```

---

## Commands

### `aureus init [folder]`

Initialize a new repository in `folder` (defaults to current directory)

### `aureus create <component>`

Add these components to an existing project on demand:

- license
- gitignore
- pull-request
- issue
- code-of-conduct
- husky-hooks
- github-actions
- github-repo

### `aureus view <component>`

Preview templates and configuration before creating them

### `aureus commit`

Interactive helper for conventional commits

It guides you through selecting a commit type, adding an optional scope, writing the message and flagging breaking changes

Supported types:

- feat - A new feature
- fix - A bug fix
- refactor - Code rewrites or restructure
- build - Changes that affect build components
- chore - Changes that do not modify app logic
- test - Add or correct tests
- ops - Changes to operational components
- revert - Reverts a previous commit

### `aureus bump [--dry-run]`

Analyze commits since the last tag, determine the correct semantic version bump, update `package.json`, generate a changelog entry and create a git tag

```bash
# for bumping directly
aureus bump

# preview without applying changes
aureus bump --dry-run
```

This is typically wired into the `pre-push` husky hook so that versioning and changelog are kept in sync automatically

### `aureus create husky-hooks`

Generate or update husky hooks in `.husky` and wire them to `aureus verify` and `aureus bump`. Existing hook files are preserved and extended when possible

When you run `aureus create husky-hooks` or select husky support during `aureus init`, the following hooks are configured:

- **commit-msg** - runs `aureus verify` to enforce conventional commits
- **pre-push** - runs `aureus bump` to bump versions and update changelog before pushing

---

## Configuration

Aureus keeps user preferences in `~/.aureus/config.json` and reuses them across runs

| Key                      | Description                       | Default |
| ------------------------ | --------------------------------- | ------- |
| `author_name`            | Default author name               |         |
| `package_manager`        | Preferred package manager         | pnpm    |
| `license`                | Default license                   | mit     |
| `gitignore`              | Default .gitignore template       | node    |
| `github_repo_visibility` | GitHub repository visibility      | public  |
| `github_remote_protocol` | Git remote protocol               | ssh     |
| `github_username`        | Your GitHub username              |         |
| `contact`                | Contact email for code of conduct |         |

---

## License

This OSS is licensed under [MIT](https://github.com/8366888C/Aureus/blob/main/LICENSE)
