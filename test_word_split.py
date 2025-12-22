from beast_logger import *

register_logger(mods=["abc"])

logger.info("This is an info log message.")
print_dictofdict({
    'sample-1':{
        "a": """
作者：0x1B5E
链接：https://www.zhihu.com/question/531148965/answer/1985281127905256965
来源：知乎
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

微软工程师 Andres Freund 发现自己远程 SSH 登录时间比应有时间长了 500 毫秒，同时 SSH 占用大量 CPU 资源以及会出现 valgrind 错误。他不知道为什么会这样，所以他决定追查一下原因。“起初，我以为是 Debian 的软件包出了问题”，但在深度观察过程中，Andres Freund 发现，SSH 出于某种原因对 liblzma 压缩库进行了系统调用，而 liblzma 压缩库包含在他自己安装的 Debian sid 中的 xz（XZ Utils）工具中。此次本是 Debug 的尝试，结果 Andres Freund 意外看到，在安装过程中使用的 Debian 的 xz 工具压缩包中找到了后门代码，但这些代码并不在该库的原始 GitHub 源代码中。这些额外的包是一个被篡改的脚本，它会在 tarball 的配置设置结束时被执行。XZ Utils 是一个用于数据压缩和解压缩的开源工具集，它提供了命令行工具（如 xz、xzcat、xzdec），可以在大多数操作系统上进行压缩和解压缩操作，通常也能够提供比其他流行算法（如 ZIP 或 GZIP）更高的压缩比。在日常使用中，XZ Utils 会与 liblzma 一起使用，liblzma 库被用来执行实际的压缩和解压缩操作。其中，XZ Utils 的 5.6.0 和 5.6.1 版本中，都含有恶意代码。基于此，3 月 29 日，Andres Freund 发布了一则主题为《上游 xz/liblzma 中的后门导致 ssh 服务器被入侵》的邮件，详述了自己发现的具体问题与过程。

""",
        "b": 2,
        "c": 3,
    },
    'sample-2':{
        "a": 4,
        "b": 5,
        "c": 6,
    }
}, header="this is a header", mod="abc")
