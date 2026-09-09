# 发布记录：库存运营台 v2.3（2026-09-07，产品化收口轮）

> 本轮由 agent 全流程安排：增量设计 → 实现 → **生产构建 → 构建产物上全量
> 回归** → 打包产物。此前所有验证均在 dev 模式；本次首次在 minified 构建
> 产物上闭环验证。状态：自动轮·待用户验收（门E）。

## 一、版本内容（v2.2 → v2.3）

- **新增：URL 状态同步**——`q/cat/status/sort` 进查询参数，加载恢复、
  变更 `replaceState` 无痕同步、「清空筛选」全清。分享链接即分享视图。
- 回归基线：v2.2 全部 7 项修复（焦点归还/document 级 Esc/移动端滚动锁/
  hover token 化等）。

## 二、产物清单

| 产物 | 位置 | 说明 |
| --- | --- | --- |
| 构建产物 | `app/dist/`（index.html 0.76kB + CSS 10.2kB + JS 201.9kB，gzip 63.8kB） | `base=./` 可移植（任意子路径/file 均可部署） |
| 发布包 | `release/ops-dashboard-v2.3-dist.zip`（66kB） | 解压即静态部署，无需 Node |
| 证据 | `evidence/v23-build-*.png` ×5 | 构建+preview 上的实测截图 |
| 本报告 | `RELEASE.md` | 验证矩阵 + 复现命令 |

重建命令（dist/zip 可重建，不入库）：

```bash
showcase/node_modules/.bin/vite build evals/runs/operations-not-marketing/app --base=./
cd evals/runs/operations-not-marketing/app/dist && zip -qr ../../release/ops-dashboard-v2.3-dist.zip .
showcase/node_modules/.bin/vite preview evals/runs/operations-not-marketing/app --port 5173
```

## 三、验证矩阵（全部在构建产物 + preview 上实测）

| # | 项 | 期望 | 实测 | 证据 |
| --- | --- | --- | --- | --- |
| R1 | URL 状态恢复 | `?status=缺货&sort=desc` → 2 行、分段激活缺货 | ✅ | v23-build-urlstate.png |
| R2 | 搜索 + URL 同步 | 「周转箱」→ 2 行、URL 含 q+sort | ✅ | v23-build-search.png |
| R3 | 判据3 + D1/D3 回归 | 单元格开面板→焦点关闭钮；焦点移搜索框后 Esc 仍关；焦点回落搜索框 | ✅ | 断言 |
| R4 | 演示操作 toast | 「演示环境：『发起调拨』未接通真实库存」 | ✅ | 断言 |
| R5 | 空态 + 清空筛选 | 空态可见；清空→URL 归零→12 行 | ✅ | 断言 |
| R6 | 移动端 + D4 回归 | 390 卡片布局；底部门开时背景锁定 | ✅ | v23-build-mobile.png |
| R7 | 暗色 + D5 回归 | hover #2f57d6（变亮，token） | ✅ rgb(47,87,214) | v23-build-dark.png |
| R8 | 对比度（**产物 CSS**） | 22/22 ≥4.5:1 | ✅ | `npm run contrast -- --css dist/assets/*.css` |
| R9 | console | 0 错误 0 警告 | ✅（0 条消息） | console log |
| R10 | 判据4 演示标识 | 横幅+徽标+前缀+面板提示 | ✅ | v23-build-dashboard.png |

## 四、本轮过程收获（工具链被产物实测反哺）

对出货 CSS 实测抓到 contrast-check 两个自身缺陷并修复：minified media
query 无空格（`(prefers-color-scheme:dark)`）匹配不到暗色块；`rgba()`
被压缩为 8 位 hex（`#f790091a`）解析不了。修复后源码与产物双双 22/22
——**量出货值才会暴露的问题，dev 模式永远测不到**。

## 五、诚实局限

- 演示数据 12 条，无真实 API/持久化（页内已明示）。
- zip/dist 为可重建产物，未入 git（仓库约定）；发布以源码 + 本报告为准。
- gzip 63.8kB 单 JS 含 React 运行时；未做代码分割（12 行数据表无路由，
  无分割必要）。
- 待用户裁决项不变（见 docs/archive/sprint-2026-09-06.md 第四节）。
