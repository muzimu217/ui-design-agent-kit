// 一次性页面生成器：从 art/MANIFEST.json 生成 index.html（真迹 + 真实馆藏说明牌）。
// 动效/键盘/降级系统与 v1 完全一致，仅视觉资产与说明文字来自真实素材。
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync(__dirname + '/art/MANIFEST.json', 'utf8'));

const tiles = manifest.map((m, i) => `  <li class="card" style="--i:${i}"><button type="button" aria-haspopup="dialog" data-idx="${i}">` +
  `<span class="art"><img src="${m.file}" alt="${m.title}（${m.artist}，${m.year}）· 大都会艺术馆藏，CC0" loading="lazy" /></span>` +
  `<span class="cap"><b>${m.title}</b> · ${m.artist} · ${m.year}</span></button></li>`).join('\n');

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>拾贰幅 · 开放授权画作陈列</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' rx='3' fill='%23262626'/%3E%3Ccircle cx='8' cy='8' r='4' fill='%23c96f4a'/%3E%3C/svg%3E" />
<style>
  :root{
    --wall:#f4f1ea; --frame:#ffffff; --ink:#26241f; --ink-2:#6d675c;
    --line:#ddd6c8; --accent:#c96f4a; --focus:#8a4b2f;
    --dur-in: 420ms; --stagger: 60ms;
    --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--wall);color:var(--ink);
    font:15px/1.6 -apple-system,"PingFang SC","Segoe UI",sans-serif;
    -webkit-font-smoothing:antialiased}
  header{max-width:1080px;margin:0 auto;padding:48px 24px 8px}
  header h1{font-size:26px;margin:0;letter-spacing:.02em}
  header p{margin:6px 0 0;color:var(--ink-2);font-size:14px}
  header p a{color:inherit}
  .grid{max-width:1080px;margin:24px auto 0;padding:0 24px 24px;
    display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:24px;
    list-style:none}
  .card{margin:0}
  .card button{display:block;width:100%;height:100%;padding:10px 10px 12px;text-align:left;
    background:var(--frame);border:1px solid var(--line);border-radius:8px;
    font:inherit;color:inherit;cursor:pointer;
    box-shadow:0 1px 2px rgba(38,36,31,.05);
    transition:box-shadow 140ms var(--ease-out)}
  .card button:hover{box-shadow:0 4px 14px rgba(38,36,31,.10)}
  .card button:active{transform:translateY(1px)}
  .card button:focus-visible{outline:none;box-shadow:0 0 0 2px var(--wall),0 0 0 4px var(--focus)}
  .art{aspect-ratio:4/3;border-radius:4px;overflow:hidden;background:#e8e2d4}
  .art img{width:100%;height:100%;object-fit:cover;display:block}
  .cap{display:block;margin-top:10px;font-size:13px;color:var(--ink-2);letter-spacing:.02em;line-height:1.45}
  .cap b{color:var(--ink);font-weight:600}
  html.fx .card{
    animation:card-in var(--dur-in) var(--ease-out) both;
    animation-delay:calc(var(--i) * var(--stagger));
  }
  @keyframes card-in{
    from{opacity:0;transform:perspective(600px) rotateX(4deg) translateY(10px);filter:blur(6px)}
    60%{filter:blur(0)}
    to{opacity:1;transform:none;filter:none}
  }
  @media (prefers-reduced-motion:reduce){
    html.fx .card{animation:none}
    .card button,.card button:active{transition:none;transform:none}
    dialog{transition:none}
  }
  dialog{border:1px solid var(--line);border-radius:12px;padding:20px;
    max-width:640px;width:calc(100% - 48px);background:var(--frame);color:var(--ink);
    opacity:0;transform:translateY(8px) scale(.985);
    transition:opacity 160ms var(--ease-out),transform 160ms var(--ease-out),display 160ms allow-discrete,overlay 160ms allow-discrete}
  dialog[open]{opacity:1;transform:none}
  dialog::backdrop{background:rgba(38,36,31,.35)}
  dialog .big{border-radius:6px;overflow:hidden;margin-bottom:14px;background:#e8e2d4;
    display:grid;place-items:center;max-height:52vh}
  dialog .big img{max-width:100%;max-height:52vh;object-fit:contain;display:block}
  dialog h2{margin:0 0 4px;font-size:18px}
  dialog .meta{margin:0 0 10px;color:var(--ink-2);font-size:14px}
  dialog .credit{margin:0 0 16px;color:var(--ink-2);font-size:12.5px;line-height:1.6}
  dialog .credit a{color:var(--focus)}
  .close{padding:8px 16px;border-radius:6px;border:1px solid var(--line);
    background:transparent;font:inherit;font-weight:600;cursor:pointer}
  .close:hover{background:var(--wall)}
  .close:focus-visible{outline:none;box-shadow:0 0 0 2px var(--frame),0 0 0 4px var(--focus)}
  footer{max-width:1080px;margin:0 auto;padding:0 24px 48px;color:var(--ink-2);font-size:13px;line-height:1.7}
  footer a{color:inherit}
</style>
</head>
<body>
<header>
  <h1>拾贰幅</h1>
  <p>十二幅开放授权画作的常设陈列 · 点按或回车看馆藏信息</p>
</header>
<ul class="grid" id="grid">
${tiles}
</ul>
<footer>画作均来自 <a href="https://www.metmuseum.org/art/collection" target="_blank" rel="noopener">大都会艺术博物馆开放授权计划（Met Open Access）</a>，CC0 授权，逐幅来源与元数据见 <a href="art/MANIFEST.json" target="_blank" rel="noopener">MANIFEST.json</a>。页面为演示陈列。</footer>

<dialog id="detail" aria-labelledby="d-title">
  <div class="big"><img id="d-img" alt="" /></div>
  <h2 id="d-title"></h2>
  <p class="meta" id="d-meta"></p>
  <p class="credit" id="d-credit"></p>
  <button type="button" class="close" id="d-close">关闭</button>
</dialog>

<script>
  if (matchMedia("(prefers-reduced-motion: reduce)").matches === false) {
    document.documentElement.classList.add("fx");
  }
  const MANIFEST = ${JSON.stringify(manifest.map(({ objectID, title, artist, year, credit, license, source, file }) => ({ objectID, title, artist, year, credit, license, source, file })))};
  const grid = document.getElementById("grid");
  const dialog = document.getElementById("detail");
  let lastTrigger = null;
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-idx]");
    if (!btn) return;
    lastTrigger = btn;
    const m = MANIFEST[Number(btn.dataset.idx)];
    document.getElementById("d-img").src = m.file;
    document.getElementById("d-img").alt = m.title + "（" + m.artist + "，" + m.year + "）";
    document.getElementById("d-title").textContent = m.title;
    document.getElementById("d-meta").textContent = m.artist + " · " + m.year;
    document.getElementById("d-credit").innerHTML = m.credit + " · " + m.license +
      " · <a href=" + JSON.stringify(m.source) + " target=_blank rel=noopener>馆藏页</a>";
    dialog.showModal();
  });
  document.getElementById("d-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => { if (lastTrigger) lastTrigger.focus(); });
</script>
</body>
</html>
`;
fs.writeFileSync(__dirname + '/index.html', html);
console.log('index.html rebuilt with', manifest.length, 'paintings, bytes:', html.length);
