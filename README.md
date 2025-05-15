# Quick Start

- import
    ```
    from best_logger import *
    ```
- register file handler
    ```
    def register_logger(mods=[], non_console_mods=[], base_log_path="logs", auto_clean_mods=[]):
        """ mods: 需要注册的模块名列表，同时向终端和文件输出
            non_console_mods: 需要注册的模块名列表，只向文件输出
            base_log_path: 日志文件存放的根目录
            auto_clean_mods: 需要自动删除旧日志的模块名列表
    """
    ```
- begin logging
    ```
    from best_logger import *
    register_logger(mods=["abc"])
    print_dict({
        "a": 1,
        "b": 2,
        "c": 3,
    }, mod="abc")
    ```

# 启动web display
- 进入网页渲染子模块
cd web_display
- 安装nvm
`wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash`
- 重启终端
重启终端
- 安装 16
nvm install 16
- 使用 16
nvm use 16
- 安装组件
npm install -g concurrently serve
npm install

- 测试程序
    ```python
    from best_logger import *
    register_logger(mods=["abc"])
    print_dict({
        "a": 1,
        "b": 2,
        "c": 3,
    }, mod="abc")
    ```

- 运行网页渲染

    ```bash
    bash start_web.sh
    ```

