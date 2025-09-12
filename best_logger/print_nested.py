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
from best_logger.print_basic import print_dict, print_dictofdict, rich2text, _log_final_exe, _log_final_exe_nested
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Union

class SeqItem(BaseModel):
    """
    {
        "text": text_arr,
        "count": count_arr,
        "color": color_arr,
    }
    """
    text: List[str] = Field([], description="List of text items")
    title: List[str] = Field([], description="List of title items")
    count: List[Union[str, int]] = Field([], description="List of counts corresponding to the text items")
    color: List[str] = Field([], description="List of colors corresponding to the text items")

class NestedJsonItem(BaseModel):
    content: Union[SeqItem, List[str]] = Field({}, description="Content of the data item, can be nested")
    model_config = ConfigDict(extra="allow")

def print_nested(
        nested_items: Dict[str, NestedJsonItem],
        main_content: str = "",
        header: str = "", mod: str = "",
        narrow: bool = False, attach: None = None
    ) -> None:
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
    nested_items = {k: v.model_dump() for k, v in nested_items.items()}
    color = "#337711"
    _log_final_exe_nested(nested_items, mod=mod, buf=main_content, color=color, header=header, attach=attach, compress=True)
    return