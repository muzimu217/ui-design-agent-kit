# UI Design Agent Kit · 成果展厅

把 UI 设计工作流和各类可体验成果放在一起的独立展示站。

[快速开始](#快速开始) · [展示范围](#展示范围) · [数据与发布边界](#数据与发布边界)

![成果展厅真实桌面截图，展示工作流品牌与多类产品入口](screenshots/readme-desktop.webp)

> 展示站不是 AI 执行客户端。主角是工具包的工作流，积木、手机、博客等是独立案例；截图、可体验 demo 与完整验收是不同状态。[截图记录](../../docs/readme-media.md)

## 展示范围

- 查看六个工作流阶段及各自的产物和确认点。
- 按项目类型筛选成果，打开详情和截图。
- 在组合发布包中进入库存运营台、积木工坊、NODEGRID、地铁跑酷、FORMA One 和 Tempo。
- 查看两个历史截图案例：虚构手机「曜石 X1」和虚构博客「一舟札记」。
- 获取工具包的安装与使用入口，区分四种证据层级。

## 快速开始

推荐 Node.js 24。在仓库根目录运行：

```bash
cd showcase/products
npm ci --ignore-scripts
npm run dev -- --port 5187
```

打开终端显示的地址。单独启动展厅只提供展厅页面，不会自动启动或挂载各 demo。
需要完整试玩入口时按[组合构建记录](../../docs/product-showcase.md)安装对应子项目依赖，并在仓库根目录运行：

```bash
node showcase/scripts/build-pages.mjs --base /ui-design-agent-kit/
```

当前组装清单以 [PUBLIC_APPS](../scripts/build-pages.mjs) 为准。构建与部署分开，运行构建不会授权发布。

## 数据与发布边界

成果截图来自本地 demo，详见[媒体来源](media/SOURCES.md)。虚构品牌、商品、库存、文章与节点数据都不是业务实绩。展厅不替各 demo 保存个人数据；Tempo 和积木的本机数据由各项目独立处理。

发布包只应包含允许的静态构建文件与依赖许可，不应包含 Agent 私有指令、密钥或历史实验记录。仓库可见性、线上地址和当前部署状态必须单独核查，不以 README 或构建成功作证明。

## 验证与维护

在本项目目录：

```bash
npm run typecheck
npm run build
```

发布边界检查在仓库根目录执行：

```bash
node --test showcase/tests/*.test.mjs
```

它们不替代真实浏览器对筛选、弹窗、试玩返回、移动端和键盘的检查。[历史截图](screenshots/README.md)和[历史验收](../../docs/product-showcase.md)保留各自时间与范围。

## 反馈与许可

报告问题时说明项目名、进入路径、浏览器与重现步骤。项目源码未单独授予开源许可证；第三方依赖和素材参见[许可补充](../licenses/README.md)与[第三方声明](../../THIRD_PARTY_NOTICES.md)。
