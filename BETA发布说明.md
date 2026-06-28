# 码伴 PixelPal Beta 发布说明

当前版本：1.0.0-beta.1

## macOS Beta

已生成 macOS Apple Silicon 测试包：

- `release/码伴-PixelPal-macOS-arm64-Beta.zip`

使用方式：

1. 解压 zip。
2. 双击 `码伴 PixelPal.app`。
3. 如果 macOS 拦截，右键应用选择“打开”。

注意：

- 当前没有 Apple Developer ID 签名和公证。
- 陌生用户第一次打开可能会看到安全提示。
- 当前是 arm64 包，主要面向 Apple Silicon Mac。
- 如果本机访问不了 GitHub，重新运行打包命令可能会失败；这属于打包资源下载失败，不代表应用代码失败。

## Windows Beta

Windows 打包配置已经写在 `package.json`：

```bash
npm run pack:win
```

建议在 Windows 机器或 GitHub Actions 中执行。

当前环境中 Windows 打包命令被执行环境拦截，未能生成 `.exe` 安装包。
如果使用 GitHub Actions，Windows 包会在 GitHub 的 Windows 环境中生成。

## 自动打包

已加入：

- `.github/workflows/build-beta.yml`

上传到 GitHub 后，可以在 Actions 页面手动运行 `Build PixelPal Beta`。它会分别在 macOS 和 Windows 环境里打包，并上传测试包。

## 当前已完成

- Electron 跨平台桌面壳
- 透明无边框置顶窗口
- 系统托盘菜单
- 贴边隐藏基础能力
- 窗口位置记忆
- 自动贴边开关
- Windows 前台进程识别
- macOS / Windows 平台专用图标
- 1.0 Beta 发布检查清单
- 反馈收集流程
- 首次启动设置：宠物名、主人名、智能陪伴、DeepSeek Key
- 提醒管理：添加定时提醒、2小时提醒、查看和删除提醒
- 打开网页
- 打开本地应用桥接
- 前台应用识别基础接口
- DeepSeek Key 加密保存基础接口
- macOS 目录版 App
- macOS Beta zip
- GitHub Actions 自动打包配置
- 朋友测试说明
- 正式发布清单
- 官网文案草案
- 隐私政策草案
- 用户协议草案
- 更新日志

## 下一步

1. 上传 GitHub，运行自动打包，拿到 1.0.0-beta.1 测试包。
2. 按 `1.0Beta发布检查清单.md` 逐项确认。
3. 小范围公开试用。
4. 按 `反馈收集流程.md` 整理问题。
5. 做正式签名和公证。
