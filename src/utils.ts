import pc from "picocolors";
import Enquirer from "enquirer";
const { prompt } = Enquirer;
import { CInterface, ThemeContext } from "./types.js";

// ! PROMPTS
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
    // hint: pc.cyan("[type to enter text]"),
    initial: initial,
    ...theme,
  } as any);
}

export async function autocomplete<TShape>({
  name,
  message,
  choices,
}: {
  name: string;
  message: string;
  choices: string[];
}) {
  return await prompt<TShape>({
    type: "autocomplete",
    name: name,
    message: message,
    hint: pc.cyan("[use arrows to move, type to filter]"),
    choices: choices,
    ...theme,
  } as any);
}

export async function confirm<TShape>({
  name,
  message,
}: {
  name: string;
  message: string;
}) {
  return await prompt<TShape>({
    type: "confirm",
    name: name,
    message: message,
    hint: pc.cyan("[press y or n for true or false respectively]"),
    ...theme,
  } as any);
}

export async function multiselect<TShape>({
  name,
  message,
  choices,
}: {
  name: string;
  message: string;
  choices: string[];
}) {
  return await prompt<TShape>({
    type: "multiselect",
    name: name,
    message: message,
    hint: pc.cyan("[use arrows to move, space to select"),
    choices: choices,
    ...theme,
  } as any);
}

// ! CUSTOM THEME
export const theme = {
  // prefix: (state: any) => (state.submitted ? pc.green("✓") : pc.magenta("?")),
  // styles: {
  //   em: (str: string) => str,
  // },
  // format(this: ThemeContext) {
  //   if (this.state.submitted) {
  //     return pc.green(this.value);
  //   }
  //   return this.value;
  // },
  // choiceMessage(this: ThemeContext, choice: any, index: number): string {
  //   return this.index === index ? pc.cyan(choice.message) : choice.message;
  // },
  // pointer(this: ThemeContext, _choice: any, index: number): string {
  //   return this.index === index ? pc.magenta(">") : " ";
  // },
};

// ? constants
export const currentYear = new Date().getFullYear().toString();
export const isEmail = (text?: string) =>
  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text ?? "");
// export const isWebsite = (text: string) =>
//   /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+/.test(text);

export const SUCCESS = (m?: string) =>
  m
    ? console.log(pc.bgGreen(pc.bold(" SUCCESS ")) + pc.green(` → ${m}`))
    : console.log(pc.bgGreen(pc.bold(" SUCCESS ")));
export const ERROR = (e: unknown) => {
  e
    ? console.log(pc.bgRed(pc.bold(" ERROR ")) + pc.red(` → ${e}`))
    : console.log(pc.bgRed(pc.bold(" ERROR ")));
};

// ! CONFIG
import fs from "fs";
import path from "path";
import os from "os";

const BASE_DIR = path.join(os.homedir(), ".aureus");
const CONFIG_PATH = path.join(BASE_DIR, "config.json");

function initCONFIG() {
  if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
  }
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({}, null, 2), "utf-8");
  }
}

export function getConfig() {
  initCONFIG();
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

export function saveConfig(data: object) {
  const current = getConfig();
  const updated = { ...current, ...data };
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

// ! ISSUE
export function imprintIssue(
  CONFIG: CInterface,
  templates: { option: string; template: string }[],
  {
    blank,
    name,
    url,
    about,
  }: {
    blank: { blank: boolean };
    name: { name: string };
    url: { url: string };
    about: { about: string };
  } = {
    blank: { blank: false },
    name: { name: "" },
    url: { url: "" },
    about: { about: "" },
  },
) {
  return templates.map((template) => ({
    option: template.option,
    template: template.template
      .replace(/\[bool\]/gi, blank.blank ? "true" : "false")
      .replace(/\[name\]/gi, name.name)
      .replace(/\[url\]/gi, url.url)
      .replace(/\[about\]/gi, about.about)
      .replace(/\[assignee\]/gi, CONFIG.user.github_username ?? ""),
  }));
}

// ! CODE OF CONDUCT
export function imprintCodeOfConduct(details: {
  contributor_covenant?: { template: string; contact: string };
  django?: {
    template: string;
    governor: string;
    email: string;
    faq: string;
    name: string;
    guidelines?: string;
  };
}) {
  if (details.contributor_covenant) {
    return details.contributor_covenant.template.replace(
      /\[contact\]/gi,
      details.contributor_covenant.contact,
    );
  } else if (details.django) {
    return details.django.template
      .replace(/\[name\]/gi, details.django.name)
      .replace(/\[governor\]/gi, details.django.governor)
      .replace(/\[email\]/gi, details.django.email)
      .replace(/\[faq\]/gi, details.django.faq)
      .replace(/\[guidelines\]/gi, details.django.guidelines ?? "below");
  }
}

// ! COMMIT
import COMMIT_TEMPLATES from "../templates/commit.json" with { type: "json" };
