#!/bin/bash

# echo current dir
echo "Current directory: $(pwd)"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # 如果nvm存在则加载

nvm install 16
nvm use 16
npm install
npm run build:all && npm start
