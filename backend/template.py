import os
import logging
from pathlib import Path

# Ensure the log directory exists
log_dir = "logs"
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, "file_creation.log")


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] : [%(levelname)s] : [%(message)s]",
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)

list_of_files = [
    ".github/workflows/.gitkeep",
    "src/__init__.py",
    "src/helper.py",
    "src/prompt.py",
    ".env",
    "templates/index.html",
    "Experiments/experiment.ipynb",
    "app.py",
    "setup.py",
    "requirements.txt"
]

for filepath in list_of_files:
    filepath = Path(filepath)
    filedir, filename = os.path.split(filepath)

    if filedir != "":
        os.makedirs(filedir, exist_ok=True)
        logging.info(f"Directory created or already exists: {filedir}")

    if not os.path.exists(filepath) or os.path.getsize(filepath) == 0:
        with open(filepath, "w") as f:
            pass  # Create an empty file
        logging.info(f"File created: {filepath}")
    else:
        logging.info(f"File already exists and is not empty: {filepath}")
