
# 进入网页渲染子模块
cd web_display
# 安装nvm
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# 重启终端
重启终端
# 安装 16
nvm install 16
# 使用 16
nvm use 16
# 安装组件
npm install -g concurrently serve
npm install

# 测试程序

from best_logger import *
register_logger(mods=["abc"])
print_dict({
    "a": 1,
    "b": 2,
    "c": 3,
}, mod="abc")


# 运行网页渲染

可以使用以下任一方式运行网页渲染：

1. 使用 Python CLI 命令（安装后可用）：
```bash
best-logger-web
```

2. 直接运行 bash 脚本：
```bash
bash start_web.sh
```

3. 手动运行 npm 命令：
```bash
cd web_display
npm run build:all && npm start
```
