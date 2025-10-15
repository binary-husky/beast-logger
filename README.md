# Core features

Log data as tables, and then render them as entries in web log viewer with extremely simple functions !

![Image](https://github.com/user-attachments/assets/c1a39a30-445f-4e7e-a632-cdab23c70c5f)

## Additional Features

### `best_logger.print_basic`
- Format and log lists, dictionaries, nested dictionaries, and other structures using richly styled tables.
- Functions:
  - `print_list`: Log lists in a structured table format.
  - `print_dict`: Log flat dictionaries with keys and values.
  - `print_listofdict`: Log a list of dictionaries as rows in a table.
  - `print_dictofdict`: Log nested dictionaries as a table.
  - `sprintf_nested_structure`: View nested structures hierarchically in plain text.

### `best_logger.print_tensor`
- Specialized features for PyTorch tensors:
  - `print_tensor`: Log tensor attributes (shape, dtype, device) with a preview.
  - `print_tensor_dict`: Log a dictionary of tensors with detailed attributes (handles exceptions gracefully).
- Automatically limits preview content for long tensors.

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

    `python -m web_display.install 8181` or simply `beast_logger_install`

- launch web display on port 8181 (skip npm install)

    `python -m web_display.go 8181` or simply `beast_logger_go`

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
rm -rf web_display_dist
rm -rf dist
rm -rf web_display/build
rm -rf web_display/dist
rm -rf beast_logger.egg-info
rm -rf best_logger.egg-info

cd web_display
nvm install 16
nvm use 16
npm install
npm run build:all
cd ..

mkdir web_display_dist
mv web_display/build web_display_dist/build_pub

python setup.py sdist bdist_wheel
twine upload dist/*

pip install ssh://root@22.5.102.82/mnt/data_cpfs/fuqingxu/code_dev/BeyondAgent/third_party/best-logger/dist/beast_logger-0.0.12-py3-none-any.whl
pip install /mnt/data_cpfs/fuqingxu/code_dev/BeyondAgent/third_party/best-logger/dist/beast_logger-0.0.17-py3-none-any.whl

-->
