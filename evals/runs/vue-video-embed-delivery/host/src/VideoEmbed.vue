<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  src: { type: String, required: true },
  poster: { type: String, required: true },
  label: { type: String, default: "产品视频" },
});

// idle | autoplaying | manual-wait | manual-playing | reduced-paused
const state = ref("idle");
const videoEl = ref(null);
const reduced = ref(false);
let mql = null;

function applyReduced() {
  reduced.value = mql.matches;
  if (reduced.value && videoEl.value && !videoEl.value.paused) {
    videoEl.value.pause();
    state.value = "reduced-paused";
  }
}

// 播放统一入口：promise 被策略拒绝（NotAllowedError/AbortError）→ 回退手动覆盖层
function attemptPlay(source, forceBlock = false) {
  const v = videoEl.value;
  if (!v) return;
  const p = v.play();
  if (forceBlock) v.pause(); // 在 play() 之后立刻 pause()：play promise 以 AbortError 真实 reject
  p.then(
    () => {
      state.value = v.paused ? "manual-wait" : source;
    },
    () => {
      state.value = "manual-wait";
    },
  );
}

function manualPlay() {
  attemptPlay("manual-playing");
}

onMounted(() => {
  mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", applyReduced);
  reduced.value = mql.matches;
  if (reduced.value) {
    state.value = "reduced-paused";
    return;
  }
  const v = videoEl.value;
  v.muted = true;
  // ?force-block=1 证据夹具：让 play() 的 promise 真实 rejection，
  // 以确定性方式驱动"自动播放被策略拒绝→手动播放"分支（正常访问不受影响）
  const forceBlock = new URLSearchParams(window.location.search).has("force-block");
  attemptPlay("autoplaying", forceBlock);
});

onBeforeUnmount(() => {
  if (mql) mql.removeEventListener("change", applyReduced);
});
</script>

<template>
  <figure class="embed" :data-state="state" :data-reduced="reduced ? 'reduce' : 'no-preference'">
    <div class="frame">
      <video
        ref="videoEl"
        class="player"
        :src="src"
        :poster="poster"
        controls
        playsinline
        preload="metadata"
        :aria-label="label"
      ></video>
      <button
        v-if="state === 'manual-wait' || state === 'reduced-paused'"
        type="button"
        class="overlay"
        aria-label="播放视频"
        @click="manualPlay"
      >
        <span class="overlay-icon" aria-hidden="true">▶</span>
        <span class="overlay-text">{{
          state === "reduced-paused" ? "已停用自动播放 · 点按播放" : "点按播放"
        }}</span>
      </button>
    </div>
    <figcaption class="caption">
      <span>时长 15s · 1280×720 · H.264</span>
      <span>状态：{{ state }}</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.embed {
  margin: 0;
}
.frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #26343d;
  border-radius: 14px;
  overflow: hidden;
}
.player {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  border: 0;
  cursor: pointer;
  background: rgba(38, 52, 61, 0.55);
  color: #fafcfd;
  font: inherit;
}
.overlay-icon {
  font-size: 30px;
  line-height: 1;
}
.overlay-text {
  font-size: 15px;
}
.overlay:focus-visible {
  outline: 3px solid #2566c4;
  outline-offset: -3px;
}
.caption {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  font-size: 13px;
  color: #61717d;
}
@media (prefers-reduced-motion: reduce) {
  .overlay {
    transition: none;
  }
}
</style>
