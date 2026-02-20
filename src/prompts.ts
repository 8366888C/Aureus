import pc from "picocolors";
import Enquirer from "enquirer";
const { prompt } = Enquirer;
import {
  autocomplete,
  confirm,
  imprintIssue,
  input,
  multiselect,
  theme,
} from "./utils.js";
import LICENSE_TEMPLATES from "../templates/license.json" with { type: "json" };
import GITIGNORE_TEMPLATES from "../templates/gitignore.json" with { type: "json" };
import PULL_REQUEST_TEMPLATES from "../templates/pull_request.json" with { type: "json" };
import ISSUE_TEMPLATES from "../templates/issue.json" with { type: "json" };
import CODE_OF_CONDUCT_TEMPLATES from "../templates/code_of_conduct.json" with { type: "json" };
import COMMIT_TEMPLATES from "../templates/commit.json" with { type: "json" };
import { currentYear, imprintCodeOfConduct, imprintLicense } from "./utils.js";
import {
  CCType,
  CInterface,
  CType,
  EType,
  GIType,
  IType,
  LType,
  PRType,
} from "./types.js";

// ! LICENSE
export async function LICENSE(CONFIG: CInterface) {
  const name = await input<{ name: string }>({
    name: "name",
    message: "Author name",
    initial: CONFIG?.user?.name || "undefined",
  });
  const license = await autocomplete<{ license: LType }>({
    name: "license",
    message: "Choose a LICENSE template",
    choices: Object.keys(LICENSE_TEMPLATES),
  });

  const template = imprintLicense(
    LICENSE_TEMPLATES[license.license],
    name.name,
    currentYear,
  );

  return { template: template, res: { name, license } };
}

// ! GITIGNORE
export async function GITIGNORE() {
  const gitignore = await autocomplete<{ gitignore: GIType }>({
    name: "gitignore",
    message: "Choose a .gitignore template",
    choices: Object.keys(GITIGNORE_TEMPLATES),
  });

  const template = GITIGNORE_TEMPLATES[gitignore.gitignore];
  return { template: template, res: { gitignore } };
}

// ! PULL REQUEST
export async function PULL_REQUEST() {
  const pull_request = await autocomplete<{ pull_request: PRType }>({
    name: "pull_request",
    message: "Choose a pull_request template",
    choices: Object.keys(PULL_REQUEST_TEMPLATES),
  });

  const template = PULL_REQUEST_TEMPLATES[pull_request.pull_request];
  return { template: template, res: { pull_request } };
}

// ! ISSUE
export async function ISSUE(CONFIG: CInterface) {
  const options = await multiselect<{ options: IType[] }>({
    name: "options",
    message: "Choose the type of templates you want",
    choices: Object.keys(ISSUE_TEMPLATES),
  });

  let templates: { option: IType; template: string }[] = options.options
    .filter((option) => option !== "config")
    .map((option) => {
      return {
        option: option,
        template: ISSUE_TEMPLATES[option],
      };
    });

  if (options.options.includes("config")) {
    const blank = await confirm<{ blank: boolean }>({
      name: "blank",
      message: "Enable blank issues?",
    });
    const name = await input<{ name: string }>({
      name: "name",
      message: "Name of the community or person to contact",
      initial: CONFIG.user.name,
    });
    const url = await input<{ url: string }>({
      name: "url",
      message: "Contact URL or email address",
      initial: CONFIG.user.email ?? CONFIG.user.website,
    });
    const about = await input<{ about: string }>({
      name: "about",
      message: "Brief description of this contact method",
      initial: CONFIG.user.about,
    });

    templates = [
      ...templates,
      { option: "config", template: ISSUE_TEMPLATES["config"] },
    ];

    const template = imprintIssue(CONFIG, templates, {
      blank,
      name,
      url,
      about,
    });
    return {
      template,
      res: { options, blank, name, url, about },
    };
  } else {
    const template = imprintIssue(CONFIG, templates);
    return {
      template,
      res: { options },
    };
  }
}

// ! CODE OF CONDUCT
export async function CODE_OF_CONDUCT() {
  const code_of_conduct = await autocomplete<{ code_of_conduct: CCType }>({
    name: "code_of_conduct",
    message: "Choose a code_of_conduct template",
    choices: Object.keys(CODE_OF_CONDUCT_TEMPLATES),
  });

  let template: string | undefined = "";

  switch (code_of_conduct.code_of_conduct) {
    case "contributor_covenant":
      const contact = await input<{ contact: string }>({
        name: "contact",
        message: "Contact method",
        initial: "how to contact you or your organization",
      });
      template = imprintCodeOfConduct({
        contributor_covenant: {
          template: CODE_OF_CONDUCT_TEMPLATES[code_of_conduct.code_of_conduct],
          contact: contact.contact,
        },
      });
      break;

    case "django":
      const name = await input<{ name: string }>({
        name: "name",
        message: "Community name",
        initial: "name of the community",
      });
      const governor = await input<{ governor: string }>({
        name: "governor",
        message: "Governing body",
        initial: "governing body",
      });
      const email = await input<{ email: EType }>({
        name: "email",
        message: "Email address",
        initial: "email address for contact",
      });
      const faq = await input<{ faq: string }>({
        name: "faq",
        message: "FAQ",
        initial: "link to your faq",
      });
      const guideline = await confirm<{ guideline: boolean }>({
        name: "guideline",
        message: "Do you have a link to reporting guidelines?",
      });

      if (guideline.guideline) {
        const guidelines = await input<{ guidelines: string }>({
          name: "guidelines",
          message: "Reporting Guidelines",
          initial:
            "link to guidelines for how reports of unacceptable behavior will be handled",
        });
        template = imprintCodeOfConduct({
          django: {
            template:
              CODE_OF_CONDUCT_TEMPLATES[code_of_conduct.code_of_conduct],
            name: name.name,
            governor: governor.governor,
            email: email.email,
            faq: faq.faq,
            guidelines: guidelines.guidelines,
          },
        });
      } else {
        template = imprintCodeOfConduct({
          django: {
            template:
              CODE_OF_CONDUCT_TEMPLATES[code_of_conduct.code_of_conduct],
            name: name.name,
            governor: governor.governor,
            email: email.email,
            faq: faq.faq,
          },
        });
      }
      break;
  }
  return { template: template || "", res: { code_of_conduct } };
}

// ! COMMIT
export async function COMMIT() {
  const type = await autocomplete<{ type: CType }>({
    name: "type",
    message: "Choose the type of commit",
    choices: Object.keys(COMMIT_TEMPLATES),
  });
  const message = await input<{ message: string }>({
    name: "message",
    message: "Type a commit message",
    initial: COMMIT_TEMPLATES[type.type],
  });
  const breaking = await confirm<{ breaking: boolean }>({
    name: "breaking",
    message: "is this a breaking change?",
  });

  return { res: { type, message, breaking } };
}
