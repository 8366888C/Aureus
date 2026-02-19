import { Command } from "commander";
import path from "node:path";
import fs from "node:fs";
import { ERROR, isEmail, SUCCESS } from "./utils.js";
import { getConfig, saveConfig } from "./utils.js";
import {
  CODE_OF_CONDUCT,
  COMMIT,
  GITIGNORE,
  ISSUE,
  LICENSE,
  PULL_REQUEST,
} from "./prompts.js";
import child_process from "node:child_process";

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
    console.log(`Initializing project in: ${folder}`);
  });

// ! SUB COMMANDS
const add = program
  .command("add")
  .description("Add specific repository standards");
const view = program.command("view").description("View specific templates");
const commit = program.command("commit").description("Commit tracked files");

// ! LICENSE
add
  .command("license")
  .description("Add a LICENSE file")
  .action(async () => {
    const data = LICENSE(CONFIG);
    saveConfig({
      user: { name: (await data).res.name.name },
    });
    try {
      fs.writeFileSync(
        path.join(process.cwd(), "LICENSE"),
        (await data).template,
      );
      SUCCESS(`generated ${(await data).res.license.license} /LICENSE`);
    } catch (e) {
      ERROR(e);
    }
  });

view
  .command("license")
  .description("View a LICENSE file")
  .action(async () => {
    const data = LICENSE(CONFIG);
    saveConfig({ user: { name: (await data).res.name.name } });
    try {
      console.log((await data).template);
      SUCCESS();
    } catch (e) {
      ERROR(e);
    }
  });

// ! gitignore
add
  .command("gitignore")
  .description("Add a template .gitignore file")
  .action(async () => {
    const data = GITIGNORE();
    try {
      fs.writeFileSync(
        path.join(process.cwd(), ".gitignore"),
        (await data).template,
      );
      SUCCESS(
        `generated ${(await data).res.gitignore.gitignore} /.gitignore file`,
      );
    } catch (e) {
      ERROR(e);
    }
  });

view
  .command("gitignore")
  .description("View a .gitignore file")
  .action(async () => {
    const data = GITIGNORE();
    try {
      console.log((await data).template);
      SUCCESS();
    } catch (e) {
      ERROR(e);
    }
  });

// ! pull-request
add
  .command("pull-request")
  .description("Add a pull_request template")
  .action(async () => {
    const data = PULL_REQUEST();
    try {
      if (!fs.existsSync(path.join(process.cwd(), "docs"))) {
        fs.mkdirSync(path.join(process.cwd(), "docs"), { recursive: true });
      }
      fs.writeFileSync(
        path.join(process.cwd(), "docs/PULL_REQUEST_TEMPLATE.md"),
        (await data).template,
      );
      SUCCESS(
        `generated ${(await data).res.pull_request.pull_request} template in docs/PULL_REQUEST_TEMPLATE.md`,
      );
    } catch (e) {
      ERROR(e);
    }
  });

view
  .command("pull-request")
  .description("View a pull_request template")
  .action(async () => {
    const data = PULL_REQUEST();
    try {
      console.log((await data).template);
      SUCCESS();
    } catch (e) {
      ERROR(e);
    }
  });

// ! issue
add
  .command("issue")
  .description("Add an issue_template")
  .action(async () => {
    const data = ISSUE(CONFIG);
    const DOCS_DIR = path.join(process.cwd(), "docs");
    const ISSUE_DIR = path.join(
      path.join(process.cwd(), "docs"),
      "ISSUE_TEMPLATE",
    );

    if (isEmail((await data).res.url?.url)) {
      saveConfig({ user: { email: (await data).res.url?.url } });
    }
    saveConfig({
      user: {
        name: (await data).res.name?.name,
        website: (await data).res.url?.url,
        about: (await data).res.about?.about,
      },
    });
    try {
      if (!fs.existsSync(DOCS_DIR)) {
        fs.mkdirSync(DOCS_DIR, { recursive: true });
      }
      if (!fs.existsSync(ISSUE_DIR)) {
        fs.mkdirSync(ISSUE_DIR, { recursive: true });
      }
      (await data).template.map((template) =>
        fs.writeFileSync(
          path.join(
            process.cwd(),
            `docs/ISSUE_TEMPLATE/${template.option}.yml`,
          ),
          template.template,
        ),
      );
      SUCCESS("created docs/ISSUE_TEMPLATE/ files");
    } catch (e) {
      ERROR(e);
    }
  });

view
  .command("issue")
  .description("View an issue template")
  .action(async () => {
    const data = ISSUE(CONFIG);
    try {
      (await data).template.map((template) => {
        console.log(template.option.toUpperCase());
        console.log(template.template);
        console.log("");
      });
      SUCCESS();
    } catch (e) {
      ERROR(e);
    }
  });

// ! CODE OF CONDUCT
add
  .command("code-of-conduct")
  .description("Add code_of_conduct template")
  .action(async () => {
    const data = CODE_OF_CONDUCT();
    const DOCS_DIR = path.join(process.cwd(), "docs");
    try {
      if (!fs.existsSync(DOCS_DIR)) {
        fs.mkdirSync(DOCS_DIR, { recursive: true });
      }
      fs.writeFileSync(
        path.join(process.cwd(), "docs/CODE_OF_CONDUCT.md"),
        (await data).template,
      );
      SUCCESS("created docs/CODE_OF_CONDUCT.md");
    } catch (e) {
      ERROR(e);
    }
  });

view
  .command("code-of-conduct")
  .description("View code_of_conduct template")
  .action(async () => {
    const data = CODE_OF_CONDUCT();
    try {
      console.log((await data).template);
      SUCCESS();
    } catch (e) {
      ERROR(e);
    }
  });

// ! README
add
  .command("readme")
  .description("Generate a template README.md")
  .action(() => {
    console.log("Generating README...");
  });

view
  .command("readme")
  .description("Generate a template README.md")
  .action(() => {
    console.log("Generating README...");
  });

// ! COMMIT
commit.option("-m [string]", "commit message").action(async (options) => {
  let commitArgs: string[] = [];
  let commitMessage = "";
  if (options.m !== undefined) {
    const msg = typeof options.m === "string" ? options.m.trim() : "";
    if (msg.length > 0) {
      commitArgs = ["commit", "-m", msg];
      commitMessage = `git commit -m ${msg}`;
    } else {
      return ERROR("message flag -m cannot be empty");
    }
  } else {
    try {
      const data = await COMMIT();
      const type = data.res.type.type;
      const message = data.res.message.message;
      const breaking = data.res.breaking.breaking;
      if (breaking) {
        commitArgs = ["commit", "-m", `${type}!: ${message}`];
        commitMessage = `git commit -m ${type}!: ${message}`;
      } else {
        commitArgs = ["commit", "-m", `${type}: ${message}`];
        commitMessage = `git commit -m ${type}: ${message}`;
      }
    } catch (e) {
      return ERROR(e);
    }
  }
  const git = child_process.spawnSync("git", commitArgs, { stdio: "inherit" });
  SUCCESS(commitMessage);
});

// ! END
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);
