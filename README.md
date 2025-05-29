# Core features

Log data as tables, and then render them as entries in web log viewer with extremely simple functions !

```python
from best_logger import *

# === log nested dictionaries as table ===
print_dictofdict({
    'sample-1':{
        "a": 1,
        "b": 2,
        "c": 3,
    },
    'sample-2':{
        "a": 4,
        "b": 5,
        "c": 6,
    }
}, narrow=True, header="this is a header", mod="", attach="create a copy button in web log viewer, when clicked, copy this message into clipboard")

# ╭─────────────── this is a header ───────────────╮
# │ ┏━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━┳━━━━━━┳━━━━━━┓ │
# │ ┃                      ┃ a     ┃ b    ┃ c    ┃ │
# │ ┡━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━╇━━━━━━╇━━━━━━┩ │
# │ │ sample-1             │ 1     │ 2    │ 3    │ │
# │ ├──────────────────────┼───────┼──────┼──────┤ │
# │ │ sample-2             │ 4     │ 5    │ 6    │ │
# │ └──────────────────────┴───────┴──────┴──────┘ │
# ╰────────────────────────────────────────────────╯
```

![Image](https://github.com/user-attachments/assets/92d1a14b-3c64-4c61-8be8-9ea4bbff2422)



```python

# === log a list of dictionaries as table ===
print_listofdict(
    [{
        "a": 1,
        "b": 2,
        "c": 3,
    },
    {
        "a": 4,
        "b": 5,
        "c": 6,
    }], narrow=True)

# ╭────────────────────────────────────────────────╮
# │ ┏━━━━━━━━━━━┳━━━━━━━━━━┳━━━━━━━━━━┳━━━━━━━━━━┓ │
# │ ┃           ┃ a        ┃ b        ┃ c        ┃ │
# │ ┡━━━━━━━━━━━╇━━━━━━━━━━╇━━━━━━━━━━╇━━━━━━━━━━┩ │
# │ │ 0         │ 1        │ 2        │ 3        │ │
# │ ├───────────┼──────────┼──────────┼──────────┤ │
# │ │ 1         │ 4        │ 5        │ 6        │ │
# │ └───────────┴──────────┴──────────┴──────────┘ │
# ╰────────────────────────────────────────────────╯
```


```python

# === log dictionary as table ===
print_dict({
    "a": 1,
    "b": 2,
    "c": 3,
}, mod="abc")

# ╭────────────────────────────────────────────────╮
# │ ┌──────────────────────┬─────────────────────┐ │
# │ │ a                    │ 1                   │ │
# │ ├──────────────────────┼─────────────────────┤ │
# │ │ b                    │ 2                   │ │
# │ ├──────────────────────┼─────────────────────┤ │
# │ │ c                    │ 3                   │ │
# │ └──────────────────────┴─────────────────────┘ │
# ╰────────────────────────────────────────────────╯

```

# Quick Start

- install: `pip install beast-logger -i https://pypi.org/simple`

- import
    ```python
    from best_logger import *
    ```
- register file handler
    ```python
    def register_logger(mods=[], non_console_mods=[], base_log_path="logs", auto_clean_mods=[]):
        """ mods: 需要注册的模块名列表，同时向终端和文件输出
            non_console_mods: 需要注册的模块名列表，只向文件输出
            base_log_path: 日志文件存放的根目录
            auto_clean_mods: 需要自动删除旧日志的模块名列表
    """
    ```
- begin logging
    ```python
    from best_logger import *
    register_logger(mods=["abc"])
    print_dict({
        "a": 1,
        "b": 2,
        "c": 3,
    }, mod="abc")
    ```

- install nvm

    `wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash`

- launch web display on port 8181 (first time)

    `python -m web_display.install 8181`

- launch web display on port 8181 (skip npm install)

    `python -m web_display.go 8181`

- open in browser

    `http://localhost:8181`

![Image](https://github.com/user-attachments/assets/5fa151d9-26e2-48ef-9565-ced714eb1617)

- test program and enter log dir (absolute path) into web log viewer.
    ```python
    from best_logger import *
    register_logger(mods=["abc"])
    print_dict({
        "a": 1,
        "b": 2,
        "c": 3,
    }, mod="abc")
    ```


<!-- 
# Upload to PyPI

rm -rf build
rm -rf dist
python setup.py sdist bdist_wheel
twine upload dist/*
-->