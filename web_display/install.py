# run ./start_web.sh with subprocess
import os
import subprocess
import sys
import time
import webbrowser


def start_web_display():
    # run ./start_web.sh with subprocess
    subprocess.Popen(["bash ./start_web.sh"], cwd=os.path.dirname(__file__), shell=True)
    while True:
        time.sleep(999)

if __name__ == "__main__":
    start_web_display()

