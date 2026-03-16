import { Command } from "commander";
import path from "node:path";
import fs from "node:fs";
import {
  BUMP,
  INIT_GIT,
  INIT_GITIGNORE,
  INIT_HUSKY,
  INIT_PACKAGE_MANAGER,
  setupHooks,
  SUCCESS,
  SWITCH_CODE_OF_CONDUCT,
  SWITCH_COMMIT,
  SWITCH_GITHUB_REPO,
  SWITCH_GITIGNORE,
  SWITCH_ISSUE,
  SWITCH_LICENSE,
  SWITCH_PULL_REQUEST,
  VERIFY,
  VIEW_CODE_OF_CONDUCT,
  VIEW_GITHUB_ACTIONS,
  VIEW_GITIGNORE,
  VIEW_ISSUE,
  VIEW_LICENSE,
  VIEW_PULL_REQUEST,
  finalize,
  INIT_CHANGELOG,
  INIT_GITHUB_ACTIONS,
  detect_package,
} from "./utils.js";
import { INIT, PACKAGE_MANAGER } from "./prompts.js";
import { getConfig, saveConfig } from "./utils.js";

const CONFIG = getConfig();

const program = new Command();
program
  .name(process.env.NAME as string)
  .description(process.env.DESCRIPTION as string)
  .version(process.env.VERSION as string, "-v, --version");

// ! INIT
program
  .command("init")
  .description("Initialize a new project")
  .argument(
    "[folder]",
    "Folder name to create (use . for current directory)",
    ".",
  )
  .action(async (folder) => {
    const BASE_DIR =
      folder == "." ? process.cwd() : path.join(process.cwd(), `${folder}`);
    if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });

    const GITHUB_DIR = path.join(BASE_DIR, ".github");
    if (!fs.existsSync(GITHUB_DIR))
      fs.mkdirSync(GITHUB_DIR, { recursive: true });

    const ISSUE_DIR = path.join(GITHUB_DIR, "ISSUE_TEMPLATE");
    if (!fs.existsSync(ISSUE_DIR)) fs.mkdirSync(ISSUE_DIR, { recursive: true });

    const workflows_DIR = path.join(GITHUB_DIR, "workflows");
    if (!fs.existsSync(workflows_DIR))
      fs.mkdirSync(workflows_DIR, { recursive: true });

    const package_manager =
      detect_package(BASE_DIR) || (await PACKAGE_MANAGER(CONFIG));
    const init_options = await INIT(CONFIG);

    CONFIG.init_options = init_options;
    CONFIG.package_manager = package_manager;
    saveConfig(CONFIG);

    await INIT_PACKAGE_MANAGER(CONFIG, package_manager, BASE_DIR);

    INIT_GIT(BASE_DIR);

    INIT_HUSKY(package_manager, BASE_DIR);

    INIT_GITIGNORE(BASE_DIR);

    for (const init_option of init_options) {
      switch (init_option) {
        case "code-of-conduct":
          await SWITCH_CODE_OF_CONDUCT(CONFIG, BASE_DIR, GITHUB_DIR);
          break;
        case "github-repo":
          await SWITCH_GITHUB_REPO(CONFIG, path.basename(BASE_DIR), BASE_DIR);
          break;
        case "gitignore":
          await SWITCH_GITIGNORE(CONFIG, BASE_DIR);
          break;
        case "issue":
          SWITCH_ISSUE(ISSUE_DIR);
          break;
        case "license":
          await SWITCH_LICENSE(CONFIG, BASE_DIR);
          break;
        case "pull-request":
          SWITCH_PULL_REQUEST(GITHUB_DIR);
          break;
        default:
          INIT_GITHUB_ACTIONS(workflows_DIR);
          INIT_CHANGELOG(BASE_DIR);
          break;
      }
    }
    setupHooks(BASE_DIR, init_options.includes("github-actions"));
    finalize();
    SUCCESS("Aureus initialization complete");
  });

// ! SUB COMMANDS
const create = program
  .command("create")
  .description("Add standardized project components and templates on demand");
const view = program
  .command("view")
  .description("View specific templates or project configurations");
const commit = program
  .command("commit")
  .description("Commit changes with interactive type selection");
const verify = program
  .command("verify")
  .description("Is conventional commit or not ?")
  .argument("[file]", "Commit message file");
const bump = program
  .command("bump")
  .description("Automatic version bump and changelog generation");

// ! LICENSE
create
  .command("license")
  .description("create a LICENSE file")
  .action(async () => {
    await SWITCH_LICENSE(CONFIG, process.cwd());
  });

view
  .command("license")
  .description("View a LICENSE file")
  .action(async () => {
    await VIEW_LICENSE(CONFIG);
  });

// ! gitignore
create
  .command("gitignore")
  .description("create a template .gitignore file")
  .action(async () => {
    await SWITCH_GITIGNORE(CONFIG, process.cwd());
  });

view
  .command("gitignore")
  .description("View a .gitignore file")
  .action(async () => {
    await VIEW_GITIGNORE(CONFIG);
  });

// ! pull-request
create
  .command("pull-request")
  .description("create a pull_request template")
  .action(() => {
    const GITHUB_DIR = path.join(process.cwd(), ".github");
    SWITCH_PULL_REQUEST(GITHUB_DIR);
  });

view
  .command("pull-request")
  .description("View a pull_request template")
  .action(() => {
    VIEW_PULL_REQUEST();
  });

// ! issue
create
  .command("issue")
  .description("create an issue_template")
  .action(() => {
    const GITHUB_DIR = path.join(process.cwd(), ".github");
    const ISSUE_DIR = path.join(path.join(GITHUB_DIR), "ISSUE_TEMPLATE");
    SWITCH_ISSUE(ISSUE_DIR);
  });

view
  .command("issue")
  .description("View an issue template")
  .action(() => {
    VIEW_ISSUE();
  });

// ! CODE OF CONDUCT
create
  .command("code-of-conduct")
  .description("create code_of_conduct template")
  .action(async () => {
    const BASE_DIR = process.cwd();
    const DOCS_DIR = path.join(process.cwd(), "docs");
    await SWITCH_CODE_OF_CONDUCT(CONFIG, BASE_DIR, DOCS_DIR);
  });

view
  .command("code-of-conduct")
  .description("View code_of_conduct template")
  .action(async () => {
    await VIEW_CODE_OF_CONDUCT(CONFIG);
  });

// ! GITHUB ACTIONS
create
  .command("github-actions")
  .description("create github actions workflow")
  .action(() => {
    const GITHUB_DIR = path.join(process.cwd(), ".github");
    const workflows_DIR = path.join(GITHUB_DIR, "workflows");
    INIT_GITHUB_ACTIONS(workflows_DIR);
  });

view
  .command("github-actions")
  .description("View github actions workflow")
  .action(async () => {
    VIEW_GITHUB_ACTIONS();
  });

// ! GITHUB REPO
create
  .command("github-repo")
  .description("create a github repository")
  .action(async () => {
    await SWITCH_GITHUB_REPO(
      CONFIG,
      path.basename(process.cwd()),
      process.cwd(),
    );
  });

// ! COMMIT
commit.action(async () => {
  await SWITCH_COMMIT(CONFIG);
});

// ! VERIFY
verify.action((file) => {
  VERIFY(file);
});

// ! BUMP
bump
  .option("--dry-run", "See changes without applying them")
  .action(async (options) => {
    await BUMP(options);
  });

// ! END
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);
