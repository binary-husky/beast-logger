# first do a monkey patch, this must be import first
import best_logger.apply_monkey_patch
from best_logger.print_basic import *
from best_logger.print_tensor import *
from best_logger.register import register_logger, change_base_log_path