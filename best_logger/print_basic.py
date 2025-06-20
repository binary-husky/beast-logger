# first do a monkey patch, this must be import first
import best_logger.apply_monkey_patch
import rich, json, time
from loguru import logger
from io import StringIO
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from functools import partial
from best_logger.register import register_logger, LoggerConfig

def formatter_with_clip(record: dict) -> str:
    """
    Format a log record into a custom string format.

    Args:
        record (dict): A dictionary containing log record data.

    Returns:
        str: A formatted string for the log record.
    """
    max_len = 24
    record['function_x'] = record['function'].center(max_len)
    if len(record['function_x']) > max_len:
        record['function_x'] = ".." + record['function_x'][-(max_len-2):]
    record['line_x'] = str(record['line']).ljust(3)
    return '<green>{time:HH:mm}</green> | <cyan>{function_x}</cyan>:<cyan>{line_x}</cyan> | <level>{message}</level>\n'

def rich2text(rich_elem, narrow: bool = False) -> str:
    """
    Convert a rich element to plain text.

    Args:
        rich_elem: A rich element to be converted into plain text.
        narrow (bool): If True, limits the console width to 50; otherwise, 150.

    Returns:
        str: The plain text representation of the rich element.
    """
    output = StringIO()
    console = Console(record=True, file=output, width=150 if not narrow else 50)
    console.print(rich_elem)
    text = console.export_text()
    del console
    del output
    return "\n" + text

def print_list(arr: list, header: str = "", mod: str = "", narrow: bool = False, attach=None) -> None:
    """
    Print a list in a formatted way using rich and log it.

    Args:
        arr (list): The list to be printed.
        header (str): Title for the table.
        mod (str): Logger modifier.
        narrow (bool): If True, uses a narrow console width.
        attach: Additional data to attach with the log.

    Returns:
        None
    """
    d = {str(index): str(value) for index, value in enumerate(arr)}
    result = print_dict(d, header=header, mod=mod, narrow=narrow)
    return result

def _log_final_exe(mod=None, buf="", color=None, header=None, attach=None):
    if mod in ('console', 'c'):
        print(buf)
        return
    if LoggerConfig.handler_cnt > 0 and LoggerConfig.handler_cnt != len(logger._core.handlers):
        print("\n******************************\nWarning! Somewhere or someone has changed the logger handlers, restoring configuration...\n******************************\n")
        register_logger(**LoggerConfig.register_kwargs)
    if header is not None or color is not None:
        assert mod is not None
    if mod:
        logger.bind(**{mod: True}).opt(depth=2).info(buf)
        if mod+"_json" in LoggerConfig.registered_mods:
            logger.bind(**{mod+"_json": True}).opt(depth=2).info("\n" + json.dumps({
                "header": header,
                "color": color,
                "content": buf,
                "attach": attach,
            }, ensure_ascii=False))
            if LoggerConfig.register_kwargs["debug"] == True:
                if len(buf) > 10000: time.sleep(1)
                else: time.sleep(0.1)
    else:
        logger.opt(depth=2).info(buf)
    return buf


def print_dict(d: dict, header: str = "", mod: str = "", narrow: bool = False, attach=None) -> None:
    """
    Print a dictionary in a formatted way using rich and log it.

    Args:
        d (dict): The dictionary to be printed.
        header (str): Title for the table.
        mod (str): Logger modifier.
        narrow (bool): If True, uses a narrow console width.
        attach: Additional data to attach with the log.

    Returns:
        None
    """
    table = Table(show_header=False, show_lines=True, header_style="bold white", expand=True)
    for key, value in d.items():
        table.add_row(
            Text(str(key), style="bright_yellow", justify='full'),
            Text(str(value), style="bright_green", justify='full'),
        )
    panel = Panel(table, expand=True, title=header, border_style="bold white")
    result = rich2text(panel, narrow)
    _log_final_exe(mod, result, header=header, color="#4422cc", attach=attach)
    return result

def print_listofdict(arr, header="", mod="", narrow=False, attach=None) -> None:
    return print_dictofdict(
        {f"[{str(index)}]": dat for index, dat in enumerate(arr)}, header, mod, narrow
    )

def print_dictofdict(dod, header="", mod="", narrow=False, attach=None) -> None:
    row_keys = dod.keys()
    col_keys = {}
    for row in row_keys:
        for index, k in enumerate(dod[row].keys()):
            if k not in col_keys: col_keys[k] = 0
            col_keys[k] += index
    # sort col_keys according to size of col_keys[k]
    col_keys = sorted(col_keys, key=lambda k: col_keys[k])

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
    _log_final_exe(mod, result, header=header, attach=attach)
    return result

def sprintf_nested_structure(nested_structure, current_depth=0):
    from textwrap import indent
    buffer = ""
    if isinstance(nested_structure, dict):
        for key, value in nested_structure.items():
            buffer += f"[field '{str(key)}']"
            buffer += "\n"
            buffer += indent(sprintf_nested_structure(value, current_depth + 1), "  ")
            buffer += "\n"
    elif isinstance(nested_structure, list):
        if len(nested_structure) == 1:
            buffer += sprintf_nested_structure(nested_structure[0], current_depth)
            buffer += "\n"
        else:
            for index, item in enumerate(nested_structure):
                buffer += f"[{index+1}]."
                buffer += sprintf_nested_structure(item, current_depth)
    else:
        buffer += str(nested_structure)
    return buffer.strip('\n')
