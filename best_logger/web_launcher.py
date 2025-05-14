#!/usr/bin/env python3
"""
CLI entry point for launching the best-logger web interface.
This script executes the start_web.sh shell script.
"""

import os
import subprocess
import sys


def main():
    """Execute the start_web.sh script to launch the web interface."""
    try:
        # Get the directory of the current package
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        start_web_script = os.path.join(current_dir, 'start_web.sh')

        # Make sure the script is executable
        os.chmod(start_web_script, 0o755)

        # Print starting message
        print(f"Starting best-logger web interface using {start_web_script}")
        print("The web server will continue running in the background.")

        # Execute the shell script without blocking
        process = subprocess.Popen(
            [start_web_script],
            cwd=current_dir,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,  # Line buffered
        )

        # Print the first few lines of output to show progress
        print("Server output:")
        for i, line in enumerate(process.stdout):
            print(line, end='')
            # # After showing some initial output, let the process run in background
            # if i >= 10 or "Server started" in line or "Compiled successfully" in line:
            #     print("\nServer is now running in the background.")
            #     break

        # Don't wait for the process to complete
        return

    except Exception as e:
        print(f"Error launching best-logger web interface: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
