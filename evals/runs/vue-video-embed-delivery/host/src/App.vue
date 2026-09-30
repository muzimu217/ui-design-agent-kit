<script setup>
import VideoEmbed from "./VideoEmbed.vue";
</script>

<template>
  <main class="page">
    <header class="hero">
      <h1>UI Design Agent Kit — 产品视频</h1>
      <p>Remotion 渲染 MP4 · Vue 宿主页嵌入：poster + 原生控件 + 移动内联播放</p>
    </header>
    <VideoEmbed src="/media/product-video.mp4" poster="/media/poster.jpg" label="UAK 产品视频（15 秒）" />
    <section class="notes">
      <h2>嵌入说明</h2>
      <ul>
        <li>视频经 Remotion 渲染编码为独立 MP4 交付，宿主页保持既有 Vue 技术栈。</li>
        <li>静音自动播放；被浏览器策略拒绝时回退为点按播放覆盖层。</li>
        <li>系统开启「减弱动态效果」时不自动播放，仅显示海报与手动播放。</li>
        <li>移动端 <code>playsinline</code> 内联播放，不出全屏。</li>
      </ul>
    </section>
  </main>
</template>

<style>
:root {
  color-scheme: light;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background: #f2f5f7;
  color: #26343d;
  font-family: "PingFang SC", "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 20px 64px;
}
.hero h1 {
  margin: 0 0 8px;
  font-size: clamp(22px, 4vw, 34px);
  letter-spacing: -0.02em;
}
.hero p {
  margin: 0 0 28px;
  color: #61717d;
  font-size: 15px;
}
.notes {
  margin-top: 32px;
  padding: 20px 22px;
  background: #fafcfd;
  border: 1px solid #d9e2e7;
  border-radius: 14px;
}
.notes h2 {
  margin: 0 0 10px;
  font-size: 16px;
}
.notes ul {
  margin: 0;
  padding-left: 20px;
  display: grid;
  gap: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #475863;
}
code {
  background: #eef2f5;
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 13px;
}
</style>
