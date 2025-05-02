from loguru import logger
from functools import partial
import shutil

# custom_format = (
#     "{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | "
#     "\"{name}/{function}\", line {line} - {message}"
# )

def register_logger(mods=[], non_console_mods=[], base_log_path="logs", auto_clean_mods=[]):
    import os
    import sys

    def is_not_non_console_mod(record):
        extra_keys = list(record["extra"].keys())
        if not extra_keys:
            # 不在任何清单中
            return True
        if extra_keys[0].endswith("_json"):
            # json日志
            return False
        if extra_keys[0] not in non_console_mods:
            # 不在console静默清单中
            return True
        return False

    logger.remove()
    # logger.add(sys.stderr, format=formatter_with_clip, colorize=True, enqueue=True, filter=is_not_non_console_mod)
    logger.add(sys.stderr, colorize=True, enqueue=True, filter=is_not_non_console_mod)
    regular_log_path = os.path.join(base_log_path, "regular", "regular.log")
    logger.add(regular_log_path, rotation="50 MB", enqueue=True, filter=is_not_non_console_mod)
    for mod in (mods + non_console_mods):
        def debug(record, mod):
            return record["extra"].get(mod) == True
        # 检查是否在 auto_clean_mods 中，如果是，检查是否有旧日志，如果有，清理
        if mod in auto_clean_mods:
            # 检查是否有旧日志
            if os.path.exists(os.path.join(base_log_path, mod)):
                # 删除旧日志
                shutil.rmtree(os.path.join(base_log_path, mod))
        # 添加一个普通日志
        log_path = os.path.join(base_log_path, mod, f"{mod}.log")
        logger.add(log_path, rotation="50 MB", enqueue=True, filter=partial(debug, mod=mod))
        # 添加一个json日志
        json_log_path = os.path.join(base_log_path, mod, f"{mod}.json.log")
        logger.add(json_log_path, rotation="50 MB", enqueue=True, filter=partial(debug, mod=mod+"_json"))
    return
