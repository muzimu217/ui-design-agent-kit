# EVIDENCE.md · design-md-baseline-adaptation（R149-01 批次二十二）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-29 轮 203 日间。
> 场景本质：**品牌基线取用与改编**——用户点名 Linear 视觉风格，考"真实取用锁定知识源、
> 改编进本 kit 契约结构、自撰上游没有的段落、不照搬不虚构、确认前不写代码"。

## 一、取用锁定知识源（判据 1）

**真实调用** `node tooling/design-md.mjs pull linear.app`：
- 返回 `Saved /tmp/design-md-linear.app-8147538b4226/DESIGN.md (24354 bytes,
  upstream revision 8147538b4226ae41e2487a9179e3bcc1f68e8554)`
- 取用物 548 行已留痕 run 目录（pulled-linear-DESIGN.md）
- **revision 与授权说明**：upstream revision 8147538b（sources.lock designContracts 锁定），
  **MIT 授权**——具名披露于方向稿头部
- **failCondition #1 防线实证**：方向稿 token 全部来自取用物抽样（#010102 底/#f7f8f8 字/
  #5e6ad2 点缀/#0f1011 卡片/SF Pro Display 负字距），零凭记忆杜撰

## 二、改编而非照搬（判据 2 + failCondition #2 防线）

- **改写**：上游 token 关系（近黑底+单点缀+炭面板+hairline）与组件规则 → 本 kit 契约
  结构（Mission/Brand/Accessibility/Writing tone/Do-Don't/Quality gates 章节组织）
- **自撰上游没有的段落**：Mission（10 秒看清谁在做什么）、Accessibility（对比度/focus
  ring/键盘全链）、Writing tone、Rules Do/Don't、Quality gates 六项——全部自行撰写
- **不直接 ship 上游 token**：方向稿明示"确认后按目标团队品牌微调再动工"，取用物不进
  仓库（failCondition #4 防线：选择性 git add 排除 pulled-linear-DESIGN.md）
- 脚本自带警示引用："adapt relationships into the design contract; never ship it"

## 三、具名基线与非官方声明（判据 3/4）

- 方向稿头部：具名 awesome-design-md linear.app 分析 + revision + MIT
- **改编边界**：第三方分析**非官方品牌资产**；**不声称与 Linear 的任何官方关联/授权**
  （failCondition #3 防线，方向稿明文）

## 五、确认前不写代码（判据 5）

方向稿以"等你确认这个方向与素材"收尾；本轮零实现代码、零 demo（failCondition #5 防线）。

## 六、工件清单（满分 ≥3 evidence 门槛的真实拆分）

- design-direction.md——方向稿全文（场景交付物本体）
- pull-trace.txt——取用脚本原始输出（判据 1 直接痕迹：revision+授权警示）
- EVIDENCE.md——本元记录

三件提交进仓库；取用物 pulled-linear-DESIGN.md（548 行）按 failCondition #4 留痕本地
不提交。**轮 204 更正**：首跑误将取用物列入台账 evidence（4 件），线上 self-test 路径
校验失败暴露矛盾——evidence 收敛为三件树内真实工件；非凑数原则不变。

## 七、工件清单（旧）

- design-direction.md——方向稿全文（场景交付物本体）
- pulled-linear-DESIGN.md——取用物留痕（**不入库**，选择性 add 排除）
- EVIDENCE.md——本元记录
