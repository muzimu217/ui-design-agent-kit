# EVIDENCE.md · three-remotion-deterministic-export（R149-01 批次三十三 · 键序第 50）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-29 轮 214 系。
> 场景本质：**3D 产品影片+确定性物理 MP4 导出**——考"帧/fps 派生+确定性物理重建（非
> 自由运行世界）+乱序帧+输出全检（decode/dimensions/fps/duration/代表帧）"。
> **模拟语境披露**： chair.glb 以程序化几何方块模拟（材质变体/交互/验证链路全真）。

## 一、文档阅读与版本对齐（判据 1）

- 官方文档：@remotion/three（ThreeCanvas 桥接，Remotion 帧同步 three.js——useFrame 在
  Remotion 上下文=帧驱动非 wall-clock）+ three 官方（Spherical/材质）
- 版本对齐：remotion 4.0.370 + @remotion/three 4.0.370 + @react-three/fiber 8.17 +
  three 0.169（package-lock 在案）；**零 agent-kit 根新增依赖**（failCondition #5 防线：
  fixture 局部 node_modules）
- **废弃 Remotion MCP 未安装**（failCondition #3 防线）

## 二、帧数学派生物理（判据 2/3）

- **逐帧半隐式欧拉确定性积分**（simulateBody 纯函数：v -= g·dt; y += v·dt; 触地反弹
  REST 衰减；settled 早停）——**同帧同输出，乱序渲染等价（md5 实证）**
- **非 Rapier 自由运行世界复用**（failCondition 防线：物理确定性重建而非复用 RAF 世界）
- 相机/几何全由 frame/fps 派生，显式画布尺寸（1920×1080@30，ThreeCanvas width/height
  数字 props——**教训：ThreeCanvas 需显式数字尺寸，R3F 自动撑满不适用**）

## 三、乱序帧确定性（判据 5，md5 硬实证）

导出顺序故意乱序+重复（0→30→60→90→119→60b→30b）：

| 帧 | md5 前 10 | 重复导 |
| --- | --- | --- |
| f000 | 413932ed92 | — |
| f030 | 413932ed92 | 与 f000 同（静止段） |
| f060 | 413932ed92 | b 导=同 |
| f090 | 413932ed92 | b 导=同 |
| f119 | 35ed52b992 | fadeOut 段唯一 |

**同哈希组=2 组（静止段全同+淡出段唯一）——乱序/重复导出确定性成立。**

## 四、MP4 输出全检（判据 5）

evidence/falling-objects.mp4（465KB，h264）：
- **ffprobe 实测**：1920×1080、30/1 fps、duration 4.000s、codec h264 ✓
- 代表帧：0/30/60/90/119 五帧导出核对（下落序列推进+末帧淡出）✓
- **输出文件已检查**（非"声称渲染"——failCondition #4 防线：文件存在+ffprobe 流级验证）

## 五、诚实边界

- 物理为**确定性重建**（解析欧拉），非 Rapier 引擎复用（failCondition 防线：不把
  自由运行世界烘焙进视频）
- 无声音（场景未要求音频轨；ffprobe 显示 aac 空流为容器默认）
- 碰撞为地面反弹简化（无物体间互撞——三体独立下落）
