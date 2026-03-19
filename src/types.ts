import CHANGELOG_TEMPLATES from "../templates/changelog.json" with { type: "json" };
import CODE_OF_CONDUCT_TEMPLATES from "../templates/code_of_conduct.json" with { type: "json" };
import COMMIT_TEMPLATES from "../templates/commit.json" with { type: "json" };
import GITHUB_ACTIONS_TEMPLATES from "../templates/github_actions.json" with { type: "json" };
import GITIGNORE_TEMPLATES from "../templates/gitignore.json" with { type: "json" };
import ISSUE_TEMPLATES from "../templates/issue.json" with { type: "json" };
import LICENSE_TEMPLATES from "../templates/license.json" with { type: "json" };

export interface LicenseEntry {
  name: string;
  tag: string;
  template: string;
}
import PULL_REQUEST_TEMPLATES from "../templates/pull_request.json" with { type: "json" };

// ! TYPES

export type CCType = keyof typeof CODE_OF_CONDUCT_TEMPLATES;
export type CType = keyof typeof COMMIT_TEMPLATES;
export type GAType = keyof typeof GITHUB_ACTIONS_TEMPLATES;
export type GIType = keyof typeof GITIGNORE_TEMPLATES;
export type IType = keyof typeof ISSUE_TEMPLATES;
export type LType = (typeof license_choices)[number]["name"];
export type PRType = keyof typeof PULL_REQUEST_TEMPLATES;
export type PMType = (typeof package_manager_choices)[number];
export interface ThemeContext {
  state: { submitted: boolean; initial: string };
  value: string;
  input: string;
  index: number;
}
export type vType = "major" | "minor" | "patch" | "none";

export type initType = (typeof init_choices)[number]["name"];

export interface CInterface {
  author_name: string;
  init_options: initType[];
  package_manager: PMType;
  license: LType;
  gitignore: GIType;
  contact: string;
  commit_type: CType;
  commit_message: string;
  is_breaking: boolean;
  github_repo_visibility: "public" | "private";
  github_remote_protocol: "https" | "ssh";
  github_username: string;
}

// ! CHOICES

export const init_choices = [
  { name: "code-of-conduct", message: "code-of-conduct" },
  { name: "github-repo", message: "github-repo" },
  { name: "gitignore", message: "gitignore" },
  { name: "issue", message: "issue" },
  { name: "license", message: "license" },
  { name: "pull-request", message: "pull-request" },
];

export const package_manager_choices = ["npm", "pnpm", "yarn", "bun"];

export const license_choices = LICENSE_TEMPLATES.map((item) => {
  return { name: item.tag, message: item.tag, hint: item.name };
});

export const gitignore_choices = Object.keys(GITIGNORE_TEMPLATES);

export const github_actions_choices = Object.keys(GITHUB_ACTIONS_TEMPLATES);

export const commit_choices = Object.entries(COMMIT_TEMPLATES).map(
  ([key, value]) => {
    return { name: key, message: key, hint: value };
  },
);

export const commit_types = Object.keys(COMMIT_TEMPLATES);
