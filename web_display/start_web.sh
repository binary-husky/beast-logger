#!/bin/bash

# echo current dir
echo "Current directory: $(pwd)"
cp -r ./nvm ~/.nvm  # 移动nvm到用户目录下的.nvm文件夹

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # 如果nvm存在则加载

nvm install 16
nvm use 16
npm install
npm run build:all && npm start
