import { Command } from "commander";
import { prompt } from "enquirer";
import path from "node:path";
import fs from "node:fs";

const program = new Command();
program
  .name(process.env.NAME as string)
  .version(process.env.VERSION as string)
  .description(process.env.DESCRIPTION as string);

program.action(async () => {
  const response = await prompt<{ name: string; language: string }>([
    {
      type: "input",
      name: "name",
      message: "what is your name ?",
      initial: "world",
    },
    {
      type: "select",
      name: "language",
      message: "choose your preferred language",
      choices: ["english", "hindi", "japanese"],
    },
  ]);
  const { name, language } = response;

  let greeting = "";
  switch (language) {
    case "hindi":
      greeting = `namaste ${name}`;
    case "japanese":
      greeting = `konnichiwa ${name}`;
    default:
      greeting = `hello ${name}`;
  }

  const filePath = path.join(process.cwd(), "greetings.txt");
  fs.writeFileSync(filePath, greeting);
});

program.parse(process.argv);
