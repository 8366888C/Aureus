import { GITIGNORE_TEMPLATES } from "../utils/templates.js";

const GILookup = new Map(
  GITIGNORE_TEMPLATES.map((item) => [item.name, item.value]),
);

export const GIChoices = GITIGNORE_TEMPLATES;

export function getGitignoreTemplate(name: string) {
  return GILookup.get(name) ?? "";
}
