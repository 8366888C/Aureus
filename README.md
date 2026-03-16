# Aureus

A CLI tool to automate the setup of Git, GitHub repositories, husky hooks and semantic release with built-in support for all major package managers.

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

## Usage

```bash
aureus --help
```

## Commands

### `aureus init`

Initialize your project with customizable templates:

- **license** - Add a license file (MIT, Apache, GPL, BSD, etc.)
- **gitignore** - Add .gitignore templates (Node, Python, Go, Rust, etc.)
- **code-of-conduct** - Add a code of conduct file
- **github-repo** - Create a GitHub repository
- **issue** - Add issue templates
- **pull-request** - Add pull request templates

```bash
aureus init
```

### `aureus commit`

Interactive conventional commit builder with type selection and breaking change prompts.

```bash
aureus commit
```

### `aureus github`

Create a GitHub repository with options for visibility (public/private) and protocol (HTTPS/SSH).

```bash
aureus github
```

## Supported Package Managers

- npm
- pnpm
- yarn
- bun

## Requirements

- Node.js >= 18.0.0

## License

MIT
