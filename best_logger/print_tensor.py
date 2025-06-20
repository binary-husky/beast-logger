import rich, json, time
from rich.table import Table
from rich.text import Text
from rich.panel import Panel
from loguru import logger
from io import StringIO
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from functools import partial
from best_logger.register import register_logger, LoggerConfig
from best_logger.print_basic import print_dict, print_dictofdict, rich2text, _log_final_exe

PREVIEW_CONTENT_LIMIT = 500

def len_limit(content):
    content_limit = PREVIEW_CONTENT_LIMIT
    if len(content) > content_limit * 1.2:
        content = content[:content_limit//2] + "\n......\n" + content[-content_limit//2:]
    return content

def print_tensor(tensor: 'torch.Tensor', header: str = "", mod: str = "", narrow: bool = False, attach: None = None) -> None:
    """
    Prints the details of a tensor in a formatted manner using Rich. 

    Args:
        tensor (torch.Tensor): The tensor object to display.
        header (str): Additional information to display as a header.
        mod (str): A modifier tag for styling or customization in printing.
        narrow (bool): Whether the printed output is narrow or wide.
        attach (None): Unused parameter for future extensions or external usage.

    Returns:
        None: The printing action is performed as a side effect.
    """
    preview = len_limit(str(tensor))
    d = {
        'shape': str(tensor.shape),
        'dtype': str(tensor.dtype),
        'device': str(tensor.device),
        'preview': preview
    }
    result = print_dict(d, header=header, mod=mod, narrow=narrow)
    return result

def print_tensor_dict(tensor_dict: dict, header: str = "", mod: str = "", narrow: bool = False, attach: None = None) -> None:
    """
    Prints the details of tensors stored in a dictionary in a formatted manner using Rich.
    
    Args:
        tensor_dict (dict): Dictionary with tensor names as keys and tensor objects as values.
        header (str): Additional information to display as a header.
        mod (str): A modifier tag for styling or customization in printing.
        narrow (bool): Indicates if the printed output is narrow or wide.
        attach (None): Unused parameter for future extensions or external usage.

    Returns:
        None: The printing action is performed as a side effect.
    """
    dod = {}
    for tensor_name, tensor in tensor_dict.items():
        preview = len_limit(str(tensor))
        try:
            dod[tensor_name] = {
                'shape': str(tensor.shape),
                'dtype': str(tensor.dtype),
                'device': str(tensor.device),
                'preview': preview
            }
        except Exception:
            dod[tensor_name] = {
                'shape': 'N/A',
                'dtype': 'N/A',
                'device': 'N/A',
                'preview': preview
            }
    result = print_dictofdict(dod, header=header, mod=mod, narrow=narrow)
    return result
