from loguru import logger
logger.remove()

# import jieba, sys
import sys
# jieba.initialize()
logger.add(sys.stderr, colorize=True, enqueue=True)

from rich import _wrap
# import jieba
# def words(text: str):
#     """Yields each word from the text as a tuple
#     containing (start_index, end_index, word). A "word" in this context may
#     include the actual word and any whitespace to the right.
#     """
#     position = 0
#     for word in jieba.cut(text):
#         start = position
#         end = position + len(word)
#         position = end
#         yield start, end, word

import re

def words(text: str):
    """
    Use regex as a light alternative to jieba for tokenization:
    - Chinese characters: treat each character as a token
    - English/numeric: group consecutive letters and digits into one token
    - Punctuation, spaces, and everything else: keep as separate pieces and optionally merge left
    """
    # Regex guide:
    # [\u4e00-\u9fa5] : match a single Chinese character
    # [a-zA-Z0-9]+    : match a run of ASCII letters or digits
    # \S              : match any non-whitespace character (captures remaining symbols)
    # .               : match any character (including spaces)
    # Using finditer keeps match objects with original positions

    # Rule: match one Chinese char OR a run of English/digits OR one non-whitespace char OR one whitespace
    pattern = re.compile(r'([\u4e00-\u9fa5]|[a-zA-Z0-9]+|\s|\S)')

    # Keep the smallest unit so right-side spaces can be attached if desired
    # Adjust logic if you prefer to glue spaces to preceding English tokens
    for match in pattern.finditer(text):
        word = match.group()
        start = match.start()
        end = match.end()
        yield start, end, word

# Advanced version: handles hyphens and folds right-side spaces into the left token
def words_with_overlap(text: str):
    """
    - English tokens stop at the first non-alnum
    - Chinese text is split per character
    - start_index and end_index align with the original text
    """
    # Core token: (Chinese char) or (alnum run) or (single other char)
    # Use \s* to greedily capture trailing spaces with the token
    pattern = re.compile(r'([\u4e00-\u9fa5]|[a-zA-Z0-9]+|[^a-zA-Z0-9\u4e00-\u9fa5])\s*')

    for match in pattern.finditer(text):
        yield match.start(), match.end(), match.group()

# # Test helper
# if __name__ == "__main__":
#     test_text = "Hello-world! 我正在编写 Python 代码。"
#     print(f"Original text: '{test_text}'")
#     for start, end, word in words_with_overlap(test_text):
#         print(f"({start}, {end}): '{word}'")


_wrap.words = words
list(words("程序预热")) # Do not remove