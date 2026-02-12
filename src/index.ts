import { Command } from "commander";
import path from "node:path";
import fs from "node:fs";
import { ERROR, SUCCESS } from "./utils.js";
import { getConfig, saveConfig } from "./utils.js";
import { GITIGNORE, LICENSE } from "./prompts.js";

const CONFIG = getConfig();

const program = new Command();
program
  .name(process.env.NAME as string)
  .description(process.env.DESCRIPTION as string)
  .version(process.env.VERSION as string, "-v, --version");

// ! main INIT command
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

// ! ADD subcommand group
const add = program
  .command("add")
  .description("Add specific repository standards");

add
  .command("license")
  .description("Add a LICENSE file")
  .action(async () => {
    const data = LICENSE(CONFIG);
    saveConfig({ user: { name: (await data).input.name } });
    try {
      fs.writeFileSync(
        path.join(process.cwd(), "LICENSE"),
        (await data).template,
      );
      SUCCESS();
    } catch (e) {
      ERROR(e);
    }
  });

add
  .command("gitignore")
  .description("Add a template .gitignore file")
  .action(async () => {
    const data = GITIGNORE(CONFIG);
    try {
      fs.writeFileSync(
        path.join(process.cwd(), ".gitignore"),
        (await data).template,
      );
      SUCCESS();
    } catch (e) {
      ERROR(e);
    }
  });

add
  .command("readme")
  .description("Generate a template README.md")
  .action(() => {
    console.log("Generating README...");
  });

// ! VIEW subcommand group
const view = program.command("view").description("View specific templates");

view
  .command("license")
  .description("View a LICENSE file")
  .action(async () => {
    const data = LICENSE(CONFIG);
    saveConfig({ user: { name: (await data).input.name } });
    console.log((await data).template);
  });

view
  .command("gitignore")
  .description("View a .gitignore file")
  .action(async () => {
    const data = GITIGNORE(CONFIG);
    console.log((await data).template);
  });

view
  .command("readme")
  .description("Generate a template README.md")
  .action(() => {
    console.log("Generating README...");
  });

// ! END
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);
