from loguru import logger
logger.remove()

import jieba, sys
jieba.initialize()
logger.add(sys.stderr, colorize=True, enqueue=True)

from rich import _wrap
import jieba
def words(text: str):
    """Yields each word from the text as a tuple
    containing (start_index, end_index, word). A "word" in this context may
    include the actual word and any whitespace to the right.
    """
    position = 0
    for word in jieba.cut(text):
        start = position
        end = position + len(word)
        position = end
        yield start, end, word

_wrap.words = words
list(words("程序预热")) # 不要删除