# Agent 工作流与成果展示

本次用户明确要求将积木实验收录为仓库 demo，并搭建用于产品展示与宣发的 GitHub 配置。
用户随后明确强调：主打产品是 UI Design Agent Kit 智能体工作流，积木小工坊仅是其中一个成果案例。
展示首页必须先说明工作流，再组织不同类型的成果，而不是成为积木游戏的独立营销站。
这是生成产品默认放仓库外规则的一次明确例外；不改变其他项目的归属。

## 目录与发布边界

站点信息层级：工作流品牌与方法概览、成果项目库、单个案例详情、验证范围。
默认入口不再以积木游戏的玩法或进入游戏作为主 CTA；积木动画只服务于 3D 案例展示。

| 路径 | 作用 |
| --- | --- |
| demo/brick-workshop | 可玩源码、12 砖型、12 色、三个挑战、测试、锁文件 |
| demo/brick-workshop/screenshots | 五张精选真实运行截图，WebP，随源码保留 |
| showcase/products | 工作流品牌首页与多项目成果库，不覆盖旧 showcase 手表源码 |
| showcase/scripts/build-pages.mjs | 构建并组装两个明确允许的静态应用 |
| showcase/tests | 发布目录和路径检查，不依赖根应用运行时 |
| .github/workflows/product-pages.yml | GitHub Actions 检查与可控 Pages 部署 |
| test-artifacts/pages/site | 被忽略的、可重复生成的公开产物 |

根 `package.json` 不增加产品依赖、工作区或运行命令。原外部 `brick-workshop` 目录保留不动。
新展厅使用经过检查的真实成果截图。积木案例保留程序化自动搭建展示，并与自由试玩数据隔离。
库存运营台、曜石 X1 与一舟札记先作为历史截图案例呈现，明确不是本轮已部署的可玩应用。
既有验收记录中的未验证项和待确认状态不因收录展示站而自动改变。

公开产物只有展示页、积木 demo、编译后的 JS/CSS/媒体、构建清单和依赖许可证。
不上传仓库根目录、`.agents`、`.codex`、内部文档、原型拼板、node_modules 或 source map。
组装器拒绝未允许的文件类型、路径、软链与硬链；旧公开产物有标记后才能被替换，前一版可恢复。

## 本地构建

在各自子项目安装依赖，执行一次集成构建：

```sh
npm ci --ignore-scripts --prefix demo/brick-workshop
npm ci --ignore-scripts --prefix showcase/products
npm test --prefix demo/brick-workshop
node --test showcase/tests/*.test.mjs
node showcase/scripts/build-pages.mjs --base /ui-design-agent-kit/
```

主入口位于 `/ui-design-agent-kit/`，试玩位于
`/ui-design-agent-kit/demos/brick-workshop/`。没有自定义域名和后端依赖。
路径由构建参数决定；在其他仓库使用时换成对应仓库名，不改源码硬编码地址。

Vite 的 `build.license` 根据实际输出模块生成许可证清单，组装器合并两站清单。
只有 npm 包漏带文本时，才使用 `showcase/licenses/` 内有明确版本来源的补充文件。

## GitHub 配置

工作流使用固定提交的 GitHub 官方 Actions：checkout、setup-node、configure-pages、
upload-pages-artifact、deploy-pages。Node 24。PR 只构建和测试，不部署。

默认部署关闭。只有同时满足以下条件，main 推送或显式手动部署才会发布：

1. 账号与仓库满足 Pages 的资格，仓库 Settings > Pages 已选 GitHub Actions。
2. 仓库变量 `PAGES_DEPLOY_ENABLED` 为字符串 `true`。
3. 运行来自 main，且是 push，或 workflow_dispatch 中明确勾选 deploy。

部署任务才获得 `pages: write` 与 `id-token: write`；构建只有 `contents: read`。
使用 `github-pages` 环境；不设置个人访问令牌，不修改源码仓库可见性。

## 当前上线限制

本次实际只读核查：`muzimu217/ui-design-agent-kit` 是私有仓库，当前账号 plan 为 `free`，
默认分支 main，Pages 查询返回 404。按 [GitHub Pages 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)，
Free 的私有仓库不能直接启用 Pages。未尝试付费升级，也未把仓库改为公开。

可选后续路径需要用户明确决定：维持私有源码并使用具备 Pages 资格的计划；
或新建专用公开展示仓库，只推送已审核的静态产物。不要为了演示站公开整个 Agent 私有仓库。

此文件和工作流存在，不代表 GitHub Actions 已运行、Pages 已启用或网站已上线。
本轮未执行仓库可见性修改、升级套餐、创建新公开仓库、推送或远程部署。

## 本轮验证

- 工作流品牌为首页主角：首屏有四类成果，主行动是“浏览成果 / 查看工作流”，没有自动挂载积木 iframe。
- 六阶段工作流 Tab 与键盘 Home/方向键切换有效；项目类型筛选有效，四案例可恢复为全部。
- 三个历史案例只有真实截图，不提供虚假的试玩入口；积木案例打开后才挂载真实 3D 展示。
- 3D 展示的暂停、继续、重播、离屏暂停、手机和减少动效模式经过浏览器检查。
  减少动效的两张 canvas 截图像素一致；初始化 WebGL 不可用时有明确失败提示与重试。
- 案例弹窗和截图弹窗可关闭并恢复焦点；已修复按 Escape 同时关闭两层弹窗的问题，并重新检查。
- 独立只读复核确认了工作流主角和发布白名单边界，提出一项手机截图可检查性 P1。
  已为历史案例和积木截图加入原图入口：手机实际打开 1280x800 原图，积木原图返回 HTTP 200，
  控件高度 44px，嵌套 Escape 仍正确。复核者对这一项给出 resolved，不扩写为未测项目也通过。
- 从案例进入 `/ui-design-agent-kit/demos/brick-workshop/`，实际放置一块、保存并返回展厅通过；只读展示没有改写存档。
- 1440x900、390x844、320x740、1920x1080 布局检查未见页面级横向溢出；手机及宽屏首屏保留工作流下一节。
- 组合站点编译通过，发布文件白名单检查通过；25 个编译/媒体文件约 2.12 MB，不包含 Agent 指令、配置、内部文档或 source map。
- demo 125 项规则/状态测试通过；独立发布边界 8 项测试通过；当前 kit 26 项回归测试及静态 verify 通过。
- GitHub 工作流 YAML 已解析，5 个官方 action 均固定为实际查证的提交；部署须通过 main、显式变量和事件条件。

展示站源码位于 `showcase/products/`，源码和精选截图均在本地工作树中；未把尚未执行的远程提交说成已完成。
可打开本地组合预览：<http://127.0.0.1:4180/ui-design-agent-kit/>。
可部署压缩包为 `test-artifacts/pages/agent-workflow-showcase.tar.gz`（约 876 KB），
其中资源按 `/ui-design-agent-kit/` 路径构建；部署到域名根目录时应以 `--base /` 重新构建。

验收执行者：主代理负责导入、发布配置、边界测试、浏览器操作和截图；
`product_showroom` 子代理负责展示界面与只读演示模式，按当前工作流一次只运行一个子代理。
这里只记录已执行的检查；不声称所有历史案例、所有设备或所有无障碍场景均已验收。

已保留的展示站截图见 `showcase/products/screenshots/`，四案例宣发封面见
`showcase/products/media/workflow-cover.webp`。这些是实际页面与既有成果，不是概念效果图。
