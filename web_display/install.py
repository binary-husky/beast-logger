# run ./start_web.sh with subprocess
import os
import subprocess
import sys
import time


def start_web_display(port=8181):
    # run ./start_web.sh with subprocess
    add_custom_env = {
        'REACT_APP_FPORT': str(port),
    }
    env = os.environ.copy()
    custom_env = {**env, **add_custom_env}
    subprocess.Popen(["bash ./start_web.sh"], env=custom_env, cwd=os.path.dirname(__file__), shell=True)
    while True:
        time.sleep(999)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 8181
    print(f"Starting web display on port {port}...")
    print(f"hint: you can use `python -m web_display.go {port}` to skip installation, if this is not the first time you run it.")
    start_web_display(port)

