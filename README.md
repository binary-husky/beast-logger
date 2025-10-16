# Beast Logger

**Beast Logger** is a simple but advanced logging module for Python data structures and tensors. It is built for, but not limited to, tracing the progress of all kind of Machine Learning (ML) algorithms, such as SFT, RLHF and GRPO.

**Beast Logger** renders all kinds of data (lists, dictionaries, list of dictionaries, dictionary of dictionaries, llm token array, etc) as rich, compact widgets in your terminal and web-based log interfaces. Additionally, it enables users to extract customizable text from each log entry, thereby enhancing reproducibility and simplifying debugging processes.

**Beast Logger** is optimized for English, Chinese and many other languages for best reading experience.

## Demo
<div align="center">
    <img width="500" alt="image" align="center"  src="https://github.com/user-attachments/assets/d62b65c1-b076-4b0e-9962-896f889bd046" />
</div>

## Installation

Just run `pip install beast-logger` to install both beast-logger and its web viewer.

<details>
<summary>1. Install from PyPI</summary>

```bash
pip install beast-logger -i https://pypi.org/simple
```
</details>
<details>
<summary>2. Install from Aliyun PyPI Mirror</summary>

```bash
pip install beast-logger -i https://mirrors.aliyun.com/pypi/simple/
```
</details>
<details>
<summary>3. Install from source (click to expand)</summary>

```bash
rm -rf build dist web_display_dist
rm -rf web_display/build web_display/dist
rm -rf beast_logger.egg-info best_logger.egg-info

# Build web assets
cd web_display
nvm install 16
nvm use 16
npm install
npm run build:all
cd ..

# Build wheel
mkdir -p web_display_dist
mv web_display/build web_display_dist/build_pub
python setup.py sdist bdist_wheel

# Install wheel
pip install dist/dist/beast_logger-{VERSION}-py3-none-any.whl
```

</details>

## Write Logs: A Basic Example

- Import and configure logging

    ```python
    from beast_logger import register_logger, print_dict
    register_logger(mods=["demo"])
    print_dict({
        "a": 1,
        "b": 2,
        "c": 3,
    }, mod="demo")
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

## Read Logs: The Usage of the Web Log Viewer

Browse your logs in a local web app and copy structured entries with one click.

1) Start the viewer (skip npm install if already built): `beast_logger_go`
2) Open in browser: `http://localhost:8181`
3) In the web UI, select your log directory (absolute path, created by `register_logger`).

<div align="center">
    <img width="500" alt="image" src="https://github.com/user-attachments/assets/5fa151d9-26e2-48ef-9565-ced714eb1617" />
</div>


## API Overview

1. `print_list(list_like, ...)`
    Log a Python list as a table.

2. `print_dict(dict_like, ...)`
    Log a flat dictionary as a two-column table.
    ```python
    print_dict(
        { 'a': 1, 'b': 2, 'c': 3 },
        mod="abc"
    )
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

3. `print_listofdict(list_of_dicts, ...)`
    Log a list of dictionaries as a row-wise table.
    ```python
    print_listofdict([
        { 'a': 1, 'b': 2, 'c': 3 },
        { 'a': 4, 'b': 5, 'c': 6 },
    ], narrow=True)

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

4. `print_dictofdict(dict_of_dicts, ...)`
    Log a nested dictionary (outer keys as rows, inner keys as columns).
    ```python
    # === log nested dictionaries as a table ===
    print_dictofdict(
        {
            'sample-1': {
                'a': 1,
                'b': 2,
                'c': 3,
            },
            'sample-2': {
                'a': 4,
                'b': 5,
                'c': 6,
            }
        },
        header="this is a header",
        mod="",
        attach="create a copy button in web log viewer, when clicked, copy this message into clipboard"
    )
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

6. `print_tensor(t, ...)`
  Logs shape, dtype, device, and a small preview.

7. `print_tensor_dict({name: tensor, ...}, ...)`
  Logs a dictionary of tensors; handles bad entries gracefully.

Note: Requires torch installed if you use these functions.

## Token Logger

Log and view complex llm token arrays.
<div align="center">
    <img width="500" alt="image" align="center"  src="https://github.com/user-attachments/assets/26dcf109-236c-4b41-95bd-98d9b68434dc" />
</div>


```python
# pip install beast-logger>=0.0.15
from best_logger import *
# Define a log path named 'abc'
register_logger(mods=["abc"], base_log_path="./logs")
# Collect items into a dictionary
nested_items = {}
for i in range(5):
    # [ alpha.foo.bar.beta.0 ] These are dot-separated selectors; the web UI will automatically create checkboxes from these keys
    # [ alpha.foo.bar.beta.0 ] is a row in the main table
    nested_items[f"alpha.foo.bar.beta.{i}"] = NestedJsonItem(
        # Add any attributes here. Here we define item_id, reward, foo, bar, which become columns in the main table
        item_id=f"uuid",
        reward=0,
        foo='foo',
        step=24,
        bar='bar',
        # Define token-level details
        content=SeqItem(
            text=[f"text-1", f"text-2", f"text-3"], # Paragraphs are automatically split when encountering <|im_end|> or blank-line separators
            title=[f"hover", f"mouse", f"to see"],
            count=["1", "2", "3"],
            color=["red", "green", "blue"]
        )
    )
# Save to the path
print_nested(
    nested_items,
    main_content="Main content",
    header="Data entry title",
    mod="abc",
    narrow=True,
    attach="Click the button in the top-right to copy the attach field to the clipboard"
)
```

## License

This project is distributed under a permissive open-source license. See the repository for details.

<!--
Maintainers: Build & Publish

# Clean
rm -rf build dist web_display_dist web_display/build web_display/dist beast_logger.egg-info best_logger.egg-info

# Build web assets
cd web_display
nvm install 16
nvm use 16
npm install
npm run build:all
cd ..

# Package
mkdir -p web_display_dist
mv web_display/build web_display_dist/build_pub
python setup.py sdist bdist_wheel
# Upload (requires credentials)
# twine upload dist/*
-->
