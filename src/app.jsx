        const { useState, useEffect, useRef } = React;

        const ICONS = {
            play: <polygon points="6 3 20 12 6 21 6 3" />,
            x: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
            menu: <><line x1="4" x2="20" y1="7" y2="7" /><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="17" y2="17" /></>,
            arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
            phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
            mail: <><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>
        };
        const Icon = ({ name, className = "w-5 h-5" }) => (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
        );

        // Hiệu ứng hiện dần khi cuộn tới
        function Reveal({ children, className = '', delay = 0 }) {
            const ref = useRef(null);
            const [on, setOn] = useState(EDIT_MODE);
            useEffect(() => {
                if (on) return;
                const el = ref.current;
                if (!el || !('IntersectionObserver' in window)) { setOn(true); return; }
                const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.1 });
                io.observe(el);
                return () => io.disconnect();
            }, []);
            return <div ref={ref} className={`rv ${on ? 'in' : ''} ${className}`} style={{ transitionDelay: delay + 'ms' }}>{children}</div>;
        }

        const SectionHead = ({ eyebrow, title, sub, center }) => (
            <div className={center ? 'text-center max-w-2xl mx-auto' : ''}>
                {eyebrow && <span className="inline-block text-xs font-bold tracking-[.25em] uppercase text-gold-light mb-3">{eyebrow}</span>}
                <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">{title}</h2>
                {sub && <p className="mt-4 text-white/55 leading-relaxed">{sub}</p>}
            </div>
        );

        const parseYoutubeUrl = (inputUrl) => {
            if (!inputUrl) return { embedUrl: '' };
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = inputUrl.match(regExp);
            if (match && match[2].length === 11) {
                const videoId = match[2];
                return {
                    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
                };
            }
            return { embedUrl: inputUrl };
        };

        const asset = (p) => {
            if (!p) return '';
            let s = String(p).trim();
            if (/^(https?:)?\/\//i.test(s) || s.startsWith('data:')) return s;
            if (s.startsWith('/')) s = s.slice(1);
            try { return encodeURI(decodeURI(s)); } catch (e) { return s; }
        };

        /* ---- Cấu hình hiển thị ---- */
        const PAGE_SIZE = 6;        // số video hiện ban đầu, và mỗi lần bấm "Xem thêm"
        const ALBUM_PAGE_SIZE = 6;  // số album BTS hiện ban đầu, và mỗi lần bấm "Xem thêm"

        // Chấp nhận thêm link YouTube Shorts / Live
        const cleanYoutube = (u) => String(u || '').trim().replace(/youtube\.com\/(?:shorts|live)\//, 'youtube.com/embed/');

        // Thêm hàng loạt: mỗi dòng là  "link"  hoặc  "Tên | link"  hoặc  "Tên | link | Danh mục"
        const parseBulkLinks = (text, defaultCat) => String(text || '')
            .split(/\r?\n/).map(l => l.trim()).filter(Boolean)
            .map(line => {
                const parts = line.split('|').map(x => x.trim()).filter(Boolean);
                const url = parts.find(x => /^(https?:\/\/|www\.|youtu)/i.test(x));
                if (!url) return null;
                const rest = parts.filter(x => x !== url);
                return { url: /^https?:\/\//i.test(url) ? url : 'https://' + url, title: rest[0] || '', category: rest[1] || defaultCat || '' };
            })
            .filter(Boolean);

        const normalizeProject = (p, i) => {
            const url = cleanYoutube(p.url);
            const m = url.match(/(?:youtu\.be\/|embed\/|watch\?v=|&v=|v\/)([\w-]{11})/);
            return {
                id: i,
                key: m ? m[1] : 'p' + i,
                vid: m ? m[1] : '',
                short: /youtube\.com\/(?:embed|shorts)\//.test(String(p.url || '')) && /shorts\//.test(String(p.url || '')),
                title: p.title || '',
                category: p.category || 'Khác',
                desc: p.desc || '',
                url: parseYoutubeUrl(url).embedUrl,
                thumbnail: p.thumbnail ? asset(p.thumbnail) : (m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : '')
            };
        };

        // Một album BTS = 1 ảnh đại diện + nhiều ảnh bên trong
        const normalizeAlbum = (a, i) => {
            const images = toList(a.images).filter(Boolean).map(asset);
            const cover = a.cover ? asset(a.cover) : (images[0] || '');
            return {
                id: i,
                title: a.title || '',
                category: a.category || '',
                desc: a.desc || '',
                cover,
                images: images.length ? images : (cover ? [cover] : [])
            };
        };

        const loadData = (file, key) =>
            fetch(file, { cache: 'no-cache' })
                .then(r => r.ok ? r.json() : Promise.reject(new Error(r.status)))
                .then(d => Array.isArray(d[key]) ? d[key] : [])
                .catch(err => { console.warn('Không tải được ' + file, err); return []; });

        const defaultSite = {
            hero: { badge: "Videographer & Editor • TP. Hồ Chí Minh", title: "QUỐC VÕ PRODUCTION", description: "Quay – Dựng – Chỉnh màu cho TVC, MV, quảng cáo và nội dung mạng xã hội. Hình ảnh giàu cảm xúc, câu chuyện rõ ràng, giao đúng hẹn.", image: "", showreel: "" },
            about: { badge: "Giới thiệu bản thân", heading: "Kể chuyện bằng hình ảnh & góc máy tinh tế", paragraph: "Chào bạn, mình là **Quốc Võ** — Videographer & Editor tại TP.HCM.", stat1_number: "04+", stat1_label: "Năm kinh nghiệm", stat2_number: "100+", stat2_label: "Dự án hoàn thành", image: "", image_name: "Quốc Võ", image_role: "Videographer & Colorist", image_location: "TP. Hồ Chí Minh", skills: ["Quay phim", "Dựng phim", "Color Grading", "Motion Graphic", "Storytelling"] },
            contact: { description: "Bạn có dự án mới cần quay dựng hoặc chỉnh màu? Nhắn mình qua Zalo hoặc Facebook, mình phản hồi trong ngày.", zalo_label: "Zalo: +84 707068508", zalo_url: "https://zalo.me/84707068508", facebook_label: "Facebook: Quốc Võ", facebook_url: "https://www.facebook.com/quocvo20.09/", phone: "0707 068 508", email: "" }
        };

        const renderBold = (t) => String(t || '').split(/\*\*(.+?)\*\*/g).map((x, i) => i % 2 ? <strong key={i}>{x}</strong> : x);

        const toList = (v) => Array.isArray(v) ? v : (v ? [v] : []);

        const loadObject = (file) =>
            fetch(file, { cache: 'no-cache' })
                .then(r => r.ok ? r.text() : Promise.reject(new Error(r.status)))
                .then(t => t.trim() ? JSON.parse(t) : {})
                .catch(err => { console.warn('Không tải được ' + file, err); return {}; });

        /* =====================================================================
           LOGO THƯƠNG HIỆU (SVG chuẩn, không dùng icon thay thế)
           ===================================================================== */
        const ZaloLogo = ({ className = "w-7 h-7" }) => (
            <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
                <rect width="48" height="48" rx="11" fill="#0068FF" />
                <text x="24" y="30.5" textAnchor="middle" fontFamily="'Be Vietnam Pro', Arial, sans-serif" fontWeight="800" fontSize="16.5" fill="#fff" letterSpacing="-0.3">Zalo</text>
            </svg>
        );

        const FacebookLogo = ({ className = "w-7 h-7", onBlue = false }) => (
            <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="12" fill={onBlue ? '#fff' : '#1877F2'} />
                <path fill={onBlue ? '#1877F2' : '#fff'} d="M16.67 15.47l.53-3.47h-3.33V9.75c0-.95.47-1.88 1.96-1.88h1.51V4.92s-1.37-.23-2.68-.23c-2.74 0-4.53 1.66-4.53 4.67V12H7.08v3.47h3.05V24h3.74v-8.53z" />
            </svg>
        );

        const DaVinciLogo = ({ className = "w-full h-full" }) => (
            <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
                <defs>
                    <linearGradient id="dvRing" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#f2f2f2" />
                        <stop offset="1" stopColor="#7c828c" />
                    </linearGradient>
                </defs>
                <path fill="url(#dvRing)" d="M17.621 0L5.977.004c-1.37 0-2.756.345-3.762 1.11a4.9 4.9 0 0 0-1.61 2.003C.233 3.93 0 5.02 0 5.951l.012 12.2c.002 1.604.479 3.057 1.461 4.112c.984 1.056 2.462 1.683 4.331 1.691L16.856 24c1.26.005 3.095-.036 4.303-.714c1.075-.605 2.025-1.556 2.497-2.984c.278-.84.345-2.084.344-3.147l-.021-11.13c-.002-.888-.15-2.023-.547-2.934c-.425-.976-1.181-1.815-2.322-2.425C20.353.26 19.123 0 17.622 0zm0 .93c1.378 0 2.538.295 3.04.565c.977.523 1.544 1.166 1.889 1.96c.315.721.47 1.793.473 2.572l.018 11.13c.002 1.013-.097 2.257-.298 2.86c-.396 1.202-1.146 1.946-2.063 2.462c-.814.457-2.612.593-3.82.588l-11.05-.044c-1.657-.007-2.832-.534-3.626-1.386c-.792-.851-1.212-2.06-1.212-3.485L.999 5.95c0-.829.196-1.827.474-2.437c.345-.757.75-1.207 1.365-1.674C3.585 1.27 4.868.97 6.08.97z" />
                <path fill="#ff5a4e" d="M11.961 4.353c-1.976.089-3.204 1.658-3.214 3.29c.019 1.443 1.635 3.481 2.884 4.53c.12.099.154.109.33.18c.062.025.198-.047.327-.135c.36-.245.993-.947 1.648-1.738a7.7 7.7 0 0 0 1.031-1.683c.409-.89.261-1.599.235-1.888a4 4 0 0 0-.99-1.692a3.36 3.36 0 0 0-2.251-.864z" />
                <path fill="#3d9bff" d="M16.133 12.275a10.2 10.2 0 0 0-3.244.61c-.15.058-.26.1-.374.17c-.057.036-.11.135-.105.292c.017.433.29 1.278.624 2.27c.384 1.135 1.066 2.27 1.844 2.74a3.23 3.23 0 0 0 2.53.342c.832-.243 1.595-.868 1.962-1.546c.986-1.818.19-3.548-1.121-4.417c-.447-.296-1.133-.445-1.89-.46z" />
                <path fill="#3ad07d" d="M7.701 12.313a6 6 0 0 0-.752.047c-.596.078-.932.273-1.29.51a3.18 3.18 0 0 0-1.365 1.979c-.075.552-.086 1.053.033 1.507c.433 1.389 1.326 2.222 2.847 2.452c.636.028 1.37-.063 1.99-.45c1.269-.782 2.08-3.17 2.412-4.742c.053-.176.035-.357-.013-.42c-.005-.067-.044-.113-.19-.183c-.398-.192-1.32-.417-2.375-.6a7.7 7.7 0 0 0-1.297-.1z" />
            </svg>
        );

        const CapCutLogo = ({ className = "w-full h-full" }) => (
            <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="#fff" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.998 12L2 16c0 1.886 0 2.328.586 2.914S4.114 19.5 6 19.5h8c1.886 0 2.828 0 3.414-.586S18 17.886 18 16m-8.002-4l11.998-6M9.998 12L2 8c0-1.386 0-2.328.586-2.914S4.114 4.5 6 4.5h8c1.886 0 2.828 0 3.414.586S18 6.614 18 8m-8.002 4l11.998 6" />
            </svg>
        );

        /* =====================================================================
           CHẾ ĐỘ CHỈNH SỬA HÌNH ẢNH
           Mở web với đuôi ?edit  (vd: https://quocvo209.github.io/?edit)
           - Kéo ảnh để di chuyển, thanh trượt để phóng to/thu nhỏ
           - Kéo thanh vàng ở cạnh khung để đổi chiều cao / chiều rộng khung ảnh
           - Tab "Ảnh nền": kéo, đổi cỡ, xoay, chỉnh độ mờ từng ảnh nền
           - Bấm "Lưu lên web" để mọi người nhìn thấy bố cục mới
           ===================================================================== */
        const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
        const round = (v, n = 4) => Math.round(v * Math.pow(10, n)) / Math.pow(10, n);
        const LS = {
            get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
            set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
            del(k) { try { localStorage.removeItem(k); } catch (e) {} }
        };
        const EDIT_MODE = /[?&]edit(=|&|$)/.test(location.search) || location.hash === '#edit';
        const DRAFT_KEY = 'qv_layout_draft_v1';
        const TOKEN_KEY = 'qv_gh_token';
        const normLayout = (d) => ({
            images: (d && d.images && typeof d.images === 'object') ? d.images : {},
            backgrounds: (d && d.backgrounds && typeof d.backgrounds === 'object') ? d.backgrounds : {}
        });

        const EditCtx = React.createContext({
            editing: false, mode: 'image', layout: { images: {}, backgrounds: {} },
            setImageCfg: () => {}, setBgCfg: () => {}, selected: null, setSelected: () => {}
        });

        const bgDefaults = (i, n) => ({
            x: i % 2 === 0 ? 14 : 86,
            y: clamp(8 + ((i + 0.5) / Math.max(n, 1)) * 84, 5, 95),
            w: 26, opacity: 0.18, blur: 0, feather: 18, rotate: 0, z: i
        });
        const bgCfgOf = (item, i, n, layout) => ({ ...bgDefaults(i, n), ...(layout.backgrounds[item.key] || {}) });

        /* ---------- Khung ảnh có thể kéo / thu phóng / đổi kích thước ---------- */
        function EditableImage({ id, src, alt = '', eager = false, wrapClass = '', frameClass = 'aspect-[16/9]', imgClass = '', canResizeWidth = false, children }) {
            const { editing, mode, layout, setImageCfg, selected, setSelected } = React.useContext(EditCtx);
            const saved = layout.images[id];
            const [live, setLive] = useState(null);
            const liveRef = useRef(null);
            const drag = useRef(null);
            const wrapRef = useRef(null);
            const frameRef = useRef(null);
            const imgRef = useRef(null);
            const [size, setSize] = useState({ w: 0, h: 0 });
            const [nat, setNat] = useState({ w: 0, h: 0 });

            const cfg = live || saved || null;
            const active = editing && mode === 'image';
            const isSel = active && selected === id;
            const c = { zoom: 1, ox: 0.5, oy: 0.5, ...(cfg || {}) };
            const align = c.align || 'center';

            useEffect(() => {
                const el = frameRef.current;
                if (!el) return;
                const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
                update();
                if (!window.ResizeObserver) {
                    window.addEventListener('resize', update);
                    return () => window.removeEventListener('resize', update);
                }
                const ro = new ResizeObserver(update);
                ro.observe(el);
                return () => ro.disconnect();
            }, []);

            useEffect(() => {
                const im = imgRef.current;
                if (im && im.complete && im.naturalWidth) setNat({ w: im.naturalWidth, h: im.naturalHeight });
            }, [src]);

            // Hình học của ảnh trong khung: phóng to theo "cover" x zoom, ox/oy = vị trí (0..1) trong phần ảnh dư ra
            let geom = null;
            if ((cfg || active) && size.w && size.h && nat.w) {
                const base = Math.max(size.w / nat.w, size.h / nat.h);
                geom = { W: nat.w * base * c.zoom, H: nat.h * base * c.zoom };
            }
            const imgStyle = geom
                ? { position: 'absolute', maxWidth: 'none', width: geom.W, height: geom.H, left: -(geom.W - size.w) * c.ox, top: -(geom.H - size.h) * c.oy }
                : { width: '100%', height: '100%', objectFit: 'cover' };

            const wrapStyle = {};
            if (cfg && cfg.w) { wrapStyle.width = cfg.w + '%'; wrapStyle.maxWidth = 'none'; }
            const alignClass = align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto';
            const frameStyle = {};
            if (cfg && cfg.ar) frameStyle.aspectRatio = String(cfg.ar);
            if (isSel) frameStyle.touchAction = 'none';

            const setLiveBoth = (v) => { liveRef.current = v; setLive(v); };

            const onFrameDown = (e) => {
                if (!active) return;
                if (e.button !== undefined && e.button !== 0) return;
                e.stopPropagation();
                setSelected(id);
                if (!geom) return;
                try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
                drag.current = { type: 'pan', x: e.clientX, y: e.clientY, base: c, ovX: geom.W - size.w, ovY: geom.H - size.h };
            };

            const onHandleDown = (e, type) => {
                e.stopPropagation();
                if (e.button !== undefined && e.button !== 0) return;
                try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
                const wrapEl = wrapRef.current;
                const pe = wrapEl.parentElement;
                const cs = getComputedStyle(pe);
                const pw = pe.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
                drag.current = { type, x: e.clientX, y: e.clientY, base: c, h0: size.h, fw: size.w, w0: wrapEl.getBoundingClientRect().width, pw };
            };

            const onMove = (e) => {
                const d = drag.current;
                if (!d) return;
                const dx = e.clientX - d.x, dy = e.clientY - d.y;
                if (d.type === 'pan') {
                    setLiveBoth({
                        ...d.base,
                        ox: d.ovX > 1 ? round(clamp(d.base.ox - dx / d.ovX, 0, 1)) : d.base.ox,
                        oy: d.ovY > 1 ? round(clamp(d.base.oy - dy / d.ovY, 0, 1)) : d.base.oy
                    });
                } else if (d.type === 'h') {
                    const nh = clamp(d.h0 + dy, 80, 1600);
                    setLiveBoth({ ...d.base, ar: round(d.fw / nh) });
                } else if (d.type === 'w') {
                    const sign = align === 'right' ? -1 : 1;
                    const grow = (align === 'center' ? 2 : 1) * sign * dx;
                    setLiveBoth({ ...d.base, w: round(clamp(((d.w0 + grow) / d.pw) * 100, 20, 100), 1) });
                }
            };

            const onUp = () => {
                if (!drag.current) return;
                drag.current = null;
                if (liveRef.current) setImageCfg(id, liveRef.current);
                setLiveBoth(null);
            };

            const setZoom = (z) => setImageCfg(id, { ...c, zoom: round(clamp(z, 1, 4), 3) });
            const setAlign = (a) => setImageCfg(id, { ...c, align: a });
            const sideLeft = align === 'right';

            const outline = !active ? '' : isSel
                ? 'outline outline-2 outline-gold outline-offset-2'
                : 'outline outline-2 outline-dashed outline-gold/60 outline-offset-2 hover:outline-gold';

            return (
                <div ref={wrapRef} className={`${wrapClass} ${alignClass}`} style={wrapStyle}>
                    <div
                        ref={frameRef}
                        className={`relative overflow-hidden ${frameClass} ${outline} ${active ? 'select-none' : ''}`}
                        style={{ ...frameStyle, cursor: active ? (isSel ? 'grab' : 'pointer') : undefined }}
                        onPointerDown={onFrameDown}
                        onPointerMove={onMove}
                        onPointerUp={onUp}
                        onPointerCancel={onUp}
                    >
                        <img
                            ref={imgRef}
                            loading={eager ? 'eager' : 'lazy'}
                            decoding="async"
                            onError={(e) => { e.target.style.visibility = 'hidden'; }}
                            src={src || undefined}
                            alt={alt}
                            draggable={false}
                            onLoad={(e) => setNat({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
                            className={`${active ? 'pointer-events-none' : imgClass}`}
                            style={imgStyle}
                        />
                        {children}

                        {isSel && (
                            <>
                                <div
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className="absolute top-2 left-2 z-30 flex items-center gap-1.5 bg-espresso-900/90 text-white text-[11px] rounded-xl px-2.5 py-1.5 shadow-lg backdrop-blur"
                                    style={{ cursor: 'default' }}
                                >
                                    <button type="button" onClick={() => setZoom(c.zoom - 0.1)} className="w-6 h-6 rounded-md bg-white/15 hover:bg-white/30 text-base leading-none">−</button>
                                    <input type="range" min="1" max="4" step="0.02" value={c.zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-20 sm:w-28" style={{ accentColor: '#C49747' }} />
                                    <button type="button" onClick={() => setZoom(c.zoom + 0.1)} className="w-6 h-6 rounded-md bg-white/15 hover:bg-white/30 text-base leading-none">+</button>
                                    <span className="tabular-nums w-8 text-center">{c.zoom.toFixed(1)}×</span>
                                    {canResizeWidth && ['left', 'center', 'right'].map((a) => (
                                        <button key={a} type="button" onClick={() => setAlign(a)} className={`px-1.5 h-6 rounded-md ${align === a ? 'bg-gold' : 'bg-white/15 hover:bg-white/30'}`}>
                                            {a === 'left' ? 'Trái' : a === 'right' ? 'Phải' : 'Giữa'}
                                        </button>
                                    ))}
                                    <button type="button" onClick={() => setImageCfg(id, null)} className="px-2 h-6 rounded-md bg-white/15 hover:bg-red-500/80">Đặt lại</button>
                                </div>
                                <div
                                    onPointerDown={(e) => onHandleDown(e, 'h')}
                                    title="Kéo lên/xuống để đổi chiều cao khung"
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-4 rounded-t-xl bg-gold shadow z-30 flex items-center justify-center"
                                    style={{ cursor: 'ns-resize', touchAction: 'none' }}
                                ><span className="w-8 h-0.5 bg-white/80 rounded"></span></div>
                                {canResizeWidth && (
                                    <div
                                        onPointerDown={(e) => onHandleDown(e, 'w')}
                                        title="Kéo sang trái/phải để đổi chiều rộng khung"
                                        className={`absolute top-1/2 -translate-y-1/2 h-20 w-4 bg-gold shadow z-30 flex items-center justify-center ${sideLeft ? 'left-0 rounded-r-xl' : 'right-0 rounded-l-xl'}`}
                                        style={{ cursor: 'ew-resize', touchAction: 'none' }}
                                    ><span className="h-8 w-0.5 bg-white/80 rounded"></span></div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            );
        }

        /* ---------- Ảnh nền trang trí (mờ nhẹ, tự do vị trí / kích thước) ---------- */
        function BgItem({ item, index, count }) {
            const { editing, mode, layout, setBgCfg, selected, setSelected } = React.useContext(EditCtx);
            const [live, setLive] = useState(null);
            const liveRef = useRef(null);
            const drag = useRef(null);
            const boxRef = useRef(null);
            const cfg = live || bgCfgOf(item, index, count, layout);
            const active = editing && mode === 'bg';
            const sid = 'bg:' + item.key;
            const isSel = active && selected === sid;

            const f = cfg.feather;
            const maskImg = f > 0
                ? `linear-gradient(to right, transparent 0, #000 ${f}%, #000 ${100 - f}%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 ${f}%, #000 ${100 - f}%, transparent 100%)`
                : 'none';

            const setLiveBoth = (v) => { liveRef.current = v; setLive(v); };

            const onDown = (e) => {
                if (!active) return;
                if (e.button !== undefined && e.button !== 0) return;
                e.stopPropagation();
                setSelected(sid);
                const layer = e.currentTarget.parentElement.getBoundingClientRect();
                try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
                drag.current = { type: 'move', x: e.clientX, y: e.clientY, base: cfg, lw: layer.width, lh: layer.height };
            };

            const onHandleDown = (e) => {
                e.stopPropagation();
                if (e.button !== undefined && e.button !== 0) return;
                setSelected(sid);
                const layer = boxRef.current.parentElement.getBoundingClientRect();
                try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
                const W0 = boxRef.current.offsetWidth, H0 = boxRef.current.offsetHeight || 1;
                drag.current = { type: 'size', x: e.clientX, y: e.clientY, base: cfg, lw: layer.width, W0, ratio: W0 / H0 };
            };

            const onMove = (e) => {
                const d = drag.current;
                if (!d) return;
                const dx = e.clientX - d.x, dy = e.clientY - d.y;
                if (d.type === 'move') {
                    setLiveBoth({ ...d.base, x: round(clamp(d.base.x + (dx / d.lw) * 100, -10, 110), 2), y: round(clamp(d.base.y + (dy / d.lh) * 100, -5, 105), 2) });
                } else {
                    const th = (d.base.rotate * Math.PI) / 180;
                    const lx = dx * Math.cos(th) + dy * Math.sin(th);
                    const ly = -dx * Math.sin(th) + dy * Math.cos(th);
                    const newW = Math.max(40, d.W0 + lx + ly * d.ratio);
                    setLiveBoth({ ...d.base, w: round(clamp((newW / d.lw) * 100, 3, 150), 2) });
                }
            };

            const onUp = () => {
                if (!drag.current) return;
                drag.current = null;
                if (liveRef.current) setBgCfg(item.key, liveRef.current);
                setLiveBoth(null);
            };

            return (
                <div
                    ref={boxRef}
                    onPointerDown={onDown}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={onUp}
                    className={active ? (isSel ? 'outline outline-2 outline-gold' : 'outline outline-2 outline-dashed outline-gold/60') : ''}
                    style={{
                        position: 'absolute', left: cfg.x + '%', top: cfg.y + '%', width: cfg.w + '%',
                        transform: `translate(-50%, -50%) rotate(${cfg.rotate}deg)`,
                        zIndex: cfg.z, pointerEvents: active ? 'auto' : 'none',
                        touchAction: isSel ? 'none' : 'auto', cursor: active ? (isSel ? 'move' : 'pointer') : 'default'
                    }}
                >
                    <img
                        src={item.src}
                        alt=""
                        draggable={false}
                        style={{
                            display: 'block', width: '100%', height: 'auto', pointerEvents: 'none', userSelect: 'none',
                            opacity: cfg.opacity, filter: cfg.blur ? `blur(${cfg.blur}px)` : undefined,
                            WebkitMaskImage: maskImg, maskImage: maskImg, WebkitMaskComposite: 'source-in', maskComposite: 'intersect'
                        }}
                    />
                    {isSel && (
                        <div
                            onPointerDown={onHandleDown}
                            title="Kéo để đổi kích thước"
                            className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-gold border-2 border-white shadow-lg"
                            style={{ cursor: 'nwse-resize', touchAction: 'none' }}
                        ></div>
                    )}
                </div>
            );
        }

        function BgLayer({ items }) {
            const { editing, mode } = React.useContext(EditCtx);
            if (!items.length) return null;
            const front = editing && mode === 'bg';
            return (
                <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: front ? 30 : 0 }} aria-hidden={!front}>
                    {items.map((it, i) => <BgItem key={it.key} item={it} index={i} count={items.length} />)}
                </div>
            );
        }

        /* ---------- Lưu layout lên GitHub (data/layout.json) ---------- */
        async function saveLayoutToGithub(token, json) {
            const host = location.hostname;
            const isGh = /\.github\.io$/.test(host);
            const owner = isGh ? host.split('.')[0] : 'quocvo209';
            const repo = isGh ? host : 'quocvo209.github.io';
            const url = `https://api.github.com/repos/${owner}/${repo}/contents/data/layout.json`;
            const headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' };
            let sha;
            const cur = await fetch(url, { headers });
            if (cur.ok) sha = (await cur.json()).sha;
            else if (cur.status === 401 || cur.status === 403) throw new Error('Token không đúng hoặc không có quyền ghi (cần quyền "Contents: Read and write").');
            else if (cur.status !== 404) throw new Error('GitHub báo lỗi ' + cur.status);
            const body = { message: 'Cập nhật bố cục hình ảnh (chỉnh trực tiếp trên web)', content: btoa(unescape(encodeURIComponent(json))) };
            if (sha) body.sha = sha;
            const put = await fetch(url, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (put.status === 401 || put.status === 403) throw new Error('Token không có quyền ghi vào repo này.');
            if (put.status === 404) throw new Error('Không tìm thấy repo ' + owner + '/' + repo + ' hoặc token chưa được cấp quyền cho repo này.');
            if (!put.ok) throw new Error('Lưu thất bại (mã ' + put.status + ').');
        }

        function PublishModal({ json, onClose, onSaved }) {
            const [token, setToken] = useState(LS.get(TOKEN_KEY) || '');
            const [st, setSt] = useState({ s: 'idle', msg: '' });
            const publish = async () => {
                const t = token.trim();
                if (!t) { setSt({ s: 'error', msg: 'Bạn chưa nhập token GitHub.' }); return; }
                setSt({ s: 'saving', msg: 'Đang lưu lên GitHub…' });
                try {
                    await saveLayoutToGithub(t, json);
                    LS.set(TOKEN_KEY, t);
                    if (onSaved) onSaved();
                    setSt({ s: 'ok', msg: 'Đã lưu! Web sẽ cập nhật cho mọi người sau khoảng 1–2 phút (GitHub Pages cần build lại).' });
                } catch (err) {
                    setSt({ s: 'error', msg: String(err.message || err) });
                }
            };
            const copy = async () => {
                try { await navigator.clipboard.writeText(json); setSt({ s: 'ok', msg: 'Đã sao chép JSON. Dán vào file data/layout.json trên GitHub rồi Commit.' }); }
                catch (e) { setSt({ s: 'error', msg: 'Không sao chép được. Hãy bấm vào ô JSON, Ctrl+A rồi Ctrl+C.' }); }
            };
            const download = () => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
                a.download = 'layout.json';
                a.click();
                setTimeout(() => URL.revokeObjectURL(a.href), 1000);
            };
            return (
                <div className="fixed inset-0 z-[80] bg-espresso-900/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-lg">Lưu bố cục lên web</h3>
                            <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-beige-100 hover:bg-red-100 text-lg leading-none">×</button>
                        </div>
                        <p className="text-sm text-espresso-800/80 mb-3">
                            Dán <b>GitHub token</b> một lần duy nhất (lưu trong trình duyệt của bạn). Lần sau chỉ cần bấm nút Lưu.
                        </p>
                        <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="github_pat_xxxxxxxx…" className="w-full border border-beige-300 rounded-xl px-3 py-2 text-sm mb-2" />
                        <p className="text-[11px] text-espresso-800/60 mb-4 leading-relaxed">
                            Tạo token: GitHub → Settings → Developer settings → Personal access tokens → <i>Fine-grained tokens</i> → chọn đúng repo <b>quocvo209.github.io</b> → Permissions → <b>Contents: Read and write</b>.
                        </p>
                        <button type="button" onClick={publish} disabled={st.s === 'saving'} className="w-full py-2.5 rounded-xl bg-gold text-white font-semibold hover:bg-gold-light disabled:opacity-60">
                            {st.s === 'saving' ? 'Đang lưu…' : 'Lưu lên web'}
                        </button>
                        {st.msg && <p className={`text-sm mt-3 ${st.s === 'error' ? 'text-red-600' : 'text-green-700'}`}>{st.msg}</p>}
                        <div className="border-t border-beige-200 mt-5 pt-4">
                            <p className="text-xs text-espresso-800/70 mb-2">Hoặc lưu thủ công: tải / sao chép nội dung bên dưới, dán vào file <code>data/layout.json</code> trên GitHub.</p>
                            <textarea readOnly value={json} onFocus={(e) => e.target.select()} className="w-full h-28 border border-beige-300 rounded-xl p-2 text-[11px] font-mono mb-2"></textarea>
                            <div className="flex gap-2">
                                <button type="button" onClick={copy} className="flex-1 py-2 rounded-xl bg-beige-100 hover:bg-beige-200 text-sm font-medium">Sao chép JSON</button>
                                <button type="button" onClick={download} className="flex-1 py-2 rounded-xl bg-beige-100 hover:bg-beige-200 text-sm font-medium">Tải layout.json</button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        const SliderRow = ({ label, value, min, max, step, unit = '', onChange }) => (
            <label className="flex items-center gap-2 text-xs">
                <span className="w-20 shrink-0 text-white/80">{label}</span>
                <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="flex-1 min-w-0" style={{ accentColor: '#C49747' }} />
                <span className="w-12 text-right tabular-nums">{Math.round(value * 100) / 100}{unit}</span>
            </label>
        );

        function EditorBar({ mode, setMode, dirty, bgItems, layout, selected, setBgCfg, onPublish, onDiscard }) {
            const selIdx = (mode === 'bg' && selected) ? bgItems.findIndex((b) => 'bg:' + b.key === selected) : -1;
            const sel = selIdx >= 0 ? bgItems[selIdx] : null;
            const cfg = sel ? bgCfgOf(sel, selIdx, bgItems.length, layout) : null;
            const upd = (patch) => setBgCfg(sel.key, { ...cfg, ...patch });
            const zs = bgItems.map((b, i) => bgCfgOf(b, i, bgItems.length, layout).z);
            // Bảng chỉnh nằm ở phía đối diện với ảnh đang chọn để không che ảnh
            const panelSide = cfg && cfg.x > 50 ? 'left-3' : 'right-3';
            return (
                <>
                    {sel && (
                        <div className={`fixed top-24 ${panelSide} z-[70] w-64 max-w-[calc(100vw-1.5rem)] bg-espresso-900/95 text-white rounded-2xl p-3 shadow-2xl space-y-1.5`} onPointerDown={(e) => e.stopPropagation()}>
                            <p className="text-[11px] font-bold text-gold-light pb-1">Chỉnh ảnh nền đang chọn</p>
                            <SliderRow label="Độ đậm" value={Math.round(cfg.opacity * 100)} min={3} max={100} step={1} unit="%" onChange={(v) => upd({ opacity: round(v / 100, 2) })} />
                            <SliderRow label="Làm nhòe" value={cfg.blur} min={0} max={40} step={1} unit="px" onChange={(v) => upd({ blur: v })} />
                            <SliderRow label="Viền mờ" value={cfg.feather} min={0} max={50} step={1} unit="%" onChange={(v) => upd({ feather: v })} />
                            <SliderRow label="Xoay" value={cfg.rotate} min={-180} max={180} step={1} unit="°" onChange={(v) => upd({ rotate: v })} />
                            <SliderRow label="Kích thước" value={cfg.w} min={3} max={150} step={0.5} unit="%" onChange={(v) => upd({ w: v })} />
                            <div className="flex flex-wrap gap-2 pt-1">
                                <button type="button" onClick={() => upd({ z: Math.max(...zs) + 1 })} className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/30 text-[11px]">Đưa lên trên</button>
                                <button type="button" onClick={() => upd({ z: Math.min(...zs) - 1 })} className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/30 text-[11px]">Đưa xuống dưới</button>
                                <button type="button" onClick={() => setBgCfg(sel.key, null)} className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-red-500/80 text-[11px]">Đặt lại ảnh này</button>
                            </div>
                        </div>
                    )}
                    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-1.5rem)] max-w-3xl flex flex-col gap-2" onPointerDown={(e) => e.stopPropagation()}>
                        {mode === 'bg' && bgItems.length === 0 && (
                            <div className="bg-espresso-900/95 text-white text-xs rounded-2xl p-3 shadow-2xl">
                                Chưa có ảnh nền nào. Vào CMS → <b>Ảnh nền trang trí</b> để tải ảnh lên (chọn nhiều ảnh cùng lúc được), rồi quay lại đây để sắp xếp.
                            </div>
                        )}
                        {mode === 'bg' && bgItems.length > 0 && !sel && (
                            <div className="bg-espresso-900/95 text-white text-xs rounded-2xl p-3 shadow-2xl">
                                Bấm vào một ảnh nền để chọn, kéo để di chuyển, kéo chấm vàng ở góc để đổi kích thước.
                            </div>
                        )}
                        <div className="bg-espresso-900 text-white rounded-2xl px-3 py-2.5 shadow-2xl flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-bold text-gold-light hidden sm:inline">Chế độ chỉnh sửa</span>
                            <div className="flex bg-white/10 rounded-xl p-0.5">
                                <button type="button" onClick={() => setMode('image')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'image' ? 'bg-gold text-white' : 'text-white/80 hover:bg-white/10'}`}>Ảnh trong trang</button>
                                <button type="button" onClick={() => setMode('bg')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'bg' ? 'bg-gold text-white' : 'text-white/80 hover:bg-white/10'}`}>Ảnh nền ({bgItems.length})</button>
                            </div>
                            <div className="flex-1"></div>
                            {dirty && <span className="text-[11px] text-amber-300">● Chưa lưu</span>}
                            <button type="button" onClick={onDiscard} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs">Hoàn tác</button>
                            <button type="button" onClick={onPublish} className="px-4 py-1.5 rounded-lg bg-gold hover:bg-gold-light text-white text-xs font-bold">Lưu lên web</button>
                            <a href={location.pathname} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs">Thoát</a>
                        </div>
                    </div>
                </>
            );
        }

        function App() {
            const [projectsRaw, setProjectsRaw] = useState([]);
            const [ytTitles, setYtTitles] = useState({});
            const [btsAlbums, setBtsAlbums] = useState([]);
            const [openAlbum, setOpenAlbum] = useState(null);
            const [photoIdx, setPhotoIdx] = useState(null);
            const [projLimit, setProjLimit] = useState(PAGE_SIZE);
            const [albumLimit, setAlbumLimit] = useState(ALBUM_PAGE_SIZE);
            const [bgItems, setBgItems] = useState([]);
            const [activeCategory, setActiveCategory] = useState('All');
            const [selectedProject, setSelectedProject] = useState(null);
            const [site, setSite] = useState(defaultSite);
            const [services, setServices] = useState([]);
            const [testimonials, setTestimonials] = useState([]);
            const [menuOpen, setMenuOpen] = useState(false);
            const [scrolled, setScrolled] = useState(false);
            useEffect(() => {
                const on = () => setScrolled(window.scrollY > 24);
                on(); window.addEventListener('scroll', on, { passive: true });
                return () => window.removeEventListener('scroll', on);
            }, []);

            // --- Chế độ chỉnh sửa hình ảnh (mở web với ?edit) ---
            const editing = EDIT_MODE;
            const [layout, setLayout] = useState({ images: {}, backgrounds: {} });
            const [selected, setSelected] = useState(null);
            const [mode, setModeState] = useState('image');
            const [dirty, setDirty] = useState(false);
            const [publishOpen, setPublishOpen] = useState(false);

            useEffect(() => {
                loadObject('data/projects.json').then(d => {
                    const detailed = toList(d.projects).filter(p => p && (p.url || p.title));
                    const bulk = parseBulkLinks(d.bulk_links, d.bulk_category);
                    let list = [...detailed, ...bulk];
                    if (d.newest_first) list = list.reverse();
                    setProjectsRaw(list.map(normalizeProject));
                });
                loadObject('data/bts.json').then(d => {
                    let albums = toList(d.albums).filter(a => a && (toList(a.images).length || a.cover));
                    // Tương thích dữ liệu cũ (ảnh lẻ): gom hết vào 1 album chung
                    const legacy = [
                        ...toList(d.bts).filter(b => b && b.image).map(b => b.image),
                        ...toList(d.bulk_images).filter(Boolean)
                    ];
                    if (legacy.length) albums = [...albums, { title: 'Ảnh hậu trường khác', images: legacy }];
                    setBtsAlbums(albums.map(normalizeAlbum).filter(a => a.images.length));
                });
                loadObject('data/services.json').then(d => setServices(toList(d.services).filter(s => s && s.name).map(s => ({
                    ...s, features: String(s.features || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean)
                }))));
                loadObject('data/testimonials.json').then(d => setTestimonials(toList(d.testimonials).filter(t => t && t.quote)));
                loadObject('data/backgrounds.json').then(d => {
                    setBgItems(toList(d.images).filter(Boolean).map(src => ({ key: src, src: asset(src) })));
                });
                fetch('data/site.json', { cache: 'no-cache' })
                    .then(r => r.ok ? r.json() : Promise.reject())
                    .then(d => setSite(prev => ({ hero: { ...prev.hero, ...d.hero }, about: { ...prev.about, ...d.about }, contact: { ...prev.contact, ...d.contact } })))
                    .catch(() => {});
                loadObject('data/layout.json').then(d => {
                    if (EDIT_MODE) {
                        const draft = LS.get(DRAFT_KEY);
                        if (draft) {
                            try { setLayout(normLayout(JSON.parse(draft))); setDirty(true); return; } catch (e) {}
                        }
                    }
                    setLayout(normLayout(d));
                });
            }, []);

            useEffect(() => {
                projectsRaw.filter(p => !p.title && p.vid).forEach(p => {
                    fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + p.vid))
                        .then(r => r.ok ? r.json() : Promise.reject())
                        .then(j => j && j.title && setYtTitles(prev => ({ ...prev, [p.vid]: j.title })))
                        .catch(() => {});
                });
            }, [projectsRaw]);

            // Khoá cuộn trang khi đang mở album / video
            useEffect(() => {
                document.body.style.overflow = (openAlbum || selectedProject) ? 'hidden' : '';
                return () => { document.body.style.overflow = ''; };
            }, [openAlbum, selectedProject]);

            useEffect(() => {
                if (editing && dirty) LS.set(DRAFT_KEY, JSON.stringify(layout));
            }, [layout, dirty]);


            const setImageCfg = (id, cfg) => {
                setLayout(prev => {
                    const images = { ...prev.images };
                    if (cfg) images[id] = cfg; else delete images[id];
                    return { ...prev, images };
                });
                setDirty(true);
            };
            const setBgCfg = (key, cfg) => {
                setLayout(prev => {
                    const backgrounds = { ...prev.backgrounds };
                    if (cfg) backgrounds[key] = cfg; else delete backgrounds[key];
                    return { ...prev, backgrounds };
                });
                setDirty(true);
            };
            const setMode = (m) => { setModeState(m); setSelected(null); };
            const discardDraft = () => {
                if (!window.confirm('Bỏ mọi thay đổi chưa lưu và quay về bố cục đang đăng trên web?')) return;
                LS.del(DRAFT_KEY);
                location.reload();
            };
            const ctx = { editing, mode, layout, setImageCfg, setBgCfg, selected, setSelected };

            const closeAlbum = () => { setOpenAlbum(null); setPhotoIdx(null); };
            const stepPhoto = (d) => setPhotoIdx(i => {
                if (i === null || !openAlbum || openAlbum.images.length < 2) return i;
                const n = openAlbum.images.length;
                return (i + d + n) % n;
            });

            useEffect(() => {
                const onKey = (e) => {
                    if (e.key === 'Escape') {
                        if (photoIdx !== null) setPhotoIdx(null);
                        else { setSelectedProject(null); setOpenAlbum(null); }
                    }
                    else if (openAlbum && photoIdx !== null && e.key === 'ArrowRight') stepPhoto(1);
                    else if (openAlbum && photoIdx !== null && e.key === 'ArrowLeft') stepPhoto(-1);
                };
                window.addEventListener('keydown', onKey);
                return () => window.removeEventListener('keydown', onKey);
            }, [openAlbum, photoIdx]);

            const projects = projectsRaw.map(p => p.title ? p : { ...p, title: ytTitles[p.vid] || 'Video' });
            const pickCategory = (cat) => { setActiveCategory(cat); setProjLimit(PAGE_SIZE); };
            const categories = [...new Set(projects.map(p => p.category))];
            const filteredProjects = activeCategory === 'All'
                ? projects
                : projects.filter(p => p.category === activeCategory);
            const shownProjects = editing ? filteredProjects : filteredProjects.slice(0, projLimit);
            const hiddenProjects = filteredProjects.length - shownProjects.length;
            const shownAlbums = editing ? btsAlbums : btsAlbums.slice(0, albumLimit);
            const hiddenAlbums = btsAlbums.length - shownAlbums.length;

            const skills = toList(site.about.skills).filter(Boolean);
            const hasSvc = services.length > 0, hasTes = testimonials.length > 0, hasBts = btsAlbums.length > 0;
            const nav = [['portfolio', 'Dự án'], ['about', 'Giới thiệu'], hasSvc && ['services', 'Dịch vụ'], hasBts && ['behind-the-scenes', 'Hậu trường'], ['contact', 'Liên hệ']].filter(Boolean);
            const tel = (site.contact.phone || '').replace(/[^\d+]/g, '');
            const showreelId = (String(site.hero.showreel || '').match(/(?:youtu\.be\/|embed\/|watch\?v=|shorts\/|v\/)([\w-]{11})/) || [])[1];
            const heroSrc = site.hero.image ? asset(site.hero.image) : (showreelId ? `https://img.youtube.com/vi/${showreelId}/maxresdefault.jpg` : '');
            const playShowreel = () => showreelId && setSelectedProject({ title: 'Showreel', url: parseYoutubeUrl('https://youtu.be/' + showreelId).embedUrl, short: false, desc: '' });
            const embed = (u) => u + (u.includes('?') ? '&' : '?') + 'autoplay=1';
            const photo = openAlbum && photoIdx !== null ? openAlbum.images[photoIdx] : null;
            const modalOpen = !!(openAlbum || selectedProject);

            return (
                <EditCtx.Provider value={ctx}>
                <div className={`relative min-h-screen bg-ink-950 text-[#F3EFE6] overflow-x-clip ${editing ? 'pb-44' : ''}`}>
                    <BgLayer items={bgItems} />
                    <div className="relative z-10" onPointerDown={editing ? () => setSelected(null) : undefined}>

                    {/* ===== HEADER ===== */}
                    <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${scrolled || menuOpen ? 'bg-ink-950/85 backdrop-blur-xl border-b border-white/10' : 'border-b border-transparent'}`}>
                        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
                            <a href="#top" className="font-heading font-extrabold tracking-tight text-lg md:text-xl uppercase">Quốc Võ<span className="text-gold-light font-medium"> Production</span></a>
                            <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
                                {nav.map(([id, label]) => <a key={id} href={'#' + id} className="hover:text-white transition-colors">{label}</a>)}
                            </nav>
                            <div className="flex items-center gap-2">
                                <a href={site.contact.zalo_url} target="_blank" rel="noopener" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full bg-gold text-white hover:bg-gold-light transition-colors"><ZaloLogo className="w-5 h-5" /> Nhắn Zalo</a>
                                <button type="button" aria-label="Menu" onClick={() => setMenuOpen(o => !o)} className="md:hidden w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Icon name={menuOpen ? 'x' : 'menu'} /></button>
                            </div>
                        </div>
                        {menuOpen && (
                            <nav className="md:hidden px-5 pb-5 flex flex-col gap-1 text-base">
                                {nav.map(([id, label]) => <a key={id} href={'#' + id} onClick={() => setMenuOpen(false)} className="py-3 border-b border-white/10 text-white/80">{label}</a>)}
                            </nav>
                        )}
                    </header>

                    {/* ===== HERO ===== */}
                    <section id="top" className="relative pt-28 md:pt-36 pb-14 px-5 md:px-8 max-w-7xl mx-auto">
                        <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-[70rem] max-w-none h-[34rem] rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(196,151,71,.55), transparent)' }}></div>
                        <div className="relative max-w-4xl">
                            <Reveal><span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/40 bg-gold/10 text-gold-light text-[11px] md:text-xs font-semibold tracking-[.2em] uppercase"><span className="w-1.5 h-1.5 rounded-full bg-gold-light animate-pulse"></span>{site.hero.badge}</span></Reveal>
                            <Reveal delay={80}><h1 className="mt-4 font-heading font-black uppercase leading-[1.02] tracking-tight text-5xl sm:text-6xl md:text-8xl text-grad pt-5 pb-2">{site.hero.title}</h1></Reveal>
                            <Reveal delay={160}><p className="mt-6 max-w-2xl text-base md:text-lg text-white/65 leading-relaxed">{site.hero.description}</p></Reveal>
                            <Reveal delay={240}>
                                <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <a href="#portfolio" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gold text-white font-semibold hover:bg-gold-light transition-colors">Xem dự án <Icon name="arrow" className="w-4 h-4" /></a>
                                        <a href="#contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/20 font-semibold hover:bg-white/10 transition-colors">Liên hệ hợp tác</a>
                                    </div>
                                    <div className="flex gap-8 md:gap-10 md:pl-10 md:border-l border-white/15">
                                        {[[site.about.stat1_number, site.about.stat1_label], [site.about.stat2_number, site.about.stat2_label]].map(([n, l], i) => (
                                            <div key={i}><div className="font-heading text-2xl md:text-3xl font-extrabold text-gold-light">{n}</div><div className="text-xs text-white/50 mt-0.5">{l}</div></div>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                        {heroSrc && (
                            <Reveal delay={200} className="relative mt-12 md:mt-16">
                                <div className={showreelId && !editing ? 'cursor-pointer' : ''} onClick={() => { if (!editing) playShowreel(); }}>
                                    <EditableImage id="hero" eager src={heroSrc} alt={site.hero.title}
                                        frameClass="aspect-[16/10] md:aspect-[21/9] rounded-3xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)] bg-ink-800 group"
                                        imgClass="group-hover:scale-[1.03] transition-transform duration-1000">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent pointer-events-none"></div>
                                        {showreelId && !editing && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <span className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gold/90 text-white flex items-center justify-center shadow-2xl ring-8 ring-white/10 group-hover:scale-110 transition-transform"><Icon name="play" className="w-8 h-8 fill-current ml-1" /></span>
                                            </div>
                                        )}
                                        {showreelId && <span className="absolute bottom-4 left-5 text-xs font-bold tracking-[.25em] text-white/90 pointer-events-none">SHOWREEL</span>}
                                    </EditableImage>
                                </div>
                            </Reveal>
                        )}
                    </section>

                    {/* ===== DẢI KỸ NĂNG CHẠY NGANG ===== */}
                    {skills.length > 0 && (
                        <div className="border-y border-white/10 bg-white/[.03] overflow-hidden py-4" aria-hidden="true">
                            <div className="marquee flex w-max gap-10 whitespace-nowrap font-heading text-sm md:text-base font-bold uppercase tracking-[.25em] text-white/40">
                                {[...skills, ...skills, ...skills, ...skills].map((s, i) => <span key={i} className="flex items-center gap-10">{s}<span className="text-gold">✦</span></span>)}
                            </div>
                        </div>
                    )}

                    {/* ===== DỰ ÁN ===== */}
                    <section id="portfolio" className="py-20 md:py-28 px-5 md:px-8 max-w-7xl mx-auto scroll-mt-16">
                        <Reveal><SectionHead eyebrow="Showcase" title="Dự án tiêu biểu" sub="TVC, MV, quảng cáo và nội dung Reels/TikTok mình đã thực hiện." /></Reveal>
                        <div className="mt-8 flex flex-wrap gap-2">
                            {['All', ...categories].map(cat => (
                                <button key={cat} type="button" onClick={() => pickCategory(cat)} className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${activeCategory === cat ? 'bg-gold border-gold text-white' : 'border-white/15 text-white/70 hover:border-white/40'}`}>
                                    {cat === 'All' ? 'Tất cả' : cat}
                                </button>
                            ))}
                        </div>
                        {projects.length === 0 ? (
                            <p className="mt-10 text-center text-white/40 py-16 rounded-2xl border border-dashed border-white/15">Chưa có video nào. Hãy thêm trong CMS → Video dự án.</p>
                        ) : (
                            <>
                                <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {shownProjects.map(p => (
                                        <Reveal key={p.key + p.id}>
                                            <article className="group h-full rounded-2xl overflow-hidden bg-ink-800 border border-white/10 hover:border-gold/50 hover:-translate-y-1 transition-all duration-300">
                                                <div className={editing ? '' : 'cursor-pointer'} onClick={() => { if (!editing) setSelectedProject(p); }}>
                                                    <EditableImage id={'project:' + p.key} src={p.thumbnail} alt={p.title} frameClass="aspect-[16/10] bg-ink-700" imgClass="group-hover:scale-105 transition-transform duration-700">
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                                                        {!editing && (
                                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                <span className="w-14 h-14 rounded-full bg-gold/90 text-white flex items-center justify-center shadow-xl opacity-90 md:opacity-0 md:scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300"><Icon name="play" className="w-6 h-6 fill-current ml-0.5" /></span>
                                                            </div>
                                                        )}
                                                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur text-[11px] font-semibold tracking-wide pointer-events-none">{p.category}</span>
                                                        {p.short && <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gold text-[10px] font-bold pointer-events-none">SHORTS</span>}
                                                    </EditableImage>
                                                </div>
                                                <div className="p-5">
                                                    <h3 className="font-semibold leading-snug line-clamp-2">{p.title}</h3>
                                                    {p.desc && <p className="mt-2 text-sm text-white/50 line-clamp-2">{p.desc}</p>}
                                                </div>
                                            </article>
                                        </Reveal>
                                    ))}
                                </div>
                                {hiddenProjects > 0 && (
                                    <div className="mt-10 text-center"><button type="button" onClick={() => setProjLimit(n => n + PAGE_SIZE)} className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 font-semibold transition-colors">Xem thêm {Math.min(hiddenProjects, PAGE_SIZE)} video <span className="text-white/40">({hiddenProjects} còn lại)</span></button></div>
                                )}
                            </>
                        )}
                    </section>

                    {/* ===== GIỚI THIỆU ===== */}
                    <section id="about" className="py-20 md:py-28 px-5 md:px-8 max-w-7xl mx-auto scroll-mt-16 border-t border-white/10">
                        <div className="grid md:grid-cols-5 gap-10 md:gap-16 items-center">
                            <Reveal className="md:col-span-2">
                                <EditableImage id="about" src={asset(site.about.image)} alt={site.about.image_name}
                                    frameClass="aspect-[4/5] rounded-3xl border border-white/10 bg-ink-800 shadow-2xl group"
                                    imgClass="group-hover:scale-105 transition-transform duration-1000">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none"></div>
                                    <div className="absolute bottom-5 left-5 right-5 pointer-events-none">
                                        <p className="font-heading text-xl font-bold">{site.about.image_name}</p>
                                        <p className="text-sm text-gold-light">{site.about.image_role}</p>
                                        <p className="text-xs text-white/60 mt-1">{site.about.image_location}</p>
                                    </div>
                                </EditableImage>
                            </Reveal>
                            <div className="md:col-span-3">
                                <Reveal><SectionHead eyebrow={site.about.badge} title={site.about.heading} /></Reveal>
                                <Reveal delay={100}><p className="mt-6 text-white/70 leading-[1.85] text-base md:text-lg">{renderBold(site.about.paragraph)}</p></Reveal>
                                {skills.length > 0 && (
                                    <Reveal delay={160}><div className="mt-7 flex flex-wrap gap-2">{skills.map(s => <span key={s} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">{s}</span>)}</div></Reveal>
                                )}
                                <Reveal delay={220}>
                                    <p className="mt-9 mb-3 text-xs font-bold uppercase tracking-[.2em] text-white/40">Phần mềm sử dụng</p>
                                    <div className="flex flex-wrap items-center gap-3">
                                        {[['Pr', '#00005b', '#9999ff'], ['Ae', '#00005b', '#d291ff'], ['Ps', '#001e36', '#31a8ff'], ['Lr', '#001e36', '#4fb8ff']].map(([t, bg, fg]) => (
                                            <span key={t} title={t} className="w-11 h-11 rounded-xl flex items-center justify-center font-heading font-bold text-sm border border-white/10" style={{ background: bg, color: fg }}>{t}</span>
                                        ))}
                                        <span title="DaVinci Resolve" className="w-11 h-11 rounded-xl bg-[#16181d] p-1.5 border border-white/10"><DaVinciLogo /></span>
                                        <span title="CapCut" className="w-11 h-11 rounded-xl bg-black p-2.5 border border-white/10"><CapCutLogo /></span>
                                    </div>
                                </Reveal>
                            </div>
                        </div>
                    </section>

                    {/* ===== DỊCH VỤ (ẩn nếu CMS để trống) ===== */}
                    {hasSvc && (
                        <section id="services" className="py-20 md:py-28 px-5 md:px-8 max-w-7xl mx-auto scroll-mt-16 border-t border-white/10">
                            <Reveal><SectionHead center eyebrow="Dịch vụ" title="Mình có thể giúp gì cho bạn" sub="Chi phí tuỳ độ dài, số buổi quay và yêu cầu hậu kỳ. Nhắn mình để nhận báo giá nhanh." /></Reveal>
                            <div className="mt-12 grid md:grid-cols-3 gap-6">
                                {services.map((s, i) => (
                                    <Reveal key={i} delay={i * 80}>
                                        <div className={`relative h-full p-7 rounded-3xl border flex flex-col ${s.highlight ? 'bg-gradient-to-b from-gold/20 to-ink-800 border-gold/60' : 'bg-ink-800 border-white/10'}`}>
                                            {s.highlight && <span className="absolute -top-3 left-7 px-3 py-1 rounded-full bg-gold text-[11px] font-bold">PHỔ BIẾN</span>}
                                            <h3 className="font-heading text-xl font-bold">{s.name}</h3>
                                            {s.price && <p className="mt-3 text-2xl font-extrabold text-gold-light">{s.price}</p>}
                                            {s.desc && <p className="mt-3 text-sm text-white/60 leading-relaxed">{s.desc}</p>}
                                            <ul className="mt-5 space-y-2.5 text-sm text-white/80 flex-1">
                                                {s.features.map((f, j) => <li key={j} className="flex gap-2.5"><span className="text-gold-light mt-0.5">✓</span>{f}</li>)}
                                            </ul>
                                            <a href="#contact" className={`mt-7 text-center py-3 rounded-full font-semibold transition-colors ${s.highlight ? 'bg-gold hover:bg-gold-light' : 'border border-white/20 hover:bg-white/10'}`}>Nhận báo giá</a>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ===== NHẬN XÉT (ẩn nếu CMS để trống) ===== */}
                    {hasTes && (
                        <section className="py-16 md:py-24 px-5 md:px-8 max-w-7xl mx-auto border-t border-white/10">
                            <Reveal><SectionHead center eyebrow="Khách hàng nói gì" title="Phản hồi từ khách hàng" /></Reveal>
                            <div className="mt-12 grid md:grid-cols-3 gap-6">
                                {testimonials.map((t, i) => (
                                    <Reveal key={i} delay={i * 80}>
                                        <figure className="h-full p-7 rounded-3xl bg-ink-800 border border-white/10 flex flex-col">
                                            <span className="font-heading text-5xl leading-none text-gold/60">“</span>
                                            <blockquote className="mt-2 text-white/80 leading-relaxed flex-1">{t.quote}</blockquote>
                                            <figcaption className="mt-6 flex items-center gap-3">
                                                {t.avatar ? <img src={asset(t.avatar)} alt={t.name} loading="lazy" className="w-11 h-11 rounded-full object-cover" /> : <span className="w-11 h-11 rounded-full bg-gold/20 text-gold-light flex items-center justify-center font-bold">{(t.name || '?').charAt(0)}</span>}
                                                <span><span className="block font-semibold text-sm">{t.name}</span><span className="block text-xs text-white/50">{t.role}</span></span>
                                            </figcaption>
                                        </figure>
                                    </Reveal>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ===== HẬU TRƯỜNG (ALBUM) ===== */}
                    {(hasBts || editing) && (
                        <section id="behind-the-scenes" className="py-20 md:py-28 px-5 md:px-8 max-w-7xl mx-auto scroll-mt-16 border-t border-white/10">
                            <Reveal><SectionHead center eyebrow="Hậu trường" title="Behind The Scenes" sub="Những khoảnh khắc thật ngoài hiện trường. Bấm vào album để xem toàn bộ ảnh." /></Reveal>
                            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {shownAlbums.map(a => (
                                    <Reveal key={a.id}>
                                        <article className="group h-full rounded-2xl overflow-hidden bg-ink-800 border border-white/10 hover:border-gold/50 transition-all duration-300">
                                            <div className={editing ? '' : 'cursor-pointer'} onClick={() => { if (!editing) setOpenAlbum(a); }}>
                                                <EditableImage id={'bts:' + a.cover} src={a.cover} alt={a.title} frameClass="aspect-[4/3] bg-ink-700" imgClass="group-hover:scale-105 transition-transform duration-700">
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
                                                    <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur text-xs font-semibold pointer-events-none">{a.images.length} ảnh</span>
                                                </EditableImage>
                                            </div>
                                            <div className="p-5">
                                                {a.category && <span className="text-[10px] font-bold tracking-[.2em] text-gold-light uppercase">{a.category}</span>}
                                                <h3 className="font-semibold leading-snug mt-1">{a.title}</h3>
                                                {a.desc && <p className="mt-2 text-sm text-white/50 line-clamp-2">{a.desc}</p>}
                                            </div>
                                        </article>
                                    </Reveal>
                                ))}
                            </div>
                            {hiddenAlbums > 0 && (
                                <div className="mt-10 text-center"><button type="button" onClick={() => setAlbumLimit(n => n + ALBUM_PAGE_SIZE)} className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 font-semibold transition-colors">Xem thêm album ({hiddenAlbums})</button></div>
                            )}
                        </section>
                    )}

                    {/* ===== LIÊN HỆ ===== */}
                    <section id="contact" className="px-5 md:px-8 pb-16 pt-8 max-w-5xl mx-auto scroll-mt-16">
                        <Reveal>
                            <div className="relative overflow-hidden rounded-[2rem] border border-gold/30 p-8 md:p-14 text-center" style={{ background: 'radial-gradient(120% 120% at 50% 0%, rgba(196,151,71,.22), rgba(20,20,22,1) 60%)' }}>
                                <span className="text-xs font-bold tracking-[.25em] uppercase text-gold-light">Liên hệ</span>
                                <h2 className="mt-3 font-heading text-3xl md:text-5xl font-extrabold tracking-tight">Cùng làm video thật “đã mắt”?</h2>
                                <p className="mt-4 max-w-xl mx-auto text-white/65 leading-relaxed">{site.contact.description}</p>
                                <div className="mt-9 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
                                    <a href={site.contact.zalo_url} target="_blank" rel="noopener" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-2xl bg-white text-ink-950 font-semibold hover:scale-[1.03] transition-transform"><ZaloLogo className="w-8 h-8 shrink-0" />{site.contact.zalo_label}</a>
                                    <a href={site.contact.facebook_url} target="_blank" rel="noopener" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-2xl bg-[#1877F2] font-semibold hover:scale-[1.03] transition-transform"><FacebookLogo onBlue className="w-8 h-8 shrink-0" />{site.contact.facebook_label}</a>
                                    {tel && <a href={'tel:' + tel} className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-2xl border border-white/25 font-semibold hover:bg-white/10 transition-colors"><Icon name="phone" className="w-5 h-5 text-gold-light" />{site.contact.phone}</a>}
                                    {site.contact.email && <a href={'mailto:' + site.contact.email} className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-2xl border border-white/25 font-semibold hover:bg-white/10 transition-colors"><Icon name="mail" className="w-5 h-5 text-gold-light" />{site.contact.email}</a>}
                                </div>
                            </div>
                        </Reveal>
                    </section>

                    <footer className="px-5 md:px-8 py-8 border-t border-white/10 text-center text-xs text-white/40">
                        © {new Date().getFullYear()} Quốc Võ Production · Videographer & Editor · TP. Hồ Chí Minh
                    </footer>

                    {/* ===== NÚT ZALO NỔI ===== */}
                    {!editing && !modalOpen && (
                        <a href={site.contact.zalo_url} target="_blank" rel="noopener" aria-label="Nhắn Zalo" className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
                            <span className="absolute inset-0 rounded-full bg-[#0068FF]/40 animate-ping"></span><ZaloLogo className="relative w-10 h-10" />
                        </a>
                    )}

                    {/* ===== MODAL VIDEO ===== */}
                    {selectedProject && (
                        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
                            <div className="relative w-full flex flex-col items-center" style={{ maxWidth: selectedProject.short ? 'min(420px, 47vh)' : '64rem' }} onClick={e => e.stopPropagation()}>
                                <button type="button" onClick={() => setSelectedProject(null)} aria-label="Đóng" className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"><Icon name="x" /></button>
                                <div className="w-full rounded-2xl overflow-hidden bg-black shadow-2xl" style={{ aspectRatio: selectedProject.short ? '9/16' : '16/9' }}>
                                    <iframe src={embed(selectedProject.url)} title={selectedProject.title} className="w-full h-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen></iframe>
                                </div>
                                <p className="mt-4 font-semibold text-center">{selectedProject.title}</p>
                                {selectedProject.desc && <p className="mt-1 text-sm text-white/55 text-center max-w-xl">{selectedProject.desc}</p>}
                            </div>
                        </div>
                    )}

                    {/* ===== MODAL ALBUM + LIGHTBOX ===== */}
                    {openAlbum && (
                        <div className="fixed inset-0 z-[60] bg-ink-950/95 backdrop-blur-md overflow-y-auto" onClick={closeAlbum}>
                            <div className="max-w-6xl mx-auto px-5 py-8" onClick={e => e.stopPropagation()}>
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div>
                                        {openAlbum.category && <span className="text-[10px] font-bold tracking-[.2em] text-gold-light uppercase">{openAlbum.category}</span>}
                                        <h3 className="font-heading text-2xl font-bold">{openAlbum.title}</h3>
                                        {openAlbum.desc && <p className="mt-1 text-sm text-white/55 max-w-2xl">{openAlbum.desc}</p>}
                                    </div>
                                    <button type="button" onClick={closeAlbum} aria-label="Đóng" className="shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><Icon name="x" /></button>
                                </div>
                                <div className="columns-2 md:columns-3 gap-3 [&>*]:mb-3">
                                    {openAlbum.images.map((src, i) => (
                                        <button type="button" key={src + i} onClick={() => setPhotoIdx(i)} className="block w-full overflow-hidden rounded-xl bg-ink-800 group">
                                            <img src={src} alt={(openAlbum.title || 'BTS') + ' ' + (i + 1)} loading="lazy" className="w-full h-auto group-hover:scale-105 transition-transform duration-500" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {photo && (
                        <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4" onClick={() => setPhotoIdx(null)}>
                            <img src={photo} alt={openAlbum.title} className="max-h-[88vh] max-w-full object-contain rounded-lg" onClick={e => e.stopPropagation()} />
                            <button type="button" onClick={() => setPhotoIdx(null)} aria-label="Đóng" className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"><Icon name="x" /></button>
                            {openAlbum.images.length > 1 && (
                                <>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); stepPhoto(-1); }} aria-label="Ảnh trước" className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-3xl leading-none">‹</button>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); stepPhoto(1); }} aria-label="Ảnh sau" className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-3xl leading-none">›</button>
                                    <span className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-xs">{photoIdx + 1} / {openAlbum.images.length}</span>
                                </>
                            )}
                        </div>
                    )}

                    </div>

                    {editing && (
                        <EditorBar mode={mode} setMode={setMode} dirty={dirty} bgItems={bgItems} layout={layout} selected={selected}
                            setBgCfg={setBgCfg} onPublish={() => setPublishOpen(true)} onDiscard={discardDraft} />
                    )}
                    {editing && publishOpen && (
                        <PublishModal json={JSON.stringify(layout, null, 2)} onClose={() => setPublishOpen(false)}
                            onSaved={() => { LS.del(DRAFT_KEY); setDirty(false); }} />
                    )}
                </div>
                </EditCtx.Provider>
            );
        }

        ReactDOM.createRoot(document.getElementById('root')).render(<App />);
