#


# web launcher


cd web_display
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
重启终端
nvm install 16
nvm use 16
npm install -g concurrently serve
npm install
npm run conbuild && npm run constart

http://localhost:13333/?path=/venv/third_party/best_logger/web_display/logs

http://localhost:13333/?path=/mnt/data_cpfs/fuqingxu/code_dev/auto_rfft_dev/logs
http://localhost:19999/api/logs/files?path=/mnt/data_cpfs/fuqingxu/code_dev/auto_rfft_dev/logs