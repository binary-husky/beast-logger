# first do a monkey patch, this must be import first
import beast_logger.apply_monkey_patch
from beast_logger.print_basic import *
from beast_logger.print_tensor import *
from beast_logger.register import register_logger, change_base_log_path
from beast_logger.print_nested import print_nested, SeqItem, NestedJsonItem