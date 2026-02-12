from logger import setup_logger
from pathlib import Path
import subprocess
import json

log = setup_logger(__name__, "license.log")


class LICENSE:
    def __init__(self):
        self.base_dir = Path(__file__).resolve().parents[1]
        self.template_dir = self.base_dir / "src" / "templates"
        self.file_name = "license.json"
        self.template_names = []
        self.data = {}

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
        for name in self.template_names:
            log.info(f"Fetching: {name}")

            result = subprocess.run(
                ["gh", "repo", "license", "view", name],
                capture_output=True,
                text=True,
            )
            if result.returncode == 0:
                self.data[name] = result.stdout
            else:
                log.error(f"Error fetching {name}: {result.stderr}")

    def write_data(self):
        try:
            with open(self.template_dir / self.file_name, "w", encoding="utf-8") as f:
                json.dump(self.data, f, indent=2)
            log.info(f"File {self.file_name} has been created successfully")
        except subprocess.CalledProcessError as e:
            log.error(f"Error writing to {self.file_name} : {e}")


if __name__ == "__main__":
    templater = LICENSE()

    templater.get_keys()
    templater.get_values()
    templater.write_data()
