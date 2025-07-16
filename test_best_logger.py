from best_logger import *

register_logger(mods=["abc"])
# logger.info = lambda x: print_dict({"content": x}, header="info Log", mod="abc")
# logger.warning = lambda x: print_dict({"content": x}, header="warning Log", mod="abc")
# logger.debug = lambda x: print_dict({"content": x}, header="debug Log", mod="abc")
# logger.success = lambda x: print_dict({"content": x}, header="success Log", mod="abc")
# logger.error = lambda x: print_dict({"content": x}, header="error Log", mod="abc")

logger.info("This is an info log message.")
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
}, narrow=True, header="this is a header", mod="abc", attach="create a copy button in web log viewer, when clicked, copy this message into clipboard")

# 输出
# ╭────────────────────────────────────────────────╮
# │ ┌──────────────────────┬─────────────────────┐ │
# │ │ a                    │ 1                   │ │
# │ ├──────────────────────┼─────────────────────┤ │
# │ │ b                    │ 2                   │ │
# │ ├──────────────────────┼─────────────────────┤ │
# │ │ c                    │ 3                   │ │
# │ └──────────────────────┴─────────────────────┘ │
# ╰────────────────────────────────────────────────╯

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
}, narrow=True)
# 输出
# ╭────────────────────────────────────────────────╮
# │ ┏━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━┳━━━━━━┳━━━━━━┓ │
# │ ┃                      ┃ a     ┃ b    ┃ c    ┃ │
# │ ┡━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━╇━━━━━━╇━━━━━━┩ │
# │ │ sample-1             │ 1     │ 2    │ 3    │ │
# │ ├──────────────────────┼───────┼──────┼──────┤ │
# │ │ sample-2             │ 4     │ 5    │ 6    │ │
# │ └──────────────────────┴───────┴──────┴──────┘ │
# ╰────────────────────────────────────────────────╯



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

# 输出
# ╭────────────────────────────────────────────────╮
# │ ┏━━━━━━━━━━━┳━━━━━━━━━━┳━━━━━━━━━━┳━━━━━━━━━━┓ │
# │ ┃           ┃ a        ┃ b        ┃ c        ┃ │
# │ ┡━━━━━━━━━━━╇━━━━━━━━━━╇━━━━━━━━━━╇━━━━━━━━━━┩ │
# │ │ 0         │ 1        │ 2        │ 3        │ │
# │ ├───────────┼──────────┼──────────┼──────────┤ │
# │ │ 1         │ 4        │ 5        │ 6        │ │
# │ └───────────┴──────────┴──────────┴──────────┘ │
# ╰────────────────────────────────────────────────╯