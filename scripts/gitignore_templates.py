from logger import setup_logger
import subprocess

log = setup_logger(__name__, "logs/gitignore_templates.log")


def get_gitignore_templates():
    try:
        result = subprocess.run(
            ["gh", "repo", "gitignore", "list"],
            capture_output=True,
            text=True,
            check=True,
        )
        template_names = [
            line.strip() for line in result.stdout.split("\n") if line.strip()
        ]

        log.info(f"Found {len(template_names)} templates. Starting download...")

        with open("scripts/gitignore_templates.ts", "w", encoding="utf-8") as f:
            f.write("export const GI = {\n")

            for name in template_names:
                log.info(f"fetching: {name}")

                # Fetch the content of the specific template
                content_result = subprocess.run(
                    ["gh", "repo", "gitignore", "view", name],
                    capture_output=True,
                    text=True,
                )

                if content_result.returncode == 0:
                    safe_content = (
                        content_result.stdout.replace("\\", "\\\\")
                        .replace("`", "\\`")
                        .replace("$", "\\$")
                    )

                    f.write(f'"{name}": `{safe_content}`,\n')
                else:
                    log.error(f"Error fetching {name}: {content_result.stderr}")

            f.write("};\n")

        log.info("\nSuccess! File 'gitignore-content.ts' has been created.")

    except subprocess.CalledProcessError as e:
        print(f"Error: Make sure GitHub CLI is installed and you are logged in. {e}")


if __name__ == "__main__":
    get_gitignore_templates()
