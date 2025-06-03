from loguru import logger
from functools import partial
import shutil
import time
import atexit
import os

def singleton(cls):
    _instance = {}
    def _singleton(*args, **kwargs):
        if cls not in _instance:
            _instance[cls] = cls(*args, **kwargs)
        return _instance[cls]
    return _singleton


class LoggerConfig(object):
    registered_mods = []
    register_kwargs = {}
    handler_cnt = 0


def change_base_log_path(base_log_path):
    LoggerConfig.register_kwargs['auto_clean_mods'] = []
    LoggerConfig.register_kwargs['base_log_path'] = base_log_path
    register_logger(**LoggerConfig.register_kwargs)
    return

def install_lock_file():
    # 创建一个锁文件
    base_log_path = LoggerConfig.register_kwargs['base_log_path']
    if not os.path.exists(base_log_path):
        os.makedirs(base_log_path, exist_ok=True)
    lock_file_path = os.path.join(base_log_path, ".logger_lock")
    if os.path.exists(lock_file_path):
        with open(lock_file_path, "r") as f:
            pid = f.read().strip()
        if pid and int(pid) != os.getpid():
            # check whether this pid is running
            try:
                os.kill(int(pid), 0)
            except OSError:
                # 如果进程不存在，则删除锁文件
                os.remove(lock_file_path)
                print('removing outdated lock')
            else:
                # 如果进程存在，则抛出异常
                raise RuntimeError(f"Logger is already running with PID {pid}. Please use another directory for `base_log_path`.")
        if pid and int(pid) == os.getpid():
            print('updating logger running inside same process')
    with open(lock_file_path, "w+") as f:
        f.write(str(os.getpid()))
    return

def uninstall_lock_file():
    lock_file_path = os.path.join(LoggerConfig.register_kwargs['base_log_path'], ".logger_lock")
    if os.path.exists(lock_file_path):
        os.remove(lock_file_path)
    return

atexit.register(uninstall_lock_file)

def register_logger(mods=[], non_console_mods=[], base_log_path="logs", auto_clean_mods=[], debug=False):
    """ mods: 需要注册的模块名列表，同时向终端和文件输出
        non_console_mods: 需要注册的模块名列表，只向文件输出
        base_log_path: 日志文件存放的根目录
        auto_clean_mods: 需要自动删除旧日志的模块名列表
    """
    import sys

    registered_before = True if LoggerConfig.registered_mods else False
    LoggerConfig.register_kwargs['auto_clean_mods'] = []
    LoggerConfig.register_kwargs = {
        "mods": mods,
        "non_console_mods": non_console_mods,
        "base_log_path": base_log_path,
        "auto_clean_mods": auto_clean_mods,
        "debug": debug,
    }
    install_lock_file()
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

    best_logger_web_service_url = os.environ.get("BEST_LOGGER_WEB_SERVICE_URL", None)
    if not registered_before:
        logger.warning(f"\n********************************\n"
                    f"You can run following command to serve logs with web app:\n\tpython -m web_display.install\n"
                    f"(if nvm is not installed yet, run `wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash` first)"
                    f"\n********************************\n"
        )
    if best_logger_web_service_url:
        if not best_logger_web_service_url.startswith("http"):
            raise ValueError("BEST_LOGGER_WEB_SERVICE_URL must start with http or https")
        if not best_logger_web_service_url.endswith("/"):
            best_logger_web_service_url += "/"
        abs_path = os.path.abspath(base_log_path)
        logger.warning(
            f"\n********************************\n"
            f"Log will be served at:\n\t{best_logger_web_service_url}?path={abs_path}"
            f"\n********************************\n"
        )
        time.sleep(2)

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
        LoggerConfig.registered_mods += [mod]
        LoggerConfig.registered_mods += [mod+"_json"]
    LoggerConfig.handler_cnt = len(logger._core.handlers)
    return
