from rich import _wrap
def words(text: str):
    """Yields each word from the text as a tuple
    containing (start_index, end_index, word). A "word" in this context may
    include the actual word and any whitespace to the right.
    """
    position = 0
    import jieba
    for word in jieba.cut(text):
        start = position
        end = position + len(word)
        position = end
        yield start, end, word

_wrap.words = words