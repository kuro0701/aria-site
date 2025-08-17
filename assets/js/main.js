/* ========================================================================
   ARIA Website - main.js (v3 failsafe)
   これ1本で:
   - PC: ナビ/SNSが常時表示（消えない）
   - Mobile: ハンバーガーを押すと必ずドロワーが開く（無ければ自動生成）
   - Popular posts loaderも一本化
   ======================================================================== */
   (() => {
    'use strict';
    const $  = (s, el = document) => el.querySelector(s);
    const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  
    // ==== 0) CSS を強制注入（他CSSに勝つ） ===============================
    const css = `
    .navbar{position:sticky;top:0;z-index:3000;}
    .navbar .container{display:flex;align-items:center;gap:12px;}
    .navbar .logo{font-weight:700;}
    .navbar .nav{margin-left:auto;display:flex;gap:20px;white-space:nowrap;}
    .social-links-header{margin-left:8px;display:flex;gap:14px;}
    .menu-toggle{display:none;width:40px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,.15);
      background:rgba(255,255,255,.08);color:#fff;align-items:center;justify-content:center;}
    @media (max-width:900px){
      .navbar .nav,.navbar .social-links-header{display:none !important;}
      .menu-toggle{display:inline-flex !important;}
    }
    @media (min-width:901px){
      .navbar .nav,.navbar .social-links-header{display:flex !important;}
      .menu-toggle{display:none !important;}
    }
    /* Drawer */
    .nav-drawer{position:fixed;inset:0;z-index:3200;display:grid;grid-template-columns:min(86vw,320px) 1fr;
      opacity:0;pointer-events:none;transition:opacity .2s ease;background:rgba(8,10,22,.55);backdrop-filter:blur(6px);}
    .nav-drawer.is-open{opacity:1;pointer-events:auto;}
    .nav-drawer__inner{height:100%;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.04));
      border-right:1px solid rgba(255,255,255,.16);box-shadow:0 10px 40px rgba(0,0,0,.45);
      padding:16px 18px;transform:translateX(-100%);transition:transform .25s ease;}
    .nav-drawer.is-open .nav-drawer__inner{transform:translateX(0);}
    .menu-close{position:absolute;top:12px;right:12px;appearance:none;border:0;background:transparent;color:#fff;font-size:1.5rem;cursor:pointer;}
    .nav-drawer__links{list-style:none;margin:48px 0 12px;padding:0;display:grid;gap:10px;}
    .nav-drawer__links a{display:block;padding:10px 12px;border-radius:10px;text-decoration:none;color:#fff;
      background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);font-weight:700;}
    .nav-drawer__social{display:flex;gap:14px;font-size:1.35rem;margin-top:8px;}
    .feature-embed{position:relative;aspect-ratio:16/9;height:auto;}
    .feature-embed iframe{position:absolute;inset:0;width:100% !important;height:100% !important;border:0;}
    .hero{min-height:100dvh;}
    `;
    const styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  
    document.addEventListener('DOMContentLoaded', () => {
      // ==== 1) ヘッダー要素を自己修復 =====================================
      const header = $('.navbar .container') || $('.navbar') || document.body;
      // menu-toggle が無ければ作る（左端）
      let burger = $('.menu-toggle');
      if (!burger) {
        burger = document.createElement('button');
        burger.className = 'menu-toggle';
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-controls', 'mobileMenu');
        burger.setAttribute('aria-label', 'メニューを開く');
        burger.innerHTML = '<i class="fa-solid fa-bars"></i>';
        header.insertBefore(burger, header.firstChild);
      }
      // .nav が無ければ作る（PC用）
      let nav = $('.navbar .nav');
      if (!nav) {
        nav = document.createElement('nav');
        nav.className = 'nav';
        nav.setAttribute('aria-label', 'メインメニュー');
        nav.innerHTML = `
          <a href="#music">音楽</a>
          <a href="#story">ストーリー</a>
          <a href="/blog/">ブログ</a>`;
        header.appendChild(nav);
      }
      // .social-links-header が無ければ作る（PC用）
      let sns = $('.social-links-header');
      if (!sns) {
        sns = document.createElement('div');
        sns.className = 'social-links-header';
        sns.setAttribute('aria-label','SNSリンク');
        sns.innerHTML = `
          <a href="https://x.com/NexusAria" target="_blank" rel="noopener" aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
          <a href="https://www.tiktok.com/@arianexus" target="_blank" rel="noopener" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>
          <a href="https://www.youtube.com/@NexusAria" target="_blank" rel="noopener" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
          <a href="https://www.instagram.com/arianexus2/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>`;
        header.appendChild(sns);
      }
  
      // ==== 2) スクロール時のナビ背景 =====================================
      const navbar = $('.navbar');
      const applyNavBG = () => {
        if (!navbar) return;
        navbar.style.background = (window.scrollY > 10)
          ? 'rgba(15, 13, 33, 0.9)'
          : 'rgba(0, 0, 0, 0.6)';
      };
      applyNavBG();
      window.addEventListener('scroll', applyNavBG, { passive: true });
  
      // ==== 3) アンカーをスムーススクロール ===============================
      $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
          const href = a.getAttribute('href');
          if (!href || href === '#' || !href.startsWith('#')) return;
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (a.closest('#mobileMenu')) closeDrawer(); // ドロワー内なら閉じる
        });
      });
  
      // ==== 4) モバイルドロワー（無ければ自動生成） =======================
      function ensureDrawer() {
        let drawer = $('#mobileMenu');
        if (!drawer) {
          drawer = document.createElement('nav');
          drawer.id = 'mobileMenu';
          drawer.className = 'nav-drawer';
          drawer.setAttribute('aria-label','モバイルメニュー');
          drawer.setAttribute('hidden','');
          drawer.innerHTML = `
            <div class="nav-drawer__inner">
              <button class="menu-close" aria-label="メニューを閉じる"><i class="fa-solid fa-xmark"></i></button>
              <ul class="nav-drawer__links">
                <li><a href="#music">音楽</a></li>
                <li><a href="#story">ストーリー</a></li>
                <li><a href="/blog/">ブログ</a></li>
              </ul>
              <div class="nav-drawer__social">${sns.innerHTML}</div>
            </div>`;
          document.body.appendChild(drawer);
        }
        return drawer;
      }
      const drawer = ensureDrawer();
      const closeBtn = drawer.querySelector('.menu-close');
      let lastFocused = null;
  
      function openDrawer() {
        drawer.removeAttribute('hidden');
        drawer.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        burger?.setAttribute('aria-expanded', 'true');
        window.scrollTo(0, 0);
        lastFocused = document.activeElement;
        setTimeout(() => (closeBtn || drawer).focus?.(), 120);
      }
      function closeDrawer() {
        drawer.classList.remove('is-open');
        document.body.style.overflow = '';
        burger?.setAttribute('aria-expanded', 'false');
        setTimeout(() => drawer.setAttribute('hidden',''), 250);
        setTimeout(() => lastFocused?.focus?.(), 10);
      }
      // クリックで開閉
      burger.addEventListener('click', openDrawer);
      closeBtn.addEventListener('click', closeDrawer);
      // 黒いオーバーレイ部分クリックで閉じる
      drawer.addEventListener('click', (e) => { if (e.target === drawer) closeDrawer(); });
      // Escで閉じる＋フォーカストラップ
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
        if (drawer.classList.contains('is-open') && e.key === 'Tab') {
          const f = $$('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])', drawer)
            .filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);
          if (!f.length) return;
          const first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
      // デスクトップに戻ったら閉じる
      window.addEventListener('resize', () => { if (window.innerWidth > 900) closeDrawer(); });
  
      // ==== 5) Player tabs ====================================================
      const tabs  = $$('.player-tabs .tab');
      const panes = $$('.feature-embed .pane');
      tabs.forEach(btn => {
        btn.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          btn.classList.add('active');
          panes.forEach(p => p.classList.remove('active'));
          const target = btn.dataset.target ? $(btn.dataset.target) : null;
          target?.classList.add('active');
        });
      });
    });
  
    // ==== 6) Popular posts loader ============================================
    (async () => {
      const grid = document.getElementById('popular-posts');
      if (!grid) return;
  
      const toAbs = (url) => {
        if (!url) return '/blog/';
        if (/^https?:\/\//i.test(url)) return url;
        if (url.startsWith('/')) return url;
        if (url.startsWith('blog/')) return '/' + url;
        if (!url.includes('/')) return '/blog/' + url.replace(/\.html?$/,'') + '/';
        return '/' + url.replace(/^\.?\//,'');
      };
      const absImg = (src) => {
        if (!src) return '/assets/images/noimage.png';
        if (/^https?:\/\//i.test(src)) return src;
        if (src.startsWith('/')) return src;
        return '/' + src.replace(/^\.?\//,'');
      };
      const esc  = (s='') => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
      const fDate= (iso) => iso ? iso.replace(/-/g,'/') : '';
  
      async function load() {
        try {
          const r = await fetch('/blog/posts.json', { cache: 'no-store' });
          if (r.ok) return r.json();
          throw 0;
        } catch {
          const r2 = await fetch('blog/posts.json', { cache: 'no-store' }).catch(() => null);
          if (r2 && r2.ok) return r2.json();
          return [];
        }
      }
  
      try {
        const posts = await load();
        if (!Array.isArray(posts) || posts.length === 0) {
          grid.innerHTML = `<p style="opacity:.8">まだ記事がありません。</p>`;
          return;
        }
        const top = posts.slice()
          .sort((a,b) => (b.views||0)-(a.views||0) || (new Date(b.date)-new Date(a.date)))
          .slice(0,3);
  
        grid.innerHTML = top.map(p => {
          const url   = toAbs(p.url || p.permalink || p.slug || '');
          const cover = absImg(p.cover || p.image);
          const tag   = (p.tags && p.tags.length) ? `<span class="badge">${esc(p.tags[0])}</span>` : '';
          return `
            <a class="blog-card" href="${url}">
              <div class="thumb">
                <img src="${cover}" alt="${esc(p.title || '')}" loading="lazy" onerror="this.style.display='none'">
                <div class="thumb-fallback"></div>
              </div>
              <div class="card-content">
                <div class="meta">${tag}<time datetime="${esc(p.date || '')}">${esc(fDate(p.date || ''))}</time></div>
                <h4>${esc(p.title || '')}</h4>
                <p class="excerpt">${esc(p.excerpt || '')}</p>
              </div>
            </a>
          `;
        }).join('');
      } catch {
        grid.innerHTML = `
          <a class="blog-card" href="/blog/">
            <div class="thumb"><div class="thumb-fallback" style="height:140px;"></div></div>
            <div class="card-content">
              <div class="meta"><span class="badge">Blog</span></div>
              <h4>ブログへ</h4>
              <p class="excerpt">最新の記事を一覧でチェック。</p>
            </div>
          </a>`;
      }
    })();
  })();