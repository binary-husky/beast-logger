from loguru import logger
from functools import partial
import shutil
global registered_mods, register_kwargs
registered_mods = []

# custom_format = (
#     "{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | "
#     "\"{name}/{function}\", line {line} - {message}"
# )

def change_base_log_path(base_log_path):
    global registered_mods, register_kwargs
    register_kwargs['base_log_path'] = base_log_path
    register_kwargs['auto_clean_mods'] = []
    register_logger(**register_kwargs)
    return

def register_logger(mods=[], non_console_mods=[], base_log_path="logs", auto_clean_mods=[]):
    """ mods: 需要注册的模块名列表，同时向终端和文件输出
        non_console_mods: 需要注册的模块名列表，只向文件输出
        base_log_path: 日志文件存放的根目录
        auto_clean_mods: 需要自动删除旧日志的模块名列表
    """
    import os
    import sys
    global registered_mods, register_kwargs
    registered_mods = []
    register_kwargs = {
        mods: mods,
        non_console_mods: non_console_mods,
        base_log_path: base_log_path,
        auto_clean_mods: auto_clean_mods,
    }
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
    logger.add(sys.stderr, colorize=True, enqueue=False, filter=is_not_non_console_mod)
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
        registered_mods += [mod]
        registered_mods += [mod+"_json"]
    return
