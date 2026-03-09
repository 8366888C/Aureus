from logger import setup_logger
from pathlib import Path
import subprocess
import json

log = setup_logger(__name__, "license.log")


class LICENSE:
    def __init__(self):
        self.base_dir = Path(__file__).resolve().parents[1]
        self.template_dir = self.base_dir / "templates"
        self.file_name = "license.json"
        self.template_names: list[str] = []
        # we will build a list of dictionaries so that each record
        # contains the human-readable name, the key/tag, and the raw
        # template text as requested by the user.
        self.data: list[dict] = []

    def get_keys(self):
        try:
            result = subprocess.run(
                ["gh", "repo", "license", "list"],
                capture_output=True,
                text=True,
                check=True,
            )
            self.template_names = [
                line.split()[0] for line in result.stdout.splitlines() if line.strip()
            ]
            log.info(f"Found {len(self.template_names)} templates")
        except subprocess.CalledProcessError as e:
            log.error(f"Error getting list of license templates : {e}")

    def get_values(self):
        for tag in self.template_names:
            log.info(f"Fetching: {tag}")

            result = subprocess.run(
                ["gh", "repo", "license", "view", tag],
                capture_output=True,
                text=True,
            )
            if result.returncode == 0:
                # derive a display name from the first non‑empty line of
                # the returned license text.  This usually contains the
                # official name (e.g. "MIT License").
                lines = result.stdout.splitlines()
                display_name = ""
                for l in lines:
                    if l.strip():
                        display_name = l.strip()
                        break
                self.data.append(
                    {
                        "name": display_name,
                        "tag": tag,
                        "template": result.stdout,
                    }
                )
            else:
                log.error(f"Error fetching {tag}: {result.stderr}")

    def write_data(self):
        try:
            self.template_dir.mkdir(parents=True, exist_ok=True)
            with open(self.template_dir / self.file_name, "w", encoding="utf-8") as f:
                # dump the list of objects instead of a mapping
                json.dump(self.data, f, indent=2)
            log.info(f"File {self.file_name} has been created successfully")
        except subprocess.CalledProcessError as e:
            log.error(f"Error writing to {self.file_name} : {e}")


if __name__ == "__main__":
    templater = LICENSE()

    templater.get_keys()
    templater.get_values()
    templater.write_data()
