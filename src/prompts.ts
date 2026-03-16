import { autocomplete, confirm, input, multiselect } from "./utils.js";
import CHANGELOG_TEMPLATES from "../templates/changelog.json" with { type: "json" };
import CODE_OF_CONDUCT_TEMPLATES from "../templates/code_of_conduct.json" with { type: "json" };
import GITHUB_ACTIONS_TEMPLATES from "../templates/github_actions.json" with { type: "json" };
import GITIGNORE_TEMPLATES from "../templates/gitignore.json" with { type: "json" };
import ISSUE_TEMPLATES from "../templates/issue.json" with { type: "json" };
import LICENSE_TEMPLATES from "../templates/license.json" with { type: "json" };
import PULL_REQUEST_TEMPLATES from "../templates/pull_request.json" with { type: "json" };
import { currentYear, imprintCodeOfConduct, imprintLicense } from "./utils.js";
import {
  CInterface,
  CType,
  GIType,
  IType,
  PMType,
  commit_choices,
  gitignore_choices,
  initType,
  init_choices,
  license_choices,
  package_manager_choices,
} from "./types.js";

// ! INIT
export async function INIT(CONFIG: CInterface) {
  const { init_options } = await multiselect<{ init_options: initType[] }>({
    name: "init_options",
    message: "Choose your preferred option",
    choices: init_choices,
    initial: CONFIG?.init_options,
  });
  return init_options;
}

// ! PACKAGE MANAGER
export async function PACKAGE_MANAGER(CONFIG: CInterface) {
  const { package_manager } = await autocomplete<{ package_manager: PMType }>({
    name: "package_manager",
    message: "Choose your package manager",
    choices: package_manager_choices,
    initial: CONFIG?.package_manager,
  });
  return package_manager;
}

export async function INSTALL_PM(CONFIG: CInterface) {
  const { install_pm } = await confirm<{ install_pm: boolean }>({
    name: "install_pm",
    message: `Would you like to install ${CONFIG.package_manager} globally`,
  });
  return install_pm;
}

// ! LICENSE
export async function LICENSE(CONFIG: CInterface) {
  const { author_name } = await input<{ author_name: string }>({
    name: "author_name",
    message: "Author name",
    initial: CONFIG.author_name,
  });
  const { license_type } = await autocomplete<{ license_type: string }>({
    name: "license_type",
    message: "Choose a LICENSE template",
    choices: license_choices,
    initial: CONFIG?.license,
  });
  const license_template = LICENSE_TEMPLATES.find(
    (item) => item.tag === license_type,
  );
  const template = imprintLicense(
    license_template ? license_template.template : "Template not found",
    author_name,
    currentYear,
  );
  return { template: template, res: { author_name, license_type } };
}

// ! GITIGNORE
export async function GITIGNORE(CONFIG: CInterface) {
  const { gitignore_type } = await autocomplete<{ gitignore_type: GIType }>({
    name: "gitignore_type",
    message: "Choose a .gitignore template",
    choices: gitignore_choices,
    initial: CONFIG?.gitignore,
  });
  const template = GITIGNORE_TEMPLATES[gitignore_type];
  return { template: template, res: { gitignore_type } };
}

// ! PULL REQUEST
export function PULL_REQUEST() {
  const template = PULL_REQUEST_TEMPLATES["default"];
  return { template: template };
}

// ! ISSUE
export function ISSUE() {
  const template = {
    bug: ISSUE_TEMPLATES["bug-report"],
    feature: ISSUE_TEMPLATES["feature-request"],
    config: ISSUE_TEMPLATES["config"],
  };
  return { template: template };
}

// ! CODE OF CONDUCT
export async function CODE_OF_CONDUCT(CONFIG: CInterface) {
  const { contact } = await input<{ contact: string }>({
    name: "contact",
    message: "Enter contact details for this project",
    initial: CONFIG?.contact,
  });
  const template = imprintCodeOfConduct(
    CODE_OF_CONDUCT_TEMPLATES["contributor_covenant"],
    contact,
  );
  return { template: template, res: { contact } };
}

// ! GITHUB ACTIONS
export function GITHUB_ACTIONS() {
  const template = GITHUB_ACTIONS_TEMPLATES["default"];
  return { template };
}

// ! CHANGELOG
export async function CHANGELOG() {
  const template = CHANGELOG_TEMPLATES["default"];
  return { template: template };
}

// ! COMMIT
export async function COMMIT(CONFIG: CInterface) {
  const { commit_type } = await autocomplete<{ commit_type: CType }>({
    name: "commit_type",
    message: "Choose the type of commit",
    choices: commit_choices,
    initial: CONFIG?.commit_type,
  });
  const { commit_message } = await input<{ commit_message: string }>({
    name: "commit_message",
    message: "Type a commit message",
    initial: CONFIG?.commit_message,
  });
  const { is_breaking } = await confirm<{ is_breaking: boolean }>({
    name: "is_breaking",
    message: "Is this a breaking change?",
  });

  return { res: { commit_type, commit_message, is_breaking } };
}

// ! GITHUB
export async function INSTALL_GITHUB_CLI() {
  const { install_github_cli } = await confirm<{ install_github_cli: boolean }>(
    {
      name: "install_github_cli",
      message: `Would you like to install Github CLI`,
    },
  );
  return install_github_cli;
}

export async function GITHUB_REPO_VISIBILITY(CONFIG: CInterface) {
  const { github_repo_visibility } = await autocomplete<{
    github_repo_visibility: "public" | "private";
  }>({
    name: "github_repo_visibility",
    message: "Repository visibility",
    choices: ["public", "private"],
    initial: CONFIG.github_repo_visibility,
  });
  return github_repo_visibility;
}

export async function GITHUB_REMOTE_PROTOCOL(CONFIG: CInterface) {
  const { github_remote_protocol } = await autocomplete<{
    github_remote_protocol: "https" | "ssh";
  }>({
    name: "github_remote_protocol",
    message: "Git protocol for remote origin",
    choices: ["https", "ssh"],
    initial: CONFIG.github_remote_protocol,
  });
  return github_remote_protocol;
}

// ! OVERWRITE
export async function OVERWRITE(name: string) {
  const { overwrite } = await confirm<{ overwrite: boolean }>({
    name: "overwrite",
    message: `Do you want to overwrite existing ${name} template?`,
  });
  return overwrite;
}
