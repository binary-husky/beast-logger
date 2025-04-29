# first do a monkey patch, this must be import first
import best_logger.apply_monkey_patch
from loguru import logger
from io import StringIO
import rich
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from functools import partial


custom_format = (
    "{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | "
    "\"{name}/{function}\", line {line} - {message}"
)

def formatter_with_clip(record):
    # Note this function returns the string to be formatted, not the actual message to be logged
    # record["extra"]["serialized"] = "555555"
    max_len = 24
    record['function_x'] = record['function'].center(max_len)
    if len(record['function_x']) > max_len:
        record['function_x'] = ".." + record['function_x'][-(max_len-2):]
    record['line_x'] = str(record['line']).ljust(3)
    return '<green>{time:HH:mm}</green> | <cyan>{function_x}</cyan>:<cyan>{line_x}</cyan> | <level>{message}</level>\n'

def register_logger(mods=[], non_console_mods=[]):
    import os
    import sys

    def is_not_non_console_mod(record):
        extra_keys = list(record["extra"].keys())
        if not extra_keys:
            # 不在任何清单中
            return True
        if extra_keys[0] not in non_console_mods:
            # 不在console静默清单中
            return True
        return False

    logger.remove()
    # logger.add(sys.stderr, format=formatter_with_clip, colorize=True, enqueue=True, filter=is_not_non_console_mod)
    logger.add(sys.stderr, colorize=True, enqueue=True, filter=is_not_non_console_mod)
    regular_log_path = os.path.join("logs", "regular", "regular.log")
    logger.add(regular_log_path, rotation="50 MB", enqueue=True, filter=is_not_non_console_mod)
    for mod in (mods + non_console_mods):
        def debug(record, mod):
            return record["extra"].get(mod) == True
        log_path = os.path.join("logs", mod, f"{mod}.log")
        logger.add(log_path, rotation="50 MB", enqueue=True, filter=partial(debug, mod=mod))
    return

def rich2text(rich_elem, narrow=False):
    output = StringIO()
    console = Console(record=True, file=output, width=150 if not narrow else 50)
    console.print(rich_elem)
    text = console.export_text()
    del console
    del output
    return "\n" + text

def print_list(arr, header="", mod="", narrow=False) -> None:
    d = {str(index): str(value) for index, value in enumerate(arr)}
    result = print_dict(d, header="", mod="", narrow=narrow)
    return result

def print_dict(d, header="", mod="", narrow=False) -> None:
    table = Table(show_header=False, show_lines=True, header_style="bold white", expand=True)
    for key, value in d.items():
        table.add_row(
            Text(key, style="bright_yellow", justify='full'),
            Text(str(value), style="bright_green", justify='full'),
        )
    panel = Panel(table, expand=True, title=header, border_style="bold white")
    result = rich2text(panel, narrow)
    if mod:
        logger.bind(**{mod: True}).opt(depth=1).info(result)
    else:
        logger.opt(depth=1).info(result)
    return result

def print_dictofdict(dod, header="", mod="", narrow=False) -> None:
    row_keys = dod.keys()
    col_keys = set()
    for row in row_keys:
        col_keys.update(dod[row].keys())
    col_keys = sorted(col_keys)
    headers =  [''] + col_keys
    table = Table(*[rich.table.Column(k) for k in headers], show_header=True, show_lines=True, header_style="bold white", expand=True)

    for key, d in dod.items():
        cols = []
        cols += [Text(key, style="bright_yellow", justify='full')]
        for col_key in col_keys:
            cols += [Text(str(d.get(col_key, '')), style="bright_green", justify='full')]
        table.add_row(*cols)
    panel = Panel(table, expand=True, title=header, border_style="bold white")
    result = rich2text(panel, narrow)
    if mod:
        logger.bind(**{mod: True}).opt(depth=1).info(result)
    else:
        logger.opt(depth=1).info(result)
    return result

def append_to_jsonl(json_dat):
    import json
    import os

    # Create the logs directory if it doesn't exist
    os.makedirs("logs/jsonl", exist_ok=True)

    # Create a timestamp for the filename
    filename = f"logs/jsonl/created.jsonl"

    # Append the JSON data to the file
    with open(filename, "a") as f:
        f.write(json.dumps(json_dat, ensure_ascii=False) + "\n")