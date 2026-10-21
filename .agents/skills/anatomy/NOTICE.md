# NOTICE — anatomy（上游技能整包引入）

- 来源：`wheresryan22/anatomy`（<https://github.com/wheresryan22/anatomy>），MIT License
  （Copyright (c) 2026 Ryan，随包 `LICENSE` 原文保留）。
- 钉版 revision：`e9488296a44211c42701ff71705b7901470ec78f`（2026-10-16 拉取 main HEAD，
  逐条登记见 `tooling/sources.lock.json`）。
- 方式：**整包引入（非蒸馏）**——SKILL.md、kit/（SVG 引擎与 React 绑定）、scripts/（无头
  Chrome 校验工具）、examples/（八个示例的构建脚本与源码）、evals/ 原样保留；仅排除
  示例的**已构建 HTML 产物**（约 9.8MB，可经 `node examples/<name>/build.mjs` 重建）。
- 入 kit 适配：无（SKILL.md frontmatter 原样，与 kit 技能校验器兼容）。
- 安全审查记录（2026-10-16，用户指令"载入安装到对应位置"前置检查）：
  - 零运行时依赖（仓库无 package.json）；无 `eval`/`new Function`；无混淆代码；
  - 唯一网络调用 = `scripts/drive.mjs` 等无头校验脚本连接**本机 Chrome 调试端口
    `http://127.0.0.1:<port>`**（环回地址，用于截图与几何审计），无外部外发；
  - `child_process` 仅出现在 `scripts/*.test.mjs`（调用本机 node 执行自身校验脚本）；
  - 13224 stars、MIT、活跃维护（2026-10-16 当日仍有推送）。
