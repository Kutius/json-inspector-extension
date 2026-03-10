# JSON Inspector

[English](./README.md)

一个基于 Manifest V3 的小型浏览器扩展，用于配合 [`visual-json`](https://github.com/vercel-labs/visual-json) 查看原始 JSON 文档。

它会将纯文本 JSON 页面替换为结构化视图，保留原始 URL，并在需要时提供简洁的原文查看模式。这个项目主要面向个人或内部使用，不以扩展商店发布为目标。

![截图](./assets/screenshot.png)

## 功能

- 以树形结构查看 JSON 文档
- 在树形视图与原文视图之间切换
- 直接复制页面中的原始 JSON 内容
- 支持远程 `.json` 链接；启用文件访问后也可用于本地文件
- 基于 `@visual-json/react` 与 `@visual-json/core` 构建

## 安装

### 以已解压扩展方式加载

1. 安装依赖：

```bash
bun install
```

2. 构建扩展：

```bash
bun run build
```

3. 打开浏览器扩展页面：

- Chrome：`chrome://extensions`
- Edge：`edge://extensions`

4. 开启开发者模式。

5. 选择“加载已解压的扩展程序”，并选中 [`dist`](/root/i/visual-json-browser-extension/dist) 目录。

### 本地文件访问

如果需要让扩展处理本地 `file://` JSON 文件，请在扩展详情页打开通常名为 `Allow access to file URLs` 的选项。

## 开发

```bash
bun install
bun run dev
```

`tsdown` 会将内容脚本输出到 `dist/`。代码更新后，在浏览器扩展页面重新加载该扩展即可。

## 项目结构

- [`src/content.tsx`](/root/i/visual-json-browser-extension/src/content.tsx)：内容脚本入口与视图挂载逻辑
- [`src/styles.css`](/root/i/visual-json-browser-extension/src/styles.css)：扩展界面样式
- [`manifest.json`](/root/i/visual-json-browser-extension/manifest.json)：Manifest V3 配置
- [`tsdown.config.ts`](/root/i/visual-json-browser-extension/tsdown.config.ts)：打包配置

## 说明

- 扩展只会在看起来像 JSON 的页面上生效。
- 当前使用方式以本地已解压加载为主。
- 不依赖后台服务，也不需要远程后端。

## 许可证

MIT
