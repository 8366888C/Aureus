// ! MISC
import pc from "picocolors";

export const currentYear = new Date().getFullYear().toString();
export const SUCCESS = () => console.log(pc.bgGreen(pc.black(" SUCCESS ")));
export const ERROR = (e: unknown) =>
  console.log(pc.bgRed(pc.white(" ERROR ")) + pc.red(` → ${e}`));

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
export function imprintLicense(
  template: string,
  name: string,
  year: string,
): string {
  return template
    .replace(/\[year\]|<year>|\[yyyy\]/gi, year)
    .replace(/\[fullname\]|<name of author>|\[name\]/gi, name);
}
