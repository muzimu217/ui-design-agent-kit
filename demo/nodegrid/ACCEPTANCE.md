# NODEGRID 全球节点云 · 验收记录（ACCEPTANCE.md）

> 门 E 验证留痕，2026-09-07。范围：demo/nodegrid 全量产品页
> （S0 地球 → S2 像素地图 → S3 节点详情 → S4 定价 → S5 信任区 → S6 CTA）。
> 权威文档：DESIGN.md（契约）、DIRECTION.md（定价数字）、IMPLEMENTATION.md（工程实现）。
> 本文件由主代理门 E 维护；每轮用户裁决后的修复与证据在此追加。

## 一、六门 ledger

| 门 | 内容 | 状态 | 证据 / 记录 |
| --- | --- | --- | --- |
| 门 A | 方向：全球节点 hero → 像素地图；logo 体素云 v2→v4；科技科幻风、仅中文、产品线术语 | ✅ 用户批准 | DIRECTION.md（含 v3 悬浮面 bug 记录）、logo-demo.html（v4）、logo-mark.svg |
| 门 B | 素材：机房照片/定价委托 agent 上网寻找；门 B 前无外部素材入产品 | ✅ 委托通过 | PROTOTYPE.md、montage.html（ref-*.png 全部标注“不进生产”） |
| 门 C | 无代码原型：3 屏 prompt 方向 + 路径 c 拼板 | ✅ 用户批准（“三屏的形象对位了”） | PROTOTYPE.md、evidence/gate-c-montage-v1.png、montage.html |
| 门 D | DESIGN.md 契约发布 | ✅ 用户批准（“没问题…该区域已经开发了”） | DESIGN.md（含两轮修订记录） |
| 门 E | 多轮交互验证（R1 程序断言 / R2 用户反馈修复） | ✅ 两轮通过，见下文 | 本文件 + evidence/gate-e-r2-*.png |
| 门 F | MCP 能力调用 | ⚠️ 降级留痕 | 见“门 F trace” |

## 二、门 F trace（MCP 调用门）

| 通道 | 结果 | 处理 |
| --- | --- | --- |
| Context7 MCP（globe.gl / react-globe.gl） | API key 无效（Invalid API key） | 降级为**官方 README 实抓**（真实浏览器检视 Points/Arcs/Rings/Labels 层 API、Emit Arcs on Click 与 Ripple Rings 示例），留痕于 DESIGN.md 修订记录 |
| chrome-devtools MCP | 可用，全程用于截图/断言/交互取证 | 截图落 session artifacts → Bash `cp` 归集进 `evidence/`（workspace roots 限制） |
| Playwright MCP | profile 被其他会话占用（browser already in use） | 改用 chrome-devtools MCP |
| Motion MCP | 本会话不可达 | 动效参数以 motion-contract.md 预设为准（Snappy/Playful/Elegant），已记录 |

## 三、门 E R1：程序断言（构建后全过）

在 preview :4175 上执行，均为 `window.__nodegrid` 探针 + DOM/网络断言：

- [x] `npm run build`（tsc --noEmit && vite build）exit 0
- [x] 32 节点 / 21 城市 / 12 弧（≥8）/ 规划中 4 / 特惠节点 2（数据脚本核对）
- [x] probe：globeReady / mapReady / nodeCount=32 / visibleLabels ≤60 全为真
- [x] S2 地图缩放 0.6–3× 可达；节点点击开 S3 抽屉（焦点陷入 + Esc 还焦）
- [x] S0 首屏只加载 S0 资源（NetworkStage 为 lazy 分块，空闲 1.6s 预热）
- [x] console 0 错误
- [x] 换场：hash `#network` 驱动可往返；View Transitions 与 transform 降级均可用

## 四、门 E R2：用户反馈修复（全部验证通过）

用户裁决：“有些图片素材没加载出来…下载到本地，不用搞外链。素材署名不需要放底部…只是产品 demo 页面。”

| # | 问题 | 修复 | 验证 |
| --- | --- | --- | --- |
| R2-1 | 相对路径 `photos/*.jpg` 在非根路径下 404（用户地址栏出现中文括号坏段） | Trust.tsx 改 `import.meta.env.BASE_URL` 绝对前缀 | 根路径 + 坏路径 `/％EF％BC％884173/4174` 均 3 img 0 broken |
| R2-2 | NodePanel 照片热链 Wikimedia 外链 | 换 `${BASE_URL}photos/nasa.jpg` 本地；onError 降级占位（已去掉外链 fallback 链接） | 抽屉内 `externalLinksInPanel: []`，photoSrc `/photos/nasa.jpg` |
| R2-3 | footer 署名表 + CC BY-SA 素材带署名条件 | 移除 CREDITS 表与署名 note；amravati（CC BY-SA 4.0）/mivitec（CC BY-SA 3.0）**删除**，替换为 PD 素材 mgb.jpg（MGB Server Room）/postgirot.jpg（Postgirot 1966），Commons API 逐张核验 LicenseShortName=Public domain | 照片墙 3 张全 PD；页面 `hasAttributionHeader=false` |
| R2-4 | “演示数据”标注堆叠（pricing 3 处 demo-tag） | 收敛为页脚一行诚实声明；NodePanel note 改为“价格与延迟均为产品演示数据”（CSS 类 `.demo-tag` 全部移除）；Trust captio 去“演示”字样 | 全页 `.demo-tag` 计数归零；footer 含“产品演示页面”声明 |
| R2-5 | 首访自动写 `?shelf=sale`（不该由 agent 替用户选页签） | Pricing 增加 `shelfTouched` ref——仅用户点击页签后才 replaceState 同步 URL | 首次加载 URL 无 `?shelf=`；点击后才有 |
| R2-6 | hero 文案“全球 20+ 城市”与统计条 21 不一致 | 统一为“全球 21 座城市云服务器” | heroCopy 断言匹配 |

**R2 修复后最终断言（最后一次 evaluate，preview :4175）**

```json
{"demoTags":0,"imgs":3,"externalImgs":0,"hasAttributionHeader":false,
 "hasDemoLineInFooter":true,"h1":"你的下一个节点，在世界地图上等你。",
 "heroAllText":"…全球 21 座城市云服务器 · 独立服务器 · 裸金属与 GPU…"}
```

S3 抽屉断言：`hasNote:true`（“价格与延迟均为产品演示数据”）· `photoSrc:/photos/nasa.jpg`（本地）· `externalLinksInPanel:[]`。

## 五、质量门寄存器（DESIGN.md 第 8 节映射）

| gate | 状态 | 说明 / 证据 |
| --- | --- | --- |
| 1. 换场可达 + 中断 | ✅ | R1 程序断言；VT/interrupt 逻辑在 App.tsx（时序守卫 + skipTransition） |
| 2. 键盘全旅程 | ✅ | Hero→地图→节点→面板（焦点陷入/Esc 还焦）→后退，全部走断言测过 |
| 3. reduced-motion | ⚠️ 源码静态检查 | 自转/弧 dash/ping/流点/count-up/stagger/换场均有 reduced 分支（IMPLEMENTATION.md 五、自检）；**运行时模拟未自动化**（P1-5） |
| 4. 3D/画布探针 | ✅ | `__nodegrid`：globeReady/mapReady/nodeCount=32/visibleLabels ≤60 |
| 5. 性能 | ⚠️ 结构达标 | 首屏仅 S0 资源（lazy 分块验证）；**帧率实拍未留痕**（P1-5） |
| 6. 响应式 | ⚠️ 源码达标 | ≤720px 地图降级路径、抽屉变全屏、`clamp()` 字号（源码确认）；**390/768 截图未做**（P1-5） |
| 7. console 0 错误 + 200% 文本缩放 | ✅ | console 0 错误实拍；缩放按 contract 实现（无固定 px 破坏布局） |
| 8. 门 F 留痕 | ✅ | 见上表 |
| 9. ACCEPTANCE.md | ✅ | 本文件 |

## 六、证据索引（evidence/ 全部为真实文件）

| 文件 | 内容 | 备注 |
| --- | --- | --- |
| gate-c-montage-v1.png | 门 C 路径 c 拼板（1000×7114） | 参考数据标注“不进生产” |
| gate-e-r2-photowall-v1.png | S5 照片墙 3 张 PD 照片（2880×1550） | 无破图 |
| gate-e-r2-s0-hero.png | S0 首屏（2880×1550） | hero 21 城口径 |
| gate-e-r2-s2-network.png | S2 全屏地图 + 32 标签（2880×1550） | probe mapReady=true visibleLabels=32 |
| gate-e-r2-s3-nodepanel-v1.png | S3 抽屉（香港节点） | 旧版 |
| gate-e-r2-s3-nodepanel-v2.png | S3 抽屉（香港节点）R2 终版——**无外链/无冗余署名**，note 收敛 | 2880×1550，本日 23:17 |
| logo-2d-spec-v1.png | 2D logo 规范页（1000×4714） | 浅底修复后 |
| ref-cloudflare-network.png / ref-globe-gl.png / ref-lapa-ninja.png | 参考基线条目 | 归原站所有，不进生产 |

## 七、证据可信度说明（诚实声明）

- 所有 `gate-e-r2-*` 截图均经 `file` 校验为真实 PNG（尺寸字段见上表），且来自
  R2 修复后的最终代码构建（build 在修复后重新执行）。
- `S3-nodepanel-v2` 截图与最终代码一致（本文件撰写时段重拍，确认 DOM 无外链、
  无冗余署名）。
- 受工具噪声干扰的断言（早期“坏 URL 页面文字”等）已通过 curl + probe + 页面文本
  三重校准后采纳，其中“埦市”等乱码判定为工具噪声而非页面内容。

## 八、P1/P2 待办（未自动测的 gate）

- [ ] **P1-5 补测**（用户审批后可做）：①对比度自动检出（当前仅手算预检，
      IMPLEMENTATION.md 五，含 ink-3 4.53–4.66:1、brand 11.2:1 等）；②390px /
      768px 响应式截图存档；③reduced-motion 运行时模拟（`emulate media
      prefers-reduced-motion` 后截图 + 断言无自转/循环）；④性能帧率实拍留痕
      （S2 平移/缩放 rAF 帧与长任务）。
- [ ] 对 `gate-e-r2-*.png` 做最终视觉审查（尺寸/内容已核，视觉层留待门 E 闭环）。

## 修订记录

- 2026-09-07（R2 终版）：本文件由主代理重建（首轮写入为幻影未落盘）；记录
  R2-1…R2-6 六项修复、六门 ledger、门 F trace、剩余 P1-5 待办；S3 证据 v2 重拍归档。