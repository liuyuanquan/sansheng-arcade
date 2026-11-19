const AUTOPLAY_MS = 6000;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tagsHtml = (g) => `<div class="tags">${g.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>`;
const sorted = [...GAMES].sort((a, b) => b.added.localeCompare(a.added));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function cover(g) {
  const inner = g.cover
    ? `<img src="${esc(g.cover)}" alt="${esc(g.title)} 封面" loading="lazy">`
    : `<span class="glyph" aria-hidden="true">${esc(g.glyph || g.title[0])}</span>`;
  return `<div class="cover" style="--c1:${g.colors[0]};--c2:${g.colors[1]}">${inner}<span class="kind">${esc(g.category)} · ${esc(g.genre)}</span></div>`;
}

/* ---------- 首屏像素背景 ---------- */
(function heroArt() {
  const SPRITES = {
    tank: { pal: { L: "#e4ff7a", G: "#c6f432", D: "#4f6b10", K: "#1d2a05", B: "#f3eee2" }, px: [
      ".....LLLLL.......",
      "....LLLLLLLBBBBBB",
      "....LGGGGGL......",
      ".GGGGGGGGGGGGG...",
      "GGGGGGGGGGGGGGG..",
      "DKDKDKDKDKDKDKD..",
      ".DDDDDDDDDDDDD..."] },
    mushroom: { pal: { R: "#ff4f8b", W: "#f3eee2", S: "#ffd9a8", K: "#1a0710" }, px: [
      "....RRRR....",
      "..RRWWRRRR..",
      ".RRWWWWRRRR.",
      ".RRRWWRRWWR.",
      "RRRRRRRWWWWR",
      "RWWRRRRRWWRR",
      "RWWWRRRRRRRR",
      ".RRRRRRRRRR.",
      "...SSSSSS...",
      "..SSKSSKSS..",
      "..SSSSSSSS..",
      "...SSSSSS..."] },
    coin: { pal: { Y: "#ffb627", W: "#fff3c4", O: "#b86e00" }, px: [
      "..YYYY..",
      ".YYWYYY.",
      "YYWYYOYY",
      "YYWYYOYY",
      "YYWYYOYY",
      "YYYYYOYY",
      ".YYYOYY.",
      "..YYYY.."] },
    invader: { pal: { X: "#3ee6ff" }, px: [
      "..X.....X..",
      "...X...X...",
      "..XXXXXXX..",
      ".XX.XXX.XX.",
      "XXXXXXXXXXX",
      "X.XXXXXXX.X",
      "X.X.....X.X",
      "...XX.XX..."] },
    ghost: { pal: { P: "#b69cff", W: "#f3eee2", K: "#1d1240" }, px: [
      "....PPPP....",
      "..PPPPPPPP..",
      ".PPPPPPPPPP.",
      ".PWWPPPWWPP.",
      "PPWKPPPWKPPP",
      "PPWWPPPWWPPP",
      "PPPPPPPPPPPP",
      "PPPPPPPPPPPP",
      "PPPPPPPPPPPP",
      "PP.PPP.PPP.P",
      "P...P...P..."] },
    heart: { pal: { H: "#ff4f8b", W: "#ffd1e0" }, px: [
      ".HH.HH.",
      "HWHHHHH",
      "HHHHHHH",
      ".HHHHH.",
      "..HHH..",
      "...H..."] }
  };
  const svg = ({ pal, px }) => {
    const w = Math.max(...px.map((r) => r.length));
    let rects = "";
    px.forEach((row, y) => [...row].forEach((ch, x) => {
      if (pal[ch]) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${pal[ch]}"/>`;
    }));
    return `<svg viewBox="0 0 ${w} ${px.length}">${rects}</svg>`;
  };
  // [精灵, 左%, 上%, 宽px, 动画延迟s]
  const left = [
    ["ghost", 34, 30, 48, 1.4],
    ["coin", 70, 50, 24, .6],
    ["coin", 22, 58, 24, 2.0]
  ];
  const layout = [
    ["invader", 30, 22, 66, 0],
    ["coin", 86, 30, 36, .8],
    ["mushroom", 70, 60, 70, 1.6],
    ["tank", 36, 68, 130, .4],
    ["heart", 56, 18, 34, 2.2],
    ["coin", 48, 44, 26, 1.2]
  ];
  const place = (list) => list.map(([k, l, t, w, d]) =>
    `<div class="sprite" style="left:${l}%;top:${t}%;width:${w}px;animation-delay:-${d}s">${svg(SPRITES[k])}</div>`).join("");
  $("#sprites-r").innerHTML = place(layout);
  $("#sprites-l").innerHTML = place(left);
  // 固定种子的星星，避免每次刷新位置跳动
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  $("#stars").innerHTML = Array.from({ length: 60 }, () =>
    `<i style="left:${(rnd() * 100).toFixed(1)}%;top:${(rnd() * 100).toFixed(1)}%;opacity:${(.3 + rnd() * .7).toFixed(2)};animation-delay:-${(rnd() * 3).toFixed(1)}s"></i>`).join("");
})();

/* ---------- 统计 ---------- */
const cats = [...new Set(GAMES.map((g) => g.category))];
const previewCount = GAMES.filter(g => g.preview).length;
$("#stats").innerHTML = [
  [GAMES.length, "款收录"],
  [GAMES.length - previewCount, "款可玩"],
  [previewCount, "款封面预览"]
].map(([n, l]) => `<div class="stat"><b>${esc(n)}</b><span>${l}</span></div>`).join("");

/* ---------- 即刻开玩轮播 ---------- */
(function showcase() {
  const picks = sorted.filter((g) => !g.preview);
  const root = $("#showcase"), stage = $("#stage"), tabs = $("#tabs");
  if (!picks.length) return;
  root.hidden = false;

  stage.innerHTML = picks.map((g, i) => `
    <a class="slide" href="${esc(g.url)}" target="_blank" rel="noopener" id="slide-${i}" role="tabpanel" aria-roledescription="slide"
       aria-label="${i + 1} / ${picks.length}：${esc(g.title)}" style="--c:${g.colors[0]}" draggable="false">
      ${cover(g)}
      <div class="body">
        <h3>${esc(g.title)}<span class="en">${esc(g.en || "")}</span></h3>
        <p>${esc(g.pitch || g.desc)}</p>
        ${tagsHtml(g)}
        <span class="cta">开始游戏</span>
      </div>
    </a>`).join("");
  tabs.style.setProperty("--n", picks.length);
  tabs.innerHTML = picks.map((g, i) => `
    <button type="button" class="tab" role="tab" aria-controls="slide-${i}" aria-selected="false" style="--c:${g.colors[0]}">
      <span class="num">${String(i + 1).padStart(2, "0")}</span><span class="t">${esc(g.title)}</span>
      <span class="bar"><i></i></span>
    </button>`).join("");

  const slides = [...stage.children], tabEls = [...tabs.children];
  let idx = 0, elapsed = 0, last = 0, userPaused = reduceMotion, hover = false, focusIn = false;
  const toggle = $("#sc-toggle");

  function go(n) {
    idx = (n + picks.length) % picks.length;
    elapsed = 0;
    slides.forEach((s, i) => {
      const on = i === idx;
      s.classList.toggle("is-active", on);
      s.tabIndex = on ? 0 : -1;
      s.setAttribute("aria-hidden", !on);
    });
    tabEls.forEach((t, i) => { t.setAttribute("aria-selected", i === idx); t.tabIndex = i === idx ? 0 : -1; t.style.setProperty("--p", 0); });
    root.style.setProperty("--accent", picks[idx].colors[0]);
  }
  const paused = () => userPaused || hover || focusIn || document.hidden || picks.length < 2;
  function syncToggle() {
    root.classList.toggle("is-paused", userPaused);
    toggle.setAttribute("aria-label", userPaused ? "开始自动播放" : "暂停自动播放");
  }
  function tick(t) {
    const dt = last ? t - last : 0;
    last = t;
    if (!paused()) {
      elapsed += dt;
      if (elapsed >= AUTOPLAY_MS) go(idx + 1);
      tabEls[idx].style.setProperty("--p", Math.min(elapsed / AUTOPLAY_MS, 1));
    }
    requestAnimationFrame(tick);
  }

  $("#sc-prev").onclick = () => go(idx - 1);
  $("#sc-next").onclick = () => go(idx + 1);
  toggle.onclick = () => { userPaused = !userPaused; syncToggle(); };
  tabEls.forEach((t, i) => t.addEventListener("click", () => go(i)));
  tabs.addEventListener("keydown", (e) => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!d) return;
    e.preventDefault(); go(idx + d); tabEls[idx].focus();
  });
  stage.addEventListener("keydown", (e) => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (d) { e.preventDefault(); go(idx + d); slides[idx].focus(); }
  });
  [stage, tabs].forEach((el) => {
    el.addEventListener("mouseenter", () => (hover = true));
    el.addEventListener("mouseleave", () => (hover = false));
  });
  root.addEventListener("focusin", () => (focusIn = true));
  root.addEventListener("focusout", (e) => { if (!root.contains(e.relatedTarget)) focusIn = false; });

  // 触摸 / 鼠标拖拽切换
  let sx = null, sy = 0, dragged = false;
  stage.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; dragged = false; });
  stage.addEventListener("pointerup", (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { dragged = true; go(idx + (dx < 0 ? 1 : -1)); }
    sx = null;
  });
  stage.addEventListener("click", (e) => { if (dragged) { e.preventDefault(); dragged = false; } }, true);

  if (picks.length < 2) root.querySelector(".ctrl").hidden = tabs.hidden = true;
  go(0); syncToggle(); requestAnimationFrame(tick);
})();

/* ---------- 全部游戏：筛选 & 搜索 ---------- */
function card(g) {
  return `<a class="card" href="${esc(g.url)}" target="_blank" rel="noopener" style="--c:${g.colors[0]}" data-id="${esc(g.id)}">
    ${cover(g)}
    <div class="body">
      <h3>${esc(g.title)}<span class="en">${esc(g.en || "")}</span></h3>
      <p>${esc(g.desc)}</p>
      ${tagsHtml(g)}
      <div class="meta"><span>原作上线 ${esc(g.added)}</span><span class="play">${g.preview ? "查看封面" : "开始游戏"}</span></div>
    </div>
  </a>`;
}

let cat = "全部";
const chips = $("#chips");
chips.innerHTML = ["全部", ...cats].map((c) =>
  `<button class="chip" type="button" data-cat="${esc(c)}" aria-pressed="${c === cat}">${esc(c)}</button>`).join("");
chips.addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (!b) return;
  cat = b.dataset.cat;
  chips.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", x === b));
  render();
});
let genre = "全部";
const genreBox = $("#genres");
const genreCount = (n) => GAMES.filter((g) => g.genre === n).length;
genreBox.innerHTML = [{ name: "全部", desc: "全部类型" }, ...GENRES.filter((x) => genreCount(x.name))].map((x) =>
  `<button class="chip" type="button" data-genre="${esc(x.name)}" title="${esc(x.desc)}" aria-pressed="${x.name === genre}">${esc(x.name)}${x.en ? `<i>${esc(x.en)}</i>` : ""}<b>${x.en ? genreCount(x.name) : GAMES.length}</b></button>`).join("");
genreBox.addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (!b) return;
  genre = b.dataset.genre;
  genreBox.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", x === b));
  render();
});
$("#search").addEventListener("input", render);

function render() {
  if (!GAMES.length) {
    $(".toolbar").hidden = true;
    genreBox.hidden = true;
    $("#count").textContent = "0";
    $("#grid").innerHTML = '<div class="empty">首款游戏开发中。</div>';
    return;
  }

  const q = $("#search").value.trim().toLowerCase();
  const list = sorted.filter((g) =>
    (cat === "全部" || g.category === cat) &&
    (genre === "全部" || g.genre === genre) &&
    (!q || [g.title, g.en, g.desc, g.genre, ...g.tags].join(" ").toLowerCase().includes(q)));
  $("#count").textContent = `${list.length} / ${GAMES.length}`;
  $("#grid").innerHTML = list.length ? list.map(card).join("") : '<div class="empty">没有找到匹配的游戏，换个关键词试试？</div>';
}
render();
