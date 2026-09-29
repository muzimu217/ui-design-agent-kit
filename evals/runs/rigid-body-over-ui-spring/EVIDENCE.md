# EVIDENCE.md · rigid-body-over-ui-spring（R149-01 批次三十一）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-29 轮 212 系。
> 场景本质：**刚体物理正用**——R3F+Rapier（已兼容集成）3D 体拖拽落下/碰撞/堆叠，
> 考"引擎 bodies/colliders 正用+UI 弹簧分离+稳定仿真+真实验证非截图声称"。

## 一、引擎正用（判据 1/2）

- **Rapier RigidBody**：3 dynamic Dice（CuboidCollider，restitution 0.2/friction 0.8）+
  1 Draggable（kinematicPosition 拖拽接管）+ fixed Ground——bodies/colliders 全引擎级
- **拖拽修真**（内环抓真缺陷）：首版 mesh 级 onPointerMove 在无 pointer capture 时收不到
  后续事件（three mesh 无 setPointerCapture）——**move/up 改挂 window**（pointerdown 注册/
  pointerup 注销）后拖拽真实可用
- **零自造碰撞引擎**：碰撞/堆叠全 Rapier 引擎（failCondition #2 防线）

## 二、稳定仿真与所有权（判据 3）

- Physics timeStep="vary"；**transform 所有权=物理引擎独占**（UI 层零写入——
  failCondition #3 防线：无双系统写同 transform）
- **空格 reset**：Physics key 重挂（引擎级复位）——keydown Space 实现（HUD 承诺兑现，
  首版未实现被验证抓出后补齐）
- **B 冲量抛飞**：全 dynamic 体随机冲量（键盘交互——场景判据允许 pointer **or keyboard**）

## 三、验证（9/9，evidence/rapier-verify.mjs 可复跑）

- 拖拽抛掷像素差 **2.09%** ✓（B 冲量抛飞 **4.60%** reduced 下 ✓）
- 落回后静止（700ms 差异 0）+ 空格 reset 重排（1.18-1.94%）✓
- reduced motion：**物理照常响应（B 冲量 4.60%）**——UI 弹簧关但物理不停 ✓
- 移动端 375：canvas 渲染+触摸+零横滚 ✓；console 0 ✓

## 四、取证教训（三层验证陷阱全踩）

1. **readPixels 假黑**（R3F preserveDrawingBuffer=false）→ 合成器截图法
2. **拖拽起点落空**：落定方块投影在屏幕下半，中心点悬空——起点须落在物体实际投影区
3. **reduced context 假阳性反噬**：背景 CSS 动画污染整页差分——断言改 canvas 元素级+
   B 冲量语义触发（背景动画不因 B 变化）

## 五、诚实边界

- kinematic 拖拽为平面级（z 轴锁定命中级深度）——全 3D 拖拽属后续增强
- 无声音（物理碰撞音未做——场景未要求）

## 六、工件清单

- fixture/src/main.jsx——Rapier 场景源码
- evidence/rapier-verify.mjs——9 断言脚本（可复跑）
- evidence/desktop-stack.png / mobile-375.png——取证截图
- EVIDENCE.md——本元记录
