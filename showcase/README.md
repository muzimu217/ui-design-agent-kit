# AURELIS M2

探索腕表材质、表盘模式与细节切换的早期交互概念。

[快速开始](#快速开始) · [交互范围](#交互范围) · [当前边界](#当前边界)

> 历史概念 demo，不是真实硬件。当前源码缺少样式文件，构建未通过。[截图状态记录](../docs/readme-media.md)说明了媒体缺口；当前 Agent 工作流展厅在 [products/](products/README.md)，二者不是同一个产品。

## 截图状态

暂无可核验的 AURELIS M2 运行截图。遗留 `dist/` 实际显示的是旧版 FLUX UI 页面，不能用作此腕表的产品图；本次未用生成图或另一项目截图填补缺口。

## 交互范围

- 点击表盘，在时间和专注显示之间切换。
- 切换 Ceramic white、Graphite black 和 Ultraviolet blue 三种外观。
- 浏览设计细节，观察状态切换和保存反馈。

## 快速开始

推荐 Node.js 24。在仓库根目录运行：

```bash
cd showcase
npm ci --ignore-scripts
npm run dev -- --port 5184
```

当前检出缺少 `src/main.tsx` 引用的 `src/styles.css`，上述开发方式需要先恢复原项目样式；本次未代为设计替代样式。恢复后打开终端显示的本机地址，端口被占用时换一个端口。

## 当前边界

表盘时间和专注分钟为静态示例，不是实际计时器。Save concept 只显示短暂反馈，不写入文件、本机存储或云端。腕表由 HTML/CSS 呈现，不是实体产品或真实 3D 模型。

历史页面的浏览器标题仍使用早期名称；本次只整理 README，没有迁移或改名应用。

## 验证与资料

```bash
npm run build
```

2026-09-08 实测此命令因 `UNRESOLVED_IMPORT: ./styles.css` 失败。它只运行 Vite，不包含独立类型检查或交互测试。本项目未配置 `npm test`。[设计记录](DESIGN.md)与[第三方声明](../THIRD_PARTY_NOTICES.md)保留在仓库。

反馈请附表盘模式、材质、浏览器及预期行为。未单独授予项目源码许可证；依赖遵循各自许可。
