import pc from "picocolors";
import Enquirer from "enquirer";
const { prompt } = Enquirer;
import { stdout } from "node:process";
import child_process, { execSync, spawnSync } from "node:child_process";
import fs, { existsSync } from "node:fs";
import path from "node:path";
import os, { release } from "node:os";
import { CInterface, commit_types, IType, PMType, vType } from "./types.js";
import {
  CHANGELOG,
  CODE_OF_CONDUCT,
  COMMIT,
  GITHUB_ACTIONS,
  GITHUB_REMOTE_PROTOCOL,
  GITHUB_REPO_VISIBILITY,
  GITIGNORE,
  INSTALL_GITHUB_CLI,
  INSTALL_PM,
  ISSUE,
  LICENSE,
  OVERWRITE,
  PULL_REQUEST,
} from "./prompts.js";

// ! PROMPTS
const dynamicLimit = Math.max(1, (stdout.rows || 8) - 4);

export async function input<TShape>({
  name,
  message,
  initial,
}: {
  name: string;
  message: string;
  initial: string;
}) {
  return await prompt<TShape>({
    type: "input",
    name: name,
    message: message,
    initial: initial,
    ...theme,
  } as any);
}

export async function autocomplete<TShape>({
  name,
  message,
  choices,
  initial,
}: {
  name: string;
  message: string;
  choices:
    | string[]
    | { name: string; message: string; hint: string }[]
    | { name: string; message: string }[];
  initial?: any;
}) {
  return await prompt<TShape>({
    type: "autocomplete",
    name: name,
    message: message,
    hint: pc.cyan("[use arrows to move, type to filter]"),
    choices: choices,
    initial: initial,
    limit: dynamicLimit,
    ...theme,
  } as any);
}

export async function confirm<TShape>({
  name,
  message,
  initial,
}: {
  name: string;
  message: string;
  initial?: any;
}) {
  return await prompt<TShape>({
    type: "confirm",
    name: name,
    message: message,
    initial: initial,
    ...theme,
  } as any);
}

export async function multiselect<TShape>({
  name,
  message,
  choices,
  initial,
}: {
  name: string;
  message: string;
  choices:
    | string[]
    | { name: string; message: string; hint: string }[]
    | { name: string; message: string }[];
  initial?: any;
}) {
  return await prompt<TShape>({
    type: "multiselect",
    name: name,
    message: message,
    hint: pc.cyan("[use arrows to move, space to select]"),
    choices: choices,
    initial: initial,
    limit: dynamicLimit,
    ...theme,
  } as any);
}

// ! CUSTOM THEME
export const theme = {
  prefix: (state: any) => (state.submitted ? pc.green("✓") : pc.cyan("?")),
  // styles: {
  //   em: (str: string) => pc.bold(str),
  //   primary: pc.cyan,
  // },
  // format(this: any) {
  //   if (this.state.submitted) {
  //     return pc.green(this.value);
  //   }
  //   return this.value;
  // },
  // pointer(this: any, _choice: any, index: number): string {
  //   return this.index === index ? pc.magenta(">") : " ";
  // },
};

// ! CONSTANTS
const DEFAULT_CONFIG: CInterface = {
  author_name: "",
  init_options: [
    "code-of-conduct",
    "github-repo",
    "gitignore",
    "issue",
    "license",
    "pull-request",
  ],
  package_manager: "pnpm",
  license: "mit",
  gitignore: "Node",
  contact: "",
  commit_type: "feat",
  commit_message: "",
  is_breaking: false,
  github_repo_visibility: "public",
  github_remote_protocol: "ssh",
  github_username: "",
};
const currentDate = new Date().toISOString().split("T")[0];
export const currentYear = new Date().getFullYear().toString();
export const SUCCESS = (m?: string) =>
  m
    ? console.log(pc.bgGreen(pc.bold(" SUCCESS ")) + pc.green(` → ${m}`))
    : console.log(pc.bgGreen(pc.bold(" SUCCESS ")));
export const ERROR = (e: unknown) => {
  e
    ? console.error(pc.bgRed(pc.bold(" ERROR ")) + pc.red(` → ${e}`))
    : console.error(pc.bgRed(pc.bold(" ERROR ")));
};
export const INFO = (m: string) =>
  console.log(pc.bgWhite(pc.bold(pc.black(" INFO "))) + pc.white(` → ${m}`));
export const WARN = (m: unknown) =>
  console.warn(pc.bgYellow(pc.bold(pc.black(" WARN "))) + pc.yellow(` → ${m}`));

// ! COMMIT
export function getCommitHistory() {
  try {
    const lastTag = child_process
      .execSync("git describe --tags --abbrev=0", {
        stdio: "pipe",
      })
      .toString()
      .trim();
    const logs = child_process
      .execSync(`git log ${lastTag}..HEAD --oneline`, {
        stdio: "pipe",
      })
      .toString()
      .trim();
    return logs.split("\n").filter(Boolean);
  } catch (e) {
    try {
      const logs = child_process
        .execSync("git log --oneline", { stdio: "pipe" })
        .toString()
        .trim();
      return logs.split("\n").filter(Boolean);
    } catch (e) {
      return [];
    }
  }
}

// ! CHANGELOG
export function getUsername() {
  try {
    const remoteUrl = child_process
      .execSync("git remote get-url origin", {
        stdio: ["pipe", "pipe", "pipe"],
      })
      .toString()
      .trim();
    // https://github.com/username/repo.git  or  git@github.com:username/repo.git
    const match =
      remoteUrl.match(/github\.com[:/]([^/]+)\//) ??
      remoteUrl.match(/github\.com\/([^/]+)\//);
    return match?.[1] ?? undefined;
  } catch {
    return undefined;
  }
}

export function getRepoName() {
  try {
    const remoteUrl = child_process
      .execSync("git remote get-url origin", {
        stdio: ["pipe", "pipe", "pipe"],
      })
      .toString()
      .trim();
    // strip trailing .git if present
    const match =
      remoteUrl.match(/github\.com[:/][^/]+\/([^/]+?)(?:\.git)?$/) ??
      remoteUrl.match(/github\.com\/[^/]+\/([^/]+?)(?:\.git)?$/);
    return match?.[1] ?? undefined;
  } catch {
    return undefined;
  }
}

export function getBumpType(commits: string[]) {
  let bump: vType = "none";
  for (const commit of commits) {
    const message = commit.split(" ").slice(1).join(" ");
    if (
      message.includes("!") ||
      message.toLowerCase().includes("breaking change")
    ) {
      return "major";
    }
    if (message.toLowerCase().startsWith("feat")) {
      bump = "minor";
    } else if (message.toLowerCase().startsWith("fix") && bump != "minor") {
      bump = "patch";
    }
  }
  return bump;
}

export function bumpVersion(type: vType) {
  if (type === "none") return null;
  const pkgPath = path.join(process.cwd(), "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const version = pkg.version.split(".").map(Number);

  if (type === "major") {
    version[0]++;
    version[1] = 0;
    version[2] = 0;
  } else if (type === "minor") {
    version[1]++;
    version[2] = 0;
  } else if (type === "patch") {
    version[2]++;
  }

  const bumpVersion = version.join(".");
  pkg.version = bumpVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  return bumpVersion;
}

export function generateChangelog(
  newVersion: string,
  commits: string[],
  username: string,
  repoName: string,
  template: any,
) {
  const changelogPath = path.join(process.cwd(), "CHANGELOG.md");

  // process header
  const header = template.header
    .replace(/\[version\]/gi, newVersion)
    .replace(/\[username\]/gi, username)
    .replace(/\[repoName\]/gi, repoName)
    .replace(/\[date\]/gi, currentDate);

  // Initialize groups based on the template's defined sections
  const groups: Record<string, string[]> = {};
  Object.keys(template.sections).forEach((key) => {
    groups[key] = [];
  });

  // parse commits
  commits.forEach((commitLine) => {
    const firstSpace = commitLine.indexOf(" ");
    const hash = commitLine.substring(0, 7);
    const fullMessage = commitLine.substring(firstSpace + 1);

    const match = fullMessage.match(/^(\w+)(!)?(?:\(([^)]+)\))?:\s*(.*)$/);

    if (match) {
      const type = match[1].toLowerCase();
      const isBreaking = match[2] === "!";
      const message = match[4];

      const item = template.item
        .replace(
          /\[message\]/g,
          isBreaking ? `**BREAKING:** ${message}` : message,
        )
        .replace(/\[hash\]/g, hash)
        .replace(/\[username\]/gi, username)
        .replace(/\[repoName\]/gi, repoName);

      if (type === "feat") groups["features"].push(item);
      else if (type === "fix") groups["bug-fixes"].push(item);
      else groups["other"].push(item);
    } else {
      const item = template.item
        .replace(/\[message\]/g, fullMessage)
        .replace(/\[hash\]/g, hash)
        .replace(/\[username\]/gi, username)
        .replace(/\[repoName\]/gi, repoName);
      groups["other"].push(item);
    }
  });

  let body = "";

  // add features
  if (groups.features.length) {
    body += `${template.sections.features}${groups.features.join("")}`;
  }

  // add bug fixes
  if (groups["bug-fixes"].length) {
    body += `${template.sections["bug-fixes"]}${groups["bug-fixes"].join("")}`;
  }

  // add other
  if (groups["other"].length) {
    body += `${template.sections["other"]}${groups["other"].join("")}`;
  }

  const releaseEntry = `${header}\n${body}\n`;

  // update file
  let existingContent = "";
  if (fs.existsSync(changelogPath)) {
    existingContent = fs.readFileSync(changelogPath, "utf-8");
  }

  const title = "# CHANGELOG\n\n";
  const finalContent = existingContent.includes("# CHANGELOG")
    ? existingContent.replace(title, `${title}${releaseEntry}`)
    : `${title}${releaseEntry}${existingContent}`;

  return finalContent;
  // fs.writeFileSync(changelogPath, finalContent);
}

// ! HUSKY HOOKS
export function isBranchClean() {
  const commits = getCommitHistory();
  return commits.length > 0;
}

export function setupHooks(BASE_DIR: string, package_manager?: PMType) {
  const huskyDir = path.join(BASE_DIR, ".husky");
  const signature = "# aureus-setup-anchor";

  if (!fs.existsSync(huskyDir)) {
    WARN(".husky folder does not exist");
    if (package_manager) {
      INIT_HUSKY(package_manager, BASE_DIR);
    } else {
      INFO("Install husky in this directory manually to setup hooks");
    }
  }

  try {
    const commitMsgPath = path.join(huskyDir, "commit-msg");
    const commitMsgHook = `\n${signature}\nnpx aureus verify -- $1\n`;
    let commitMsgContent = "";
    if (fs.existsSync(commitMsgPath)) {
      commitMsgContent = fs.readFileSync(commitMsgPath, "utf-8");
    } else {
      commitMsgContent = "#!/bin/sh\n";
    }
    if (!commitMsgContent.includes(signature)) {
      fs.appendFileSync(commitMsgPath, commitMsgContent + commitMsgHook, {
        mode: 0o755,
      });
    }
    // SUCCESS("Successfully setup commit-msg hook");

    const prePushPath = path.join(huskyDir, "pre-push");
    const prePushHook = `\n${signature}\nif [ "$AUREUS_INTERNAL_PUSH" = "true" ]; then\n  exit 0\nfi\nnpx aureus bump --remote $1\n`;
    let prePushContent = "";
    if (fs.existsSync(prePushPath)) {
      prePushContent = fs.readFileSync(prePushPath, "utf-8");
    } else {
      prePushContent = "#!/bin/sh\n";
    }
    if (!prePushContent.includes(signature)) {
      fs.appendFileSync(prePushPath, prePushContent + prePushHook, {
        mode: 0o755,
      });
    }
    // SUCCESS("Successfully setup pre-push hook");

    const preCommitPath = path.join(huskyDir, "pre-commit");
    const preCommitHook = "";
    if (fs.existsSync(preCommitPath))
      fs.writeFileSync(preCommitPath, preCommitHook);
    SUCCESS("Generated default husky hooks");
  } catch (e) {
    ERROR(`Failed to setup husky hooks: ${e}`);
  }
}
0;

// ! GITHUB
// export function checkGithubStatus(): { loggedIn: boolean; user?: string } {
//   try {
//     const result = child_process.execSync("gh auth status --json account", {
//       stdio: "pipe",
//     });
//     const data = JSON.parse(result.toString());
//     return { loggedIn: true, user: data.account };
//   } catch (e) {
//     return { loggedIn: false };
//   }
// }

export function checkGithubStatus(): { loggedIn: boolean; user?: string } {
  try {
    // Run the command and grab both output pipes (stdout and stderr)
    const result = spawnSync("gh", ["auth", "status"], { encoding: "utf-8" });

    // Combine everything into one giant string of text
    const allOutput = (result.stdout || "") + (result.stderr || "");

    // If 'github.com' and 'Logged in' appear anywhere in the mess, you're in.
    if (allOutput.includes("Logged in to github.com")) {
      // Ugly, brute-force regex to grab the word after 'as' or 'account'
      const match = allOutput.match(/(?:as|account)\s+([^\s\n]+)/i);

      return {
        loggedIn: true,
        user: match ? match[1].trim() : "user",
      };
    }

    return { loggedIn: false };
  } catch (e) {
    // If the 'gh' command doesn't even exist on the machine
    ERROR(e);
    return { loggedIn: false };
  }
}

export async function installGithubCLI(): Promise<boolean> {
  const platform = os.platform();
  const installCmd =
    platform === "win32"
      ? "winget install --id Github.cli"
      : platform === "darwin"
        ? "brew install gh"
        : null;

  if (!installCmd) {
    WARN(
      "Automatic installation of Github CLI (gh) is not supported on this platform currently. Please install it manually from https://cli.github.com/",
    );
    return false;
  }

  try {
    child_process.execSync(installCmd, { stdio: "inherit" });
    SUCCESS("Github CLI installed successfully");
    return true;
  } catch (e) {
    ERROR(`Failed to install Github CLI: ${e}`);
    return false;
  }
}

// ! CONFIG
const DIR = path.join(os.homedir(), ".aureus");
const CONFIG_PATH = path.join(DIR, "config.json");

export function getConfig() {
  if (!fs.existsSync(DIR)) {
    fs.mkdirSync(DIR, { recursive: true });
  }
  const default_config = DEFAULT_CONFIG;
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(
      CONFIG_PATH,
      JSON.stringify(default_config, null, 2),
      "utf-8",
    );
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  return {
    ...default_config,
    ...config,
  };
}

export function saveConfig(data: Partial<CInterface>) {
  const current = getConfig();
  const updated = {
    ...current,
    ...data,
  };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2));
}

// ! LICENSE
// export const LChoices =
export function imprintLicense(
  template: string,
  name: string,
  year: string,
): string {
  return template
    .replace(/\[year\]|<year>|\[yyyy\]/gi, year)
    .replace(/\[fullname\]|<name of author>|\[name\]/gi, name);
}

// ! CODE OF CONDUCT
export function imprintCodeOfConduct(template: string, contact: string) {
  return template.replace(/\[contact\]/gi, contact);
}

// ! MISC
export function finalize(BASE_DIR: string) {
  try {
    child_process.execSync(`git add .`, { stdio: "inherit", cwd: BASE_DIR });
    child_process.execSync(
      `git commit -m "chore: initial commit from aureus"`,
      {
        stdio: "inherit",
        cwd: BASE_DIR,
      },
    );
    const branch = child_process
      .execSync("git rev-parse --abbrev-ref HEAD", { cwd: BASE_DIR })
      .toString()
      .trim();

    child_process.execSync(`git push origin ${branch}`, {
      stdio: "ignore",
      cwd: BASE_DIR,
    });
    SUCCESS("Aureus initialization complete");
  } catch (e) {}
}

export function has_package(package_name: string) {
  try {
    child_process.execSync(`${package_name} --version`, { stdio: "pipe" });
    return true;
  } catch (e) {
    return false;
  }
}

export function detect_package(BASE_DIR: string) {
  const lockfiles: Record<string, PMType> = {
    "pnpm-lock.yaml": "pnpm",
    "yarn.lock": "yarn",
    "bun.lockb": "bun",
    "bun.lock": "bun",
    "package-lock.json": "npm",
  };

  for (const [file, pm] of Object.entries(lockfiles)) {
    if (fs.existsSync(path.join(BASE_DIR, file))) {
      return pm;
    }
  }

  const pkgPath = path.join(BASE_DIR, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

      if (pkg.packageManager) {
        const [name] = pkg.packageManager.split("@");
        if (["npm", "pnpm", "yarn", "bun"].includes(name))
          return name as PMType;
      }

      if (pkg.engines) {
        if (pkg.engines.pnpm) return "pnpm";
        if (pkg.engines.yarn) return "yarn";
      }
    } catch (e) {}
  }

  let currentDir = BASE_DIR;
  let root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const parentDir = path.dirname(currentDir);

    if (fs.existsSync(path.join(parentDir, "pnpm-workspace.yaml")))
      return "pnpm";
    const parentPkgPath = path.join(parentDir, "package.json");
    if (fs.existsSync(parentPkgPath)) {
      try {
        const parentPkg = JSON.parse(fs.readFileSync(parentPkgPath, "utf-8"));
        if (parentPkg.workspaces) {
          return detect_package(parentDir);
        }
      } catch (e) {}
    }
    currentDir = parentDir;
  }
  return null;
}

export function detect_git(BASE_DIR: string) {
  try {
    const result = execSync("git rev-parse --is-inside-work-tree", {
      cwd: BASE_DIR,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    return result === "true";
  } catch (e) {
    return false;
  }
}

export function detect_code_of_conduct(BASE_DIR: string) {
  const code_of_conduct = "CODE_OF_CONDUCT.md";
  const commonSubfolders = [".", ".github", "docs"];
  let currentDir = BASE_DIR;
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    for (const folder of commonSubfolders) {
      const fullPath = path.join(currentDir, folder, code_of_conduct);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
    currentDir = path.dirname(currentDir);
  }
  return null;
}

// ! INIT
export async function INIT_PACKAGE_MANAGER(
  CONFIG: CInterface,
  selected_package_manager: PMType,
  BASE_DIR: string,
) {
  let package_manager = selected_package_manager;
  let skipInit = false;
  const detected_package_manager = detect_package(BASE_DIR);
  if (
    detected_package_manager &&
    detected_package_manager !== selected_package_manager
  ) {
    skipInit = true;
    WARN(
      `${detected_package_manager} found in the project root but selected package manager is ${package_manager}`,
    );
    INFO(`Using ${detected_package_manager} for installation`);
    package_manager = detected_package_manager;
  }
  if (!has_package(package_manager)) {
    WARN(`${package_manager} is not installed on your system`);
    const install_pm = await INSTALL_PM(CONFIG);
    if (install_pm) {
      try {
        switch (package_manager) {
          case "pnpm":
            child_process.execSync("npm install -g pnpm", {
              stdio: "inherit",
            });
            break;
          case "yarn":
            child_process.execSync("npm install -g yarn", {
              stdio: "inherit",
            });
            break;
          case "bun":
            child_process.execSync("npm install -g bun", {
              stdio: "inherit",
            });
            break;
          default:
            break;
        }
        SUCCESS(`${package_manager} installed successfully`);
      } catch (e) {
        ERROR(
          `Failed to install ${package_manager}. Please install it manually: ${e}`,
        );
        return;
      }
    } else {
      ERROR(`Cannot proceed without ${package_manager}`);
      return;
    }
  }

  // initialize project using said package manager
  try {
    if (!skipInit) {
      switch (package_manager) {
        case "pnpm":
          child_process.execSync("pnpm init", {
            stdio: "inherit",
            cwd: BASE_DIR,
          });
          break;
        case "yarn":
          child_process.execSync("yarn init -y", {
            stdio: "inherit",
            cwd: BASE_DIR,
          });
          break;
        case "bun":
          child_process.execSync("bun init -y", {
            stdio: "inherit",
            cwd: BASE_DIR,
          });
          break;
        default:
          child_process.execSync("npm init -y", {
            stdio: "inherit",
            cwd: BASE_DIR,
          });
          break;
      }
    } else {
      switch (package_manager) {
        case "pnpm":
          child_process.execSync("pnpm install", {
            stdio: "inherit",
            cwd: BASE_DIR,
          });
          break;
        case "yarn":
          child_process.execSync("yarn install", {
            stdio: "inherit",
            cwd: BASE_DIR,
          });
          break;
        case "bun":
          child_process.execSync("bun install", {
            stdio: "inherit",
            cwd: BASE_DIR,
          });
          break;
        default:
          child_process.execSync("npm install", {
            stdio: "inherit",
            cwd: BASE_DIR,
          });
          break;
      }
    }
    SUCCESS(`Project initialized using ${package_manager}`);
  } catch (e) {
    ERROR(`Failed to initialize ${package_manager} project: ${e}`);
  }

  return package_manager;
}

export function INIT_GIT(BASE_DIR: string) {
  try {
    if (!detect_git(BASE_DIR)) {
      child_process.execSync("git init", { stdio: "inherit", cwd: BASE_DIR });
      SUCCESS("Initialized git repository");
    } else {
      INFO("Git repository already detected");
    }
    // child_process.execSync("git config --local push.followTags true", {
    //   stdio: "ignore",
    //   cwd: BASE_DIR,
    // });
  } catch (e) {
    ERROR(`Failed to initialize git repository: ${e}`);
  }
}

export function INIT_HUSKY(package_manager: PMType, BASE_DIR: string) {
  if (fs.existsSync(path.join(BASE_DIR, ".husky"))) {
    INFO("Husky already installed");
    return;
  }

  try {
    switch (package_manager) {
      case "pnpm":
        child_process.execSync("pnpm add -D husky", {
          stdio: "inherit",
          cwd: BASE_DIR,
        });
        break;
      case "yarn":
        child_process.execSync("yarn add -D husky", {
          stdio: "inherit",
          cwd: BASE_DIR,
        });
        break;
      case "bun":
        child_process.execSync("bun add -d husky", {
          stdio: "inherit",
          cwd: BASE_DIR,
        });
        break;
      default:
        child_process.execSync("npm install husky --save-dev", {
          stdio: "inherit",
          cwd: BASE_DIR,
        });
        break;
    }
    try {
      child_process.execSync("npx husky init", {
        stdio: "inherit",
        cwd: BASE_DIR,
      });
    } catch (e) {
      ERROR(`Failed to run npx husky init: ${e}`);
    }
  } catch (e) {
    ERROR(`Failed to install husky: ${e}`);
  }

  setupHooks(BASE_DIR, package_manager);
}

export function INIT_GITIGNORE(BASE_DIR: string) {
  const gitignorePath = path.join(BASE_DIR, ".gitignore");
  const comment = "# aureus-setup-anchor";
  const ignoredItems = ["node_modules/"];
  const ignoredList = ignoredItems.join("\n");
  const gitignore = `${comment}\n${ignoredList}`;

  try {
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, gitignore, "utf-8");
      // SUCCESS("Generated aureus default gitignore");
      return;
    }

    const content = fs.readFileSync(gitignorePath, "utf-8");
    if (!content.includes(comment)) {
      const separator = content.endsWith("\n\\n")
        ? ""
        : content.endsWith("\n")
          ? "\n"
          : "\n\n";
      fs.appendFileSync(
        gitignorePath,
        `${separator}${gitignore}` + "\n",
        "utf-8",
      );
      // SUCCESS("Appended aureus default gitignore");
    }
  } catch (e) {
    ERROR(`Failed aureus gitignore: ${e}`);
  }
}

export async function INIT_GITHUB_ACTIONS(workflows_DIR: string) {
  const releasePath = path.join(workflows_DIR, "aureus-release.yml");
  const github_actions = GITHUB_ACTIONS();
  try {
    if (!fs.existsSync(workflows_DIR))
      fs.mkdirSync(workflows_DIR, { recursive: true });

    fs.writeFileSync(releasePath, github_actions.template);
    SUCCESS(`Generated github actions workflow`);
  } catch (e) {
    ERROR(`Failed to create github actions workflow: ${e}`);
  }
}

export async function INIT_CHANGELOG(BASE_DIR: string) {
  const changelogPath = path.join(BASE_DIR, "CHANGELOG.md");
  try {
    if (fs.existsSync(changelogPath)) return;
    fs.writeFileSync(changelogPath, "# CHANGELOG\n\n");
  } catch (e) {
    ERROR(e);
  }
}

// ! SWITCH
export async function SWITCH_CODE_OF_CONDUCT(
  CONFIG: CInterface,
  BASE_DIR: string,
  GITHUB_DIR: string,
) {
  try {
    const existingPath = detect_code_of_conduct(BASE_DIR);
    if (existingPath) {
      WARN(`CODE_OF_CONDUCT already exists`);
      const overwrite = await OVERWRITE("CODE_OF_CONDUCT.md");
      if (!overwrite) return;
    }
    const code_of_conduct = CODE_OF_CONDUCT(CONFIG);

    if (!fs.existsSync(GITHUB_DIR))
      fs.mkdirSync(GITHUB_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(GITHUB_DIR, "CODE_OF_CONDUCT.md"),
      (await code_of_conduct).template,
    );
    CONFIG.contact = (await code_of_conduct).res.contact;
    saveConfig(CONFIG);
    SUCCESS(`Generated contributor-covenant template`);
  } catch (e) {
    ERROR(`Failed to create CODE_OF_CONDUCT.md: ${e}`);
  }
}

export async function SWITCH_GITHUB_REPO(
  CONFIG: CInterface,
  folder: string,
  BASE_DIR: string,
) {
  let status = checkGithubStatus();

  // check gh cli package
  if (!has_package("gh")) {
    WARN("Github CLI (gh) not found");
    const install_github_cli = await INSTALL_GITHUB_CLI();
    if (install_github_cli) {
      const success = await installGithubCLI();
      if (!success) return;
    } else {
      WARN(`Please install it manually from https://cli.github.com`);
      return;
    }
  }
  // check gh auth status
  if (!status.loggedIn) {
    WARN("Not logged in to Github. Launching login ... ");
    child_process.execSync("gh auth login", { stdio: "inherit" });
  }

  status = checkGithubStatus();
  if (!status.user) {
    ERROR("Github username not found");
    return;
  }
  CONFIG.github_username = status.user;
  saveConfig(CONFIG);

  // create github repository
  const repoName = folder;
  const username = status.user;

  try {
    child_process.execSync(`gh repo view ${username}/${repoName}`, {
      stdio: "ignore",
      cwd: BASE_DIR,
    });
    INFO(`Repository ${username}/${repoName} already exists on Github`);
    // if it exists but isnt linked, we just link it later
  } catch (e) {
    try {
      const github_repo_visibility = await GITHUB_REPO_VISIBILITY(CONFIG);
      CONFIG.github_repo_visibility = github_repo_visibility;
      saveConfig(CONFIG);

      const repo_args = [
        "repo",
        "create",
        `${username}/${repoName}`,
        `--${github_repo_visibility}`,
      ];
      child_process.spawnSync("gh", repo_args, {
        stdio: ["ignore", "inherit", "inherit"],
        cwd: BASE_DIR,
        shell: true,
      });
      SUCCESS("Created github repository");
    } catch (e) {
      ERROR(`Failed to create github repository: ${e}`);
    }
  }

  try {
    const github_remote_protocol = await GITHUB_REMOTE_PROTOCOL(CONFIG);
    CONFIG.github_remote_protocol = github_remote_protocol;
    saveConfig(CONFIG);

    const remoteUrl =
      github_remote_protocol === "https"
        ? `https://github.com/${username}/${repoName}.git`
        : `git@github.com:${username}/${repoName}.git`;

    try {
      const existingRemote = child_process
        .execSync("git remote get-url origin", {
          cwd: BASE_DIR,
          stdio: "pipe",
        })
        .toString()
        .trim();
      WARN(`Remote "origin" already exists: ${existingRemote}`);
      const overwrite = await OVERWRITE(existingRemote);
      if (!overwrite) return;
      child_process.execSync(`git remote set-url origin ${remoteUrl}`, {
        cwd: BASE_DIR,
        stdio: "inherit",
      });
    } catch (e) {
      child_process.execSync(`git remote add origin ${remoteUrl}`, {
        cwd: BASE_DIR,
        stdio: "inherit",
      });
    }
    SUCCESS("Linked to github repository");
  } catch (e) {
    ERROR(`Failed to link to github repository: ${e}`);
  }
}

export async function SWITCH_GITIGNORE(CONFIG: CInterface, BASE_DIR: string) {
  const gitignore = await GITIGNORE(CONFIG);
  const gitignorePath = path.join(BASE_DIR, ".gitignore");
  try {
    fs.appendFileSync(gitignorePath, "\n" + gitignore.template);
    CONFIG.gitignore = gitignore.res.gitignore_type;
    saveConfig(CONFIG);
    SUCCESS(`Generated gitignore`);
  } catch (e) {
    ERROR(`Failed to add gitignore: ${e}`);
  }
}

export async function SWITCH_ISSUE(ISSUE_DIR: string) {
  try {
    const issue = ISSUE();
    if (!fs.existsSync(ISSUE_DIR)) fs.mkdirSync(ISSUE_DIR, { recursive: true });

    const templates: { name: string; content: string; key: IType }[] = [
      {
        name: "bug-report.yml",
        content: issue.template.bug,
        key: "bug-report",
      },
      {
        name: "feature-request.yml",
        content: issue.template.feature,
        key: "feature-request",
      },
      { name: "config.yml", content: issue.template.config, key: "config" },
    ];

    for (const { name, content, key } of templates) {
      const filePath = path.join(ISSUE_DIR, name);

      if (fs.existsSync(filePath)) {
        WARN(`${key} already exists as an issue template`);
        const overwrite = await OVERWRITE(name);
        if (!overwrite) continue;
      }

      fs.writeFileSync(filePath, content);
    }
    SUCCESS(`Generated issue templates`);
  } catch (e) {
    ERROR(`Failed to create issue templates: ${e}`);
  }
}

export async function SWITCH_LICENSE(CONFIG: CInterface, BASE_DIR: string) {
  const licensePath = path.join(BASE_DIR, "LICENSE.md");
  try {
    if (fs.existsSync(licensePath)) {
      WARN("LICENSE already exists");
      const overwrite = await OVERWRITE("LICENSE");
      if (!overwrite) return;
    }
    const license = await LICENSE(CONFIG);
    fs.writeFileSync(licensePath, license.template);
    CONFIG.license = license.res.license_type;
    CONFIG.author_name = license.res.author_name;
    saveConfig(CONFIG);
    SUCCESS(`Generated LICENSE`);
  } catch (e) {
    ERROR(`Failed to create LICENSE: ${e}`);
  }
}

export async function SWITCH_PULL_REQUEST(GITHUB_DIR: string) {
  const pull_request = PULL_REQUEST();
  const pullRequestPath = path.join(GITHUB_DIR, "PULL_REQUEST_TEMPLATE.md");
  try {
    if (fs.existsSync(pullRequestPath)) {
      WARN("PULL_REQUEST_TEMPLATE already exists");
      const overwrite = await OVERWRITE("PULL_REQUEST_TEMPLATE");
      if (!overwrite) return;
    }
    fs.writeFileSync(
      path.join(GITHUB_DIR, "PULL_REQUEST_TEMPLATE.md"),
      pull_request.template,
    );
    SUCCESS(`Generated pull request template`);
  } catch (e) {
    ERROR(`Failed to creaate pull request template: ${e}`);
  }
}

export async function SWITCH_COMMIT(CONFIG: CInterface) {
  let commitArgs: string[] = [];
  let commitMessage = "";
  try {
    const data = await COMMIT(CONFIG);
    const type = data.res.commit_type;
    const message = data.res.commit_message;
    const breaking = data.res.is_breaking;
    CONFIG.commit_type = type;
    CONFIG.commit_message = message;
    CONFIG.is_breaking = breaking;
    saveConfig(CONFIG);

    if (breaking) {
      commitArgs = ["commit", "-m", `${type}!: ${message}`];
      commitMessage = `git commit -m "${type}!: ${message}"`;
    } else {
      commitArgs = ["commit", "-m", `${type}: ${message}`];
      commitMessage = `git commit -m "${type}: ${message}"`;
    }

    child_process.spawnSync("git", commitArgs, { stdio: "inherit" });
    SUCCESS(commitMessage);
  } catch (e) {
    return ERROR(e);
  }
}

// ! VIEW
export async function VIEW_LICENSE(CONFIG: CInterface) {
  const license = await LICENSE(CONFIG);
  try {
    console.log(license.template);
    SUCCESS();
  } catch (e) {
    ERROR(e);
  }
}

export async function VIEW_GITIGNORE(CONFIG: CInterface) {
  const gitignore = await GITIGNORE(CONFIG);
  try {
    console.log(gitignore.template);
    SUCCESS();
  } catch (e) {
    ERROR(e);
  }
}

export async function VIEW_PULL_REQUEST() {
  const pull_request = await PULL_REQUEST();
  try {
    console.log(pull_request.template);
    SUCCESS();
  } catch (e) {
    ERROR(e);
  }
}

export function VIEW_ISSUE() {
  const issue = ISSUE();
  try {
    console.log(issue.template.feature);
    console.log("");
    console.log(issue.template.bug);
    console.log("");
    console.log(issue.template.config);
    SUCCESS();
  } catch (e) {
    ERROR(e);
  }
}

export async function VIEW_CODE_OF_CONDUCT(CONFIG: CInterface) {
  const code_of_conduct = await CODE_OF_CONDUCT(CONFIG);
  try {
    console.log(code_of_conduct.template);
    SUCCESS();
  } catch (e) {
    ERROR(e);
  }
}

export async function VIEW_GITHUB_ACTIONS() {
  const github_actions = GITHUB_ACTIONS();
  try {
    console.log(github_actions.template);
    SUCCESS();
  } catch (e) {
    ERROR(e);
  }
}

export async function VIEW_HUSKY_HOOKS() {
  const signature = "# aureus-setup-anchor";
  const commitMsgHook = `#!/bin/sh\n\n${signature}\nnpx aureus verify -- $1\n`;
  const prePushHook = `#!/bin/sh\n\n${signature}\nif [ "$AUREUS_INTERNAL_PUSH" = "true" ]; then\n  exit 0\nfi\nnpx aureus bump --remote $1\n`;

  try {
    console.log("commit-msg hook:");
    console.log(commitMsgHook);
    console.log("");
    console.log("pre-push hook:");
    console.log(prePushHook);
    SUCCESS();
  } catch (e) {
    ERROR(e);
  }
}

// ! VERIFY
export function VERIFY(file: any) {
  const commitMsgFile = file || process.argv[process.argv.length - 1];
  if (!commitMsgFile || !fs.existsSync(commitMsgFile)) {
    ERROR("Commit message file not found");
    process.exit(1);
  }

  const msg = fs.readFileSync(commitMsgFile, "utf-8").trim();
  const types = commit_types;
  const regex = new RegExp(`^(${types.join("|")})(\\(.+\\))?!?: .+$`);

  if (!regex.test(msg)) {
    ERROR(`Invalid commit message format: "${msg}"`);
    WARN(
      `Format must follow Conventional Commits: one of [${types.join(", ")}]`,
    );
    process.exit(1);
  }
  SUCCESS("Commit message verified");
}

// ! BUMP
export async function BUMP(options: any) {
  if (process.env.AUREUS_INTERNAL_PUSH === "true") {
    process.exit(0);
  }

  if (!isBranchClean()) {
    WARN("No new commits since last tag. Bump aborted.");
    process.exit(0);
  }

  const commits = getCommitHistory();
  const bumpType = getBumpType(commits);
  const username = getUsername();
  const repoName = getRepoName();

  if (bumpType === "none") {
    WARN("No feature or fix commits found. Skipping version bump");
  } else {
    const newVersion = bumpVersion(bumpType);

    const changelog = await CHANGELOG();
    const changelogContent = generateChangelog(
      newVersion!,
      commits,
      username!,
      repoName!,
      changelog.template,
    );

    if (options.dryRun) {
      console.log(`Next version would be: ${bumpType}`);
      console.log("");
      console.log(changelogContent);
      return;
    }

    const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
    fs.writeFileSync(changelogPath, changelogContent);

    // git operations
    child_process.execSync(`git add package.json CHANGELOG.md`, {
      stdio: "inherit",
    });
    child_process.execSync(
      `git commit -m "chore: bump to v${newVersion} from aureus"`,
      {
        stdio: "inherit",
      },
    );
    child_process.execSync(
      `git tag -a v${newVersion} -m "release ${newVersion}"`,
      {
        stdio: "inherit",
      },
    );

    SUCCESS(`Successfully bumped to version ${newVersion}`);

    // push changes and tags
    const remote = options.remote || "origin";
    const branch = child_process
      .execSync("git rev-parse --abbrev-ref HEAD")
      .toString()
      .trim();
    if (branch === "HEAD") {
      ERROR(
        "You are in a detached HEAD state. Please checkout a branch before pushing.\nBump commit and tag were created locally.\nRun manually: git push --follow-tags " +
          remote +
          " HEAD",
      );
      process.exit(1);
    }
    try {
      child_process.execSync(`git push --follow-tags ${remote} ${branch}`, {
        stdio: "inherit",
        env: { ...process.env, AUREUS_INTERNAL_PUSH: "true" },
      });
    } catch (e: any) {
      const detail = e.stderr?.toString().trim();
      ERROR(
        `Bump commit and tag created locally but push failed.${detail ? `\n${detail}` : ""}\nRun manually: git push --follow-tags ${remote} HEAD`,
      );
      process.exit(1);
    }
  }
}
