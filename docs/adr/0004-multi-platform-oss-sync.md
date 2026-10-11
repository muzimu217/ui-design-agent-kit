# ADR-0004：开源多端同步（GitHub 主仓 + Gitee/GitCode 镜像）

- 状态：已接受 ｜ 日期：2026-10-10（用户裁决："不仅 GitHub，GitCode 和 Gitee 也可以创建开源仓库，做一下同步，实现多端同步"）

## 背景

Kit 已在 GitHub 公开（muzimu217/ui-design-agent-kit，PR 工作流），本地仓库为唯一真源。
用户在 Gitee 与 GitCode 均有账户（本机已配置两家 git credential helper），希望开源成果多端可达。

## 决策

1. **真源唯一**：本地仓库（dev/auto 工作分支）为唯一真源；GitHub `origin` 为主公开仓，继续走 PR 审阅流。
2. **镜像仓**：Gitee 与 GitCode 建同名公开仓 `muzimu217/ui-design-agent-kit`，作为**只读镜像**——
   同步方式为从本地显式 `git push gitee/gitcode main dev/auto`，不在镜像上开发、不接受镜像侧 PR。
3. **同步范围**：仅公开的开发仓；研究仓 `uak-research`（私有）**不**镜像到任何平台。
4. **凭据**：使用用户已配置的 `git-credential-gitee` / `git-credential-gitcode` 助手（10-06 落位），
   推送经 git 协议认证；令牌不落仓库、不进文档、不回显。
5. **同步节奏**：随开发轮手动推送（或用户要求时）；不做自动定时同步（避免无人值守外发，符合硬边界）。

## 实施（2026-10-10）

- 两平台 API（v5 兼容）创建公开仓成功；remotes `gitee` / `gitcode` 已挂；`main` + `dev/auto` 双分支首推成功（各返回 new branch 确认）。
- GitCode 匿名页面 200 可达；Gitee 对匿名 curl/浏览器返回 403（WAF 风控特征，推送协议层已成功）——用户登录态访问待其自查，若持续匿名受限需复查仓库公开设置。

## 后果

- 仓库地址三端：GitHub / Gitee / GitCode 同名（见 README 徽章区，2026-10-10 后由 README 重写批加入）。
- 镜像内容以 GitHub 为准的时差窗口存在（镜像随轮次手动同步）；镜像 issue/PR 不维护（引导回 GitHub）。
- 推送出错的常见原因：Gitee WAF 风控（协议层仍可成功）；凭据失效时重跑对应 OAuth 流程（用户侧）。
