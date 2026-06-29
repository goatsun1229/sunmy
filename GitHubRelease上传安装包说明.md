# GitHub Release 上传安装包说明

## 为什么要用 Release

GitHub 网页上传普通文件有大小限制，安装包超过 25MB 时不能直接放进仓库目录。

安装包应该放到 GitHub Releases。Release 附件可以放大文件，也更适合对外下载。

## 操作步骤

1. 打开 GitHub 仓库。
2. 点右侧或顶部的 `Releases`。
3. 点 `Create a new release`。
4. `Tag version` 填：

```text
v1.0.0-beta.2
```

5. `Release title` 填：

```text
码伴 PixelPal 1.0.0 Beta 2
```

6. 把两个安装包改名为：

```text
PixelPal-macOS-Beta.9.zip
PixelPal-Windows-Beta.9.zip
```

7. 拖到 Release 的附件区域。
8. 点 `Publish release`。

## 下载页链接

下载页已经使用固定版本 Release 链接：

```text
https://github.com/goatsun1229/sunmy/releases/download/v1.0.0-beta.4/PixelPal-1.0.0-beta.4-macOS-Beta.zip
https://github.com/goatsun1229/sunmy/releases/download/v1.0.0-beta.4/PixelPal-1.0.0-beta.4-Windows-Beta.zip
```

只要 tag 是 `v1.0.0-beta.2`，并且 Release 附件名字完全一致，下载按钮就能用。
