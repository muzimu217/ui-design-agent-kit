# F-00 素材来源与授权记录（T-004 逐图留痕）

## 背景图：cyber-city-neon.jpg

| 项 | 值 |
| --- | --- |
| 文件 | `src/assets/cyber-city-neon.jpg`（2400×1600，约 408 KB，progressive JPEG） |
| 图片页面 | https://unsplash.com/photos/a-futuristic-city-at-night-with-neon-lights-dA0-qxdbyyY |
| 照片 ID | `dA0-qxdbyyY` |
| 作者 | Unsplash 用户 **nat**（下载响应 Content-Disposition 文件名为 `nat-dA0-qxdbyyY-unsplash.jpg`，按 Unsplash 官方命名规则 `用户名-照片ID-unsplash.jpg` 判定；作者显示名因 Unsplash 授权页/照片页/oEmbed 均受 Anubis 反爬拦截（直连与代理通道均 401/质询页），非浏览器通道无法核实，如实记录） |
| 许可 | **Unsplash License**（免费商用、可修改、无需署名；禁止原样出售、汇编复制竞品图库服务） |
| 下载地址 | `https://unsplash.com/photos/dA0-qxdbyyY/download?force=true&w=2400`（302 → `https://images.unsplash.com/photo-1672872476232-da16b45c9001?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=nat-dA0-qxdbyyY-unsplash.jpg&w=2400`） |
| 取用日期 | 2026-10-01（本机代理 127.0.0.1:7897 通道下载，直连被 Anubis 拦截） |
| 使用方式 | 两套主题包的背景图层（`object-fit:cover; object-position:center 30%` + 主题色压暗渐变）；加载失败时应用自动降级为纯色赛博渐变底 |

## 其他素材来源

| 素材 | 来源 | 授权 | 使用方式 |
| --- | --- | --- | --- |
| border-beam 流光边框模式 | Magic UI `apps/www/registry/magicui/border-beam.tsx`（magicuidesign/magicui） | MIT（门B 已核，2026-10-01 经 GitHub API 复核） | 按 MIT 条款 copy-paste 思路重写为本项目组件（mask 双渐变 + intersect 只显边框环 + motion/react offsetPath/offsetDistance 光束），参数按契约定档（40×2px、6s/周、accent→accent-2） |
| 翻页机械规格参考 | pqina/flip（github.com/pqina/flip） | MIT（门B/C 已核） | 仅机械结构参考（三层叶/中缝铰链/明暗），未复制其代码；组件为项目自研 React 实现 |
| motion/react（motion npm 包 v13.5.0） | motion.dev（MIT） | MIT | 动效库依赖 |

## 声明

- 所有第三方代码来源均为 MIT 或 Unsplash License，可商用、无需署名；本文件仍按 T-004 要求逐项留痕。
- 未使用任何自绘素材替代现成组件；未引入其他未核授权的素材。

## 背景图扩充（2026-10-01 门E 返工迭代追加）

| 文件 | slug | 页面 URL | 许可 | 取用日期 |
| --- | --- | --- | --- | --- |
| src/assets/bg-r7YZXv5f5cc.jpg | r7YZXv5f5cc | https://unsplash.com/photos/r7YZXv5f5cc | Unsplash License（免费商用无需署名） | 2026-10-01 |
| src/assets/bg-kUpA8qN28GE.jpg | kUpA8qN28GE | https://unsplash.com/photos/kUpA8qN28GE | Unsplash License（免费商用无需署名） | 2026-10-01 |
| src/assets/bg-71SHXwBLp5w.jpg | 71SHXwBLp5w | https://unsplash.com/photos/71SHXwBLp5w | Unsplash License（免费商用无需署名） | 2026-10-01 |
| src/assets/bg-ez4pqCpEfuI.jpg | ez4pqCpEfuI | https://unsplash.com/photos/ez4pqCpEfuI | Unsplash License（免费商用无需署名） | 2026-10-01 |
| src/assets/bg-Io1lz5bZ0as.jpg | Io1lz5bZ0as | https://unsplash.com/photos/Io1lz5bZ0as | Unsplash License（免费商用无需署名） | 2026-10-01 |

## 素材工坊来源说明（2026-10-01 v3 迭代追加）

- 服务：**Picsum Photos**（https://picsum.photos ，免 key API）。列表接口 `GET /v2/list?page={1-100}&limit=24` 返回 `{id, author, width, height, url(Unsplash 原页), download_url}`；缩略图 `https://picsum.photos/id/{id}/360/220`、大图 `https://picsum.photos/id/{id}/2400/1500` 为 CDN 直链。
- 图片实际源自 **Unsplash 免费库**，适用 Unsplash License（免费商用、可修改、无需署名）。
- 诚实署名：素材工坊每张缩略图下方展示作者名；应用为背景后，设置面板常驻一行"当前来源：{author} · Unsplash 原页"可点击链接，且该来源（作者 + 原页 URL）随背景选择一并持久化到 localStorage（`remoteBg` 字段）。
- 网络通道：列表请求经本地开发/预览服务器代理（`/picsum-api` → `https://picsum.photos`，vite `server.proxy`/`preview.proxy`）；缩略图与大图由浏览器直连 CDN，不经代理。
