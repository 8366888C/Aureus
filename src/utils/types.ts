import { GITIGNORE_TEMPLATES, LICENSE_DISPLAY_NAMES } from "./constants.js";

/*
result of the pre-flight environment check
captures what already exists and the current environment state
 */
export interface EnvironmentCheck {
  hasGit: boolean;
  hasLicense: boolean;
  hasReadme: boolean;
  hasGitignore: boolean;
  hasCodeOfConduct: boolean;
  hasGitHubRemote: boolean;
  detectedShell: "bash" | "zsh" | "pwsh" | "unknown";
  hasGhCli: boolean;
  isGhAuthenticated: boolean;
  githubUsername: string | null;
}

/*
user's collected configuration from interactive prompts
this represents all the choices made during the CLI wizard
*/
export interface ProjectConfig {
  projectName: string;
  author: string;
  email: string;
  website: string;
  packageManager: PackageManager;
  needNPM: boolean;
  templateStyle: TemplateStyle;
  includeCodeOfConduct: boolean;
  license: LicenseType;
  gitignore: GitignoreTemplate;
  createGitHubRepo: boolean;
  repoVisibility: "public" | "private";
  repoDescription: string;
}

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  error?: string;
}

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
export type TemplateStyle = "short" | "long" | "mixed" | "none";
export interface ReleaseConfig {
  publishToNpm: boolean;
  branches: string[];
  plugins: string[];
}

export interface WriteFileOptions {
  // whether to overwrite existing files
  overwrite: boolean;
  // whether to create parent directories if they do not exist
  createDirs: boolean;
}

export type LicenseType = keyof typeof LICENSE_DISPLAY_NAMES;
export type GitignoreTemplate = (typeof GITIGNORE_TEMPLATES)[number];