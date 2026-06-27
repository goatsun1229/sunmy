#!/bin/zsh
set -e

cd "$(dirname "$0")"

export npm_config_cache="$PWD/.npm-cache"

echo "正在安装 Electron 运行时..."
node node_modules/electron/install.js
echo "Electron 运行时安装完成。"
