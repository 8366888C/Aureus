import Enquirer from "enquirer";
const { prompt } = Enquirer;
import LICENSE_TEMPLATES from "../templates/license.json" with { type: "json" };
import GITIGNORE_TEMPLATES from "../templates/gitignore.json" with { type: "json" };
import { currentYear, imprintLicense } from "./utils.js";
import { CType, GIType, LType } from "./types.js";

// ! LICENSE

export async function LICENSE(CONFIG: CType) {
  const input = await prompt<{ name: string; license: LType }>([
    {
      type: "input",
      name: "name",
      message: "Author name",
      initial: CONFIG?.user?.name || "undefined",
    },
    {
      type: "autocomplete",
      name: "license",
      message: "Choose a LICENSE template",
      choices: Object.keys(LICENSE_TEMPLATES),
    },
  ]);
  const template = imprintLicense(
    LICENSE_TEMPLATES[input.license],
    input.name,
    currentYear,
  );

  return { template: template, input: input };
}

export async function GITIGNORE(CONFIG: CType) {
  const input = await prompt<{ gitignore: GIType }>([
    {
      type: "autocomplete",
      name: "gitignore",
      message: "Choose a .gitignore template",
      choices: Object.keys(GITIGNORE_TEMPLATES),
    },
  ]);
  const template = GITIGNORE_TEMPLATES[input.gitignore];
  return { template: template, input: input };
}
