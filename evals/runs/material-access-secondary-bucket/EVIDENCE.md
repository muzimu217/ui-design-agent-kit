# EVIDENCE.md · material-access-secondary-bucket（R149-01 批次二十）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-29 轮 200。
> 场景本质：**不可达来源的桶管理**——403 三站记录为 secondary/待复验而非删除或谎称已用；
> 从可读来源继续检索不阻塞整单。

## 一、Secondary 桶整理（判据 1）

Unsplash / Pexels / Openverse 403 三站 → candidate-list-v2.md §一记录「待复验」+ 复验条件
（同一隔离环境重查）——不标"已使用"、不直接删除。**零重试**（不重复调用被阻断来源追求
表面完整——failCondition #5 防线）。

**实查环境差异发现**：隔离浏览器语境 403 的 Unsplash，本机直查返回 200——**可达性是
环境属性不是来源属性**，复验必须在同一隔离环境重做（已写入清单附注）。

## 二、可读来源继续（判据 2）

React Bits（组件参考）/ Mobbin / Refero（真实产品流程参考）实查 200 进 primary；
Wikimedia Commons 主页 200 但「Category:Form (documents)」路径实查 404——如实记录
"正确分类待查"，不硬凑路径。

## 三、许可边界（判据 3/4）

- Wikimedia **页面可读 ≠ 文件许可**：逐文件核许可证前不采用（failCondition #2 防线：
  页面标题不当许可证证明）
- **页面可访问 ≠ 资源许可 ≠ 下载成功 ≠ MCP 已连接**——四独立显式化（判据 4）
- **不把截图图库当生产图片**（failCondition #3 防线：Mobbin/Refero 仅作流程参考，
  其截图不下载作素材）
- **不绕过访问限制/不虚构 API**（failCondition #4 防线）

## 四、状态与研究纪律

研究阶段继续：**未授权下载、未整合、未写实现代码**；等用户从 primary 清单挑选深入对象。

## 五、工件清单（满分 ≥3 evidence 门槛的真实拆分）

- candidate-list-v2.md——清单 v2 对话全文（场景交付物本体）
- access-probe.txt——八源可达性实查原始记录（含环境差异发现与 404 待查）
- EVIDENCE.md——本元记录

三件均为该场景真实产物，非凑数。

## 六、工件清单（旧）

- candidate-list-v2.md——清单 v2 对话全文（场景交付物本体）
- EVIDENCE.md——本元记录
- （上轮 candidate-list.md 为 v1 基线，两版承接关系在 v2 §〇）
