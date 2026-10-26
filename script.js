const $ = (selector) => document.querySelector(selector);
const grid = $("#project-grid"), filters = $("#filters"), count = $("#project-count");
const modal = $("#video-modal"), frame = $("#video-frame"), nav = $("#nav"), menuToggle = $("#menu-toggle");
const heroReel = $("#hero-reel"), heroReelImage = $("#hero-reel-image"), heroCaption = $("#hero-reel-caption");
let projects = [], activeFilter = "All", btsItems = [];
$("#year").textContent = new Date().getFullYear();

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function videoEmbed(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1).split("/")[0]}?autoplay=1&rel=0`;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.includes("/embed/")) return `${url}${url.includes("?") ? "&" : "?"}autoplay=1`;
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (/^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return url;
  } catch { return url; }
}
function openVideo(url) {
  if (!url) return;
  frame.src = videoEmbed(url);
  modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); document.body.classList.add("no-scroll");
}
function closeVideo() {
  modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); frame.src=""; document.body.classList.remove("no-scroll");
}
$("#modal-close").addEventListener("click", closeVideo);
modal.addEventListener("click", e => { if (e.target === modal) closeVideo(); });
window.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeVideo(); closeLightbox(); }
});
menuToggle.addEventListener("click", () => {
  const opened = nav.classList.toggle("mobile-open");
  menuToggle.setAttribute("aria-expanded", String(opened)); menuToggle.textContent = opened ? "×" : "☰";
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("mobile-open"); menuToggle.setAttribute("aria-expanded","false"); menuToggle.textContent="☰";
}));
function renderHero() {
  const featured = projects.find(p => p.featured === true || p.featured === "true") || projects[0];
  if (!featured) { heroCaption.textContent = "SELECTED WORKS — ADD A FEATURED PROJECT IN CMS"; return; }
  heroCaption.textContent = `${featured.title || "Selected project"}${featured.category ? " — " + featured.category : ""}`;
  if (featured.thumbnail) {
    const img = document.createElement("img"); img.src = featured.thumbnail; img.alt = featured.title || "Featured project"; img.loading = "eager";
    img.onerror = () => img.remove(); heroReelImage.replaceChildren(img);
  }
  heroReel.setAttribute("aria-label", featured.video_url ? `Phát ${featured.title}` : "Xem dự án nổi bật");
  heroReel.onclick = () => featured.video_url ? openVideo(featured.video_url) : document.querySelector("#work").scrollIntoView({behavior:"smooth"});
  $("#hero-reel-play").textContent = featured.video_url ? "▶" : "↘";
}
function renderProjects() {
  const visible = projects.filter(p => activeFilter === "All" || p.category === activeFilter);
  count.textContent = visible.length;
  if (!visible.length) {
    grid.innerHTML = `<div class="empty-state"><strong>${activeFilter === "All" ? "Chưa có dự án nào." : "Chưa có dự án trong mục này."}</strong><p>${activeFilter === "All" ? "Thêm dự án trong Pages CMS để tự động hiển thị tại đây." : "Hãy chọn một danh mục khác."}</p><a href="https://app.pagescms.org/" target="_blank" rel="noreferrer">Mở Pages CMS ↗</a></div>`;
    return;
  }
  grid.innerHTML = visible.map(p => {
    const title = safeText(p.title || "Untitled project"), category = safeText(p.category || "Other");
    const description = safeText(p.description || ""), thumbnail = safeText(p.thumbnail || ""), year = safeText(p.year || "");
    const image = thumbnail ? `<img src="${thumbnail}" alt="${title}" loading="lazy">` : `<div class="thumb-placeholder">ADD COVER IN CMS</div>`;
    return `<article class="project-card"><a href="${p.video_url ? "#" : "#contact"}" class="project-thumb" data-video="${safeText(p.video_url || "")}" aria-label="Xem ${title}">${image}${p.video_url ? '<span class="play-mark">▶</span>' : ""}</a><div class="project-meta"><div><h3 class="project-title">${title}</h3><p class="project-description">${description}</p></div><span class="project-category">${category}${year ? " · " + year : ""}</span></div></article>`;
  }).join("");
  grid.querySelectorAll("[data-video]").forEach(a => a.addEventListener("click", e => {
    const url = a.getAttribute("data-video"); if (url) { e.preventDefault(); openVideo(url); }
  }));
}
filters.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  filters.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b === button));
  renderProjects();
}));
async function loadProjects() {
  try {
    const response = await fetch("content/projects.json");
    if (!response.ok) throw new Error("Projects file not found");
    const data = await response.json();
    projects = Array.isArray(data) ? data.filter(p => p && p.published !== false) : [];
    renderHero(); renderProjects();
  } catch (error) {
    grid.innerHTML = `<div class="empty-state"><strong>Chưa tải được dữ liệu dự án.</strong><p>Kiểm tra file content/projects.json và đảm bảo website đã publish đúng branch.</p></div>`;
  }
}
function closeLightbox() { $("#lightbox").classList.remove("open"); $("#lightbox").setAttribute("aria-hidden","true"); $("#lightbox-image").src=""; document.body.classList.remove("no-scroll"); }
function openLightbox(src, alt) { $("#lightbox-image").src=src; $("#lightbox-image").alt=alt; $("#lightbox").classList.add("open"); $("#lightbox").setAttribute("aria-hidden","false"); document.body.classList.add("no-scroll"); }
$("#lightbox-close").addEventListener("click", closeLightbox);
$("#lightbox").addEventListener("click", e => { if (e.target === $("#lightbox")) closeLightbox(); });
async function loadBTS() {
  const btsGrid = $("#bts-grid");
  try {
    const response = await fetch("content/bts.json");
    if (!response.ok) throw new Error("BTS file not found");
    const data = await response.json();
    btsItems = Array.isArray(data) ? data.filter(p => p && p.published !== false && p.image) : [];
    if (!btsItems.length) { btsGrid.innerHTML = '<div class="empty-state">Chưa có ảnh hậu trường. Bạn có thể thêm ảnh, tiêu đề và ngày quay trong Pages CMS.</div>'; return; }
    btsGrid.innerHTML = btsItems.map((p,i) => `<article class="bts-card" tabindex="0" role="button" data-bts="${i}" aria-label="Xem ảnh ${safeText(p.title || "Behind the scenes")}"><img src="${safeText(p.image)}" alt="${safeText(p.title || "Behind the scenes")}" loading="lazy"><div class="bts-caption">${safeText(p.title || "Behind the scenes")}${p.date ? `<span class="bts-date">${safeText(p.date)}</span>` : ""}</div></article>`).join("");
    btsGrid.querySelectorAll("[data-bts]").forEach(card => {
      const show = () => { const p = btsItems[Number(card.dataset.bts)]; if (p) openLightbox(p.image, p.title || "Behind the scenes"); };
      card.addEventListener("click", show); card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(); } });
    });
  } catch (e) { btsGrid.innerHTML = '<div class="empty-state">Không tải được gallery. Kiểm tra file content/bts.json.</div>'; }
}
loadProjects(); loadBTS();
