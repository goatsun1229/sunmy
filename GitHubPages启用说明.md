# GitHub Pages 启用说明

## 目标

让 `download-page` 变成一个可以公开访问的下载页。

## 操作步骤

1. 打开 GitHub 仓库。
2. 点顶部 `Settings`。
3. 点左侧 `Pages`。
4. 找到 `Build and deployment`。
5. `Source` 选择 `GitHub Actions`。
6. 回到顶部 `Actions`。
7. 点左侧 `Deploy Download Page`。
8. 点 `Run workflow`。
9. 等它变成绿色成功。
10. 打开页面里显示的链接。

## 如果没看到 Deploy Download Page

确认仓库里有这个文件：

```text
.github/workflows/deploy-download-page.yml
```

如果没有，就说明这次上传没有覆盖成功。

## 如果下载按钮打不开

确认两个包已经放到：

```text
download-page/downloads/码伴-PixelPal-1.0.0-beta.1-macOS.zip
download-page/downloads/码伴-PixelPal-1.0.0-beta.1-Windows.zip
```

如果暂时还没放安装包，页面可以先发布，但下载按钮会打不开。
