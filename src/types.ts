import GITIGNORE_TEMPLATES from "../templates/gitignore.json" with { type: "json" };
import LICENSE_TEMPLATES from "../templates/license.json" with { type: "json" };
import PULL_REQUEST_TEMPLATES from "../templates/pull_request.json" with { type: "json" };
import ISSUE_TEMPLATES from "../templates/issue.json" with { type: "json" };
import CODE_OF_CONDUCT_TEMPLATES from "../templates/code_of_conduct.json" with { type: "json" };
import COMMIT_TEMPLATES from "../templates/commit.json" with { type: "json" };

export interface ThemeContext {
  state: { submitted: boolean; initial: string };
  value: string;
  input: string;
  index: number;
}

export type GIType = keyof typeof GITIGNORE_TEMPLATES;
export type LType = keyof typeof LICENSE_TEMPLATES;
export type PRType = keyof typeof PULL_REQUEST_TEMPLATES;
export type CCType = keyof typeof CODE_OF_CONDUCT_TEMPLATES;
export type IType = keyof typeof ISSUE_TEMPLATES;
export type EType = string;
export interface CInterface {
  user: {
    name: string;
    about: string;
    email: string;
    website: string;
    github_username: string;
  };
  settings: {
    git: boolean;
  };
}

export type CType = keyof typeof COMMIT_TEMPLATES;
