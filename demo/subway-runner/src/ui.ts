/** HUD 与浮层 DOM 绑定。 */
import type { Game } from "./engine";

export interface UIHandlers {
  start(): void; retry(): void; toTitle(): void; pause(): void; resume(): void;
}

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  return el;
}

export function initUI(handlers: UIHandlers) {
  $("btn-start").addEventListener("click", handlers.start);
  $("btn-retry").addEventListener("click", handlers.retry);
  $("btn-back-title").addEventListener("click", handlers.toTitle);
  $("btn-pause").addEventListener("click", handlers.pause);
  $("btn-resume").addEventListener("click", handlers.resume);
  return {
    score: $("score-num"),
    coins: $("coin-num"),
    overScore: $("over-score"),
    overCoins: $("over-coins"),
    overBest: $("over-best"),
    overTitle: $("over-title"),
    hint: $("hud-hint"),
  };
}

export type UIRefs = ReturnType<typeof initUI>;

export function syncUI(game: Game, refs: UIRefs): void {
  if (document.body.dataset.state !== game.phase) document.body.dataset.state = game.phase;
  const score = String(Math.floor(game.score));
  if (refs.score.textContent !== score) refs.score.textContent = score;
  const coins = String(game.coinCount);
  if (refs.coins.textContent !== coins) refs.coins.textContent = coins;
}

export function fillOver(game: Game, refs: UIRefs): void {
  refs.overScore.textContent = `${Math.floor(game.score)} m`;
  refs.overCoins.textContent = `× ${game.coinCount}`;
  refs.overBest.textContent = `${game.best} m`;
  refs.overTitle.innerHTML = game.overReason.includes("列车")
    ? "撞<em>上</em>列车了！"
    : "被<em>抓住</em>了！";
}
