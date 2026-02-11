import { Command } from "commander";
import pc from "picocolors";
import Enquirer from "enquirer";
const { prompt } = Enquirer;
import path from "node:path";
import fs from "node:fs";
import { getGitignoreTemplate, GIChoices } from "./commands/gitignore.js";

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
    console.log(pc.green(`Initializing project in: ${folder}`));
  });

// ! ADD subcommand group
const add = program
  .command("add")
  .description("Add specific repository standards");

add
  .command("license")
  .description("Add a LICENSE file")
  .action(() => {});

add
  .command("gitignore")
  .description("Add a template .gitignore file")
  .action(async () => {
    const response = await prompt<{
      gitignore: string;
    }>({
      type: "autocomplete",
      name: "gitignore",
      message: "",
      choices: GIChoices,
    });

    try {
      const text = getGitignoreTemplate(response.gitignore);
      fs.writeFileSync(path.join(process.cwd(), ".txt"), text);
      console.log(
        `Successfully generated .gitignore for ${response.gitignore}`,
      );
    } catch (e) {
      console.error(`Cannot create .gitignore : ${e}`);
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
  .description("Add a LICENSE file")
  .action(() => {});

view
  .command("gitignore")
  .description("View a template .gitignore file")
  .action(async () => {
    const response = await prompt<{
      gitignore: { name: string; value: string };
    }>({
      type: "autocomplete",
      name: "gitignore",
      message: "",
      choices: GIChoices,
    });
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
