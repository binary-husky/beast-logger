# pip install beast-logger>=0.0.15
from beast_logger import *
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