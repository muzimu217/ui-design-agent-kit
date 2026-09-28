# EVIDENCE.md · brand-specific-experience（R149-01 批次七）

> 评测语境：`--next` 轮转如实领取。执行窗口：2026-09-28 轮 183 日间。
> **模拟语境披露**：场景设定"用户提供照片与 wordmark"——评测语境下以 picsum.photos
> **稳定 ID 真实摄影照片**充当摄影师成片（可拉取/可检视 URL，非 AI 生成、非无关图库——
> 它们在夹具中扮演的就是"被提供的作品"）；wordmark 为文字标识「林间 LENS」。
> 身份=用户指定的红 #C8102E × 白，全片未出现默认调色板（failCondition #1 防线）。

## 一、身份保持（判据 1）

- 红 #C8102E 仅用于 wordmark/分类激活态/细节强调（克制使用——品牌服从不是满屏红）
- 底色纯白；ink 用近黑 #1a1a1a；无任何第三方默认调色板（computed 实证 rgb(200,16,46)/rgb(255,255,255)）

## 二、首屏即作品（判据 2）

- hero 大图《山脊》直接进第一 viewport（y=86、h=648 @900px 高视口），无入场动画遮挡
  （failCondition #3 防线：零 entrance animation，页面加载即完整可见）

## 三、响应式可检视图片（判据 3）

- hero：srcset 三档（900/1600/2400w）+ sizes=100vw——大屏实测取 1600/900
- 网格图：srcset 三档 + sizes 响应式断言——移动端实测取 900/1100 小图
- 全部 <img> 带语义 alt（作品名+系列）与 figcaption；naturalWidth>0 加载完成实证

## 四、项目导航可用（判据 4）

- 分类导航（全部/峡谷/河谷/瀑布/夜色/湖泊）：点击过滤生效（峡谷=2 项实证）
- 键盘：Tab 可达 + focus-visible 红色焦点环 + Enter 切换（aria-current 更新实证）
- aria-current="true" 标注激活分类（状态语义化）

## 五、验证（9/9，evidence/brand-verify.mjs 可复跑）

桌面 1440：首屏加载/身份 token/srcset 大图/console 0 错误 ✓
移动 390：srcset 小图/导航过滤/键盘可达/aria-current ✓
截图：desktop-hero.png / mobile-grid.png

## 六、诚实边界

- picsum 照片为模拟"用户作品"的载体（真实委托中应替换为摄影师本人原片+授权核查）
- wordmark 为文字排版标识（真实委托中若提供 logo 图形文件则替换之）
