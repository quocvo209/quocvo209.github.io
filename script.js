const grid = document.getElementById("project-grid");
const filters = document.getElementById("filters");
const count = document.getElementById("project-count");
const modal = document.getElementById("video-modal");
const frame = document.getElementById("video-frame");
const menuToggle = document.getElementById("menu-toggle");
const heroReel = document.getElementById("hero-reel");
const heroReelImage = document.getElementById("hero-reel-image");
const heroReelCaption = document.getElementById("hero-reel-caption");
const nav = document.querySelector(".nav");
document.getElementById("year").textContent = new Date().getFullYear();

let projects = [];
let activeFilter = "All";

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}
function videoEmbed(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}?autoplay=1`;
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.includes("/embed/")) return `${url}${url.includes("?") ? "&" : "?"}autoplay=1`;
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      if (/^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return url;
  } catch { return url; }
}
function openVideo(url) {
  if (!url) return;
  frame.src = videoEmbed(url);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}
function closeVideo() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  frame.src = "";
  document.body.classList.remove("no-scroll");
}
document.getElementById("modal-close").addEventListener("click", closeVideo);
modal.addEventListener("click", event => { if (event.target === modal) closeVideo(); });
window.addEventListener("keydown", event => { if (event.key === "Escape") closeVideo(); });
menuToggle.addEventListener("click", () => {
  const opened = nav.classList.toggle("mobile-open");
  menuToggle.setAttribute("aria-expanded", String(opened));
  menuToggle.textContent = opened ? "×" : "☰";
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("mobile-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));

function renderHero() {
  const featured = projects.find(project => project && project.published !== false && (project.featured === true || project.featured === "true"))
    || projects.find(project => project && project.published !== false);
  if (!featured) return;
  const title = safeText(featured.title || "Dự án tiêu biểu");
  const thumbnail = String(featured.thumbnail || "").trim();
  const video = String(featured.video_url || "").trim();
  heroReelCaption.textContent = title + (featured.category ? " — " + featured.category : "");
  heroReel.setAttribute("aria-label", video ? "Phát " + title : "Xem " + title);
  if (thumbnail) {
    const image = document.createElement("img");
    image.src = thumbnail;
    image.alt = title;
    image.loading = "eager";
    image.onerror = () => { image.remove(); };
    heroReelImage.replaceChildren(image);
  }
  if (video) {
    heroReel.href = video;
    heroReel.addEventListener("click", event => { event.preventDefault(); openVideo(video); });
    document.getElementById("hero-reel-play").textContent = "▶";
  } else {
    heroReel.href = "#work";
  }
}

function renderProjects() {
  const visible = projects.filter(project => activeFilter === "All" || project.category === activeFilter);
  count.textContent = String(visible.length);
  if (!visible.length) {
    const isAll = activeFilter === "All";
    grid.innerHTML = `<div class="empty-state"><strong>${isAll ? "Dự án tiếp theo của bạn sẽ xuất hiện ở đây." : "Chưa có dự án nào trong danh mục này."}</strong>${isAll ? "Hãy thêm dự án đầu tiên từ CMS. Sau khi lưu, dự án sẽ tự động hiển thị tại đây." : "Hãy chọn danh mục khác để xem thêm dự án."}<br>${isAll ? '<a href="https://app.pagescms.org/" target="_blank" rel="noopener">Mở CMS quản lý dự án ↗</a>' : ""}</div>`;
    return;
  }
  grid.innerHTML = visible.map(project => {
    const title = safeText(project.title || "Dự án chưa đặt tên");
    const category = safeText(project.category || "Khác");
    const description = safeText(project.description || "");
    const thumbnail = safeText(project.thumbnail || "");
    const video = safeText(project.video_url || "");
    const year = safeText(project.year || "");
    const thumb = thumbnail ? `<img src="${thumbnail}" alt="${title}" loading="lazy">` : `<div class="thumb-placeholder" aria-label="${title}"></div>`;
    return `<article class="project-card">
      <a class="project-thumb" href="${video || "#contact"}" data-video="${video}" aria-label="Xem ${title}">
        ${thumb}${video ? '<span class="play-mark" aria-hidden="true">▶</span>' : ""}
      </a>
      <div class="project-meta"><div><h3 class="project-title">${title}</h3><p class="project-description">${description}</p></div><span class="project-category">${category}${year ? " · " + year : ""}</span></div>
    </article>`;
  }).join("");
  grid.querySelectorAll("[data-video]").forEach(link => link.addEventListener("click", event => {
    const url = link.getAttribute("data-video");
    if (url) { event.preventDefault(); openVideo(url); }
  }));
}
filters.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  filters.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
  renderProjects();
}));
fetch("content/projects.json")
  .then(response => { if (!response.ok) throw new Error("Could not load projects"); return response.json(); })
  .then(data => { projects = Array.isArray(data) ? data.filter(item => item && item.published !== false) : []; renderHero(); renderProjects(); })
  .catch(() => { grid.innerHTML = '<div class="empty-state"><strong>Không thể tải dự án.</strong>Vui lòng kiểm tra file <code>content/projects.json</code> đã có trong repository.</div>'; });
