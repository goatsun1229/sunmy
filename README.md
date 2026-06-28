# 码伴 PixelPal Cross-Platform

这是 Windows + macOS 正式跨平台版本的 Electron Beta。

当前版本：1.0.0-beta.1

当前目标：

- 让码伴 PixelPal 可以作为透明置顶桌宠运行。
- 支持输入指令、打开网站/应用、天气查询、提醒和 DeepSeek 问答。
- 支持首次启动设置、提醒管理和内测反馈模板复制。
- 支持贴边隐藏基础动作。
- 支持窗口位置记忆和自动贴边开关。
- 支持 macOS / Windows 平台专用图标。
- 支持 macOS / Windows 打包测试。

## 运行

```bash
npm install
npm run electron:local
```

## 打包

macOS Beta：

```bash
npm run pack:mac
```

Windows Beta：

```bash
npm run pack:win
```

## 自动打包

已经加入 GitHub Actions：

- `.github/workflows/build-beta.yml`

把这个项目上传到 GitHub 后，可以在 Actions 页面手动运行 `Build PixelPal Beta`，自动生成 macOS 和 Windows 测试包。

## 说明文档

- `朋友测试说明.md`：发给朋友测试时看这个。
- `正式发布清单.md`：商用前按这个查缺补漏。
- `BETA发布说明.md`：当前 Beta 包状态。
- `官网文案.md`：下载页和产品介绍文案。
- `隐私政策.md`：公开试用前的隐私政策草案。
- `用户协议.md`：公开试用前的用户协议草案。
- `更新日志.md`：版本变化记录。
- `1.0Beta发布检查清单.md`：公开试用前逐项确认。
- `1.0Beta发布说明.md`：发包时使用的说明。
- `反馈收集流程.md`：收集和整理用户反馈。
- `测试用户发送模板.md`：发给测试用户时可以直接复制。
- `发布包命名规则.md`：下载包改名和版本命名规则。
- `下载页发布说明.md`：公开试用下载页的使用方式。
- `download-page/index.html`：可直接发布的静态下载页。
