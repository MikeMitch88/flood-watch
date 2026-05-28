import os
from dotenv import load_dotenv
import logging
import sys

# Configure basic logging for the test
logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')

# Ensure we're running from the backend directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

from app.services.early_warning_service import EarlyWarningService

if __name__ == "__main__":
    print("Testing Early Warning Service...")
    # Run the check synchronously for testing
    EarlyWarningService.run_check()
    print("Test finished.")
