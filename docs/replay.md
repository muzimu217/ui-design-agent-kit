# 重放协议（Replay Package）

重放包把一次历史 UI 产出固定成可检查的输入、证据、源码 revision 和重建
命令。它证明“这份记录仍然指向同一组文件”，不把旧截图冒充成当前浏览器
验证，也不自动替用户通过确认门。

## 文件结构

每个可重放样本在自己的工作区放置 `replay.json`：

```json
{
  "schemaVersion": 1,
  "scenarioId": "reference-first-adaptation",
  "sourceRevision": "40-character-git-commit-sha",
  "workspace": "demo/blog-demo",
  "commands": [
    {
      "id": "build",
      "cwd": "demo/blog-demo",
      "argv": ["npm", "run", "build"]
    }
  ],
  "inputs": [{"path": "demo/blog-demo/src/App.tsx", "sha256": "..."}],
  "evidence": [{"path": "demo/blog-demo/evidence/desktop-1440.png", "sha256": "..."}]
}
```

`inputs` 是需求、契约、源码和依赖锁定文件；`evidence` 是截图、测试报告和
验收记录。路径必须是仓库相对路径，不能指向仓库之外。每个文件的 SHA-256
由工具生成，不手抄。`sourceRevision` 必须是本地 Git 中存在的 commit；它
保留历史锚点，但不假装当前工作树没有未提交改动。

## 命令

```bash
npm run replay -- --check demo/blog-demo/replay.json
npm run replay -- --snapshot demo/blog-demo/replay.json
npm run replay -- --run demo/blog-demo/replay.json --step build --execute
```

`--check` 只读检查 manifest、场景 id、Git revision、路径存在性和所有哈希，
不执行命令。`--snapshot` 是显式写操作，只更新 manifest 中已有文件的哈希，
不会更新源码 revision 或增加文件。`--run` 默认拒绝执行；只有同时给出
`--execute` 才会按 `argv` 数组运行指定步骤，避免把 manifest 中的字符串当成
shell 脚本。执行后仍需重新 `--check`，并单独做浏览器截图与交互验证。

## 证据边界

- 构建通过证明可编译和可打包，不证明视觉、键盘或响应式行为。
- 历史截图证明当时的证据，不证明当前浏览器状态；当前重放必须重新取证。
- 重放工具不会自动修改 `SKILL.md`、锁文件、门账本或用户选中的素材。
- 评测分数必须通过 `npm run eval -- --record ...` 写入，并附真实证据路径；
  没有执行的场景只进入下一轮建议，不得自动记分。
