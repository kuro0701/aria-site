/* ========================================================================
   ARIA Website - main.js (v2 hotfix)
   - Navbar effects
   - Smooth anchors
   - Mobile drawer (auto-build if missing)
   - Player tabs
   - Popular posts loader
   ======================================================================== */

   (() => {
    'use strict';
  
    const $  = (s, el = document) => el.querySelector(s);
    const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  
    document.addEventListener('DOMContentLoaded', () => {
      /* -----------------------------
         1) Navbar background on scroll
         ----------------------------- */
      const navbar = $('.navbar');
      const applyNavBG = () => {
        if (!navbar) return;
        navbar.style.background = (window.scrollY > 10)
          ? 'rgba(15, 13, 33, 0.9)'
          : 'rgba(0, 0, 0, 0.6)';
      };
      applyNavBG();
      window.addEventListener('scroll', applyNavBG, { passive: true });
  
      /* -----------------------------
         2) Smooth scroll for anchors
         ----------------------------- */
      const smoothScroll = (href) => {
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
          const href = a.getAttribute('href');
          if (!href || href === '#' || !href.startsWith('#')) return;
          e.preventDefault();
          smoothScroll(href);
          if (a.closest('#mobileMenu')) closeDrawer(); // モバイルメニュー内なら閉じる
        });
      });
  
      /* -----------------------------
         3) Mobile drawer (auto-build)
         ----------------------------- */
      const openBtn = $('.menu-toggle');
  
      function ensureDrawer() {
        let drawer = $('#mobileMenu');
        if (!drawer) {
          drawer = document.createElement('nav');
          drawer.id = 'mobileMenu';
          drawer.className = 'nav-drawer';
          drawer.setAttribute('aria-label', 'モバイルメニュー');
          drawer.setAttribute('hidden', '');
          drawer.innerHTML = `
            <div class="nav-drawer__inner">
              <button class="menu-close" aria-label="メニューを閉じる">
                <i class="fa-solid fa-xmark"></i>
              </button>
              <ul class="nav-drawer__links">
                <li><a href="#music">音楽</a></li>
                <li><a href="#story">ストーリー</a></li>
                <li><a href="/blog/">ブログ</a></li>
              </ul>
              <div class="nav-drawer__social">
                <a href="https://x.com/NexusAria" target="_blank" rel="noopener" aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
                <a href="https://www.tiktok.com/@arianexus" target="_blank" rel="noopener" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>
                <a href="https://www.youtube.com/@NexusAria" target="_blank" rel="noopener" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
                <a href="https://www.instagram.com/arianexus2/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
              </div>
            </div>
          `;
          document.body.appendChild(drawer);
        }
        return drawer;
      }
  
      const drawer = ensureDrawer();
      const closeBtn = drawer.querySelector('.menu-close');
      let lastFocused = null;
  
      function openDrawer() {
        drawer.removeAttribute('hidden');           // 古い実装互換
        drawer.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        openBtn?.setAttribute('aria-expanded', 'true');
        window.scrollTo(0, 0);                      // 画面上に固定
        lastFocused = document.activeElement;
        setTimeout(() => (closeBtn || drawer).focus?.(), 120);
      }
      function closeDrawer() {
        drawer.classList.remove('is-open');
        document.body.style.overflow = '';
        openBtn?.setAttribute('aria-expanded', 'false');
        setTimeout(() => drawer.setAttribute('hidden', ''), 250);
        setTimeout(() => lastFocused?.focus?.(), 10);
      }
  
      openBtn?.addEventListener('click', openDrawer);
      closeBtn?.addEventListener('click', closeDrawer);
      drawer.addEventListener('click', (e) => { if (e.target === drawer) closeDrawer(); });
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
        // フォーカストラップ
        if (drawer.classList.contains('is-open') && e.key === 'Tab') {
          const f = $$('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])', drawer)
            .filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);
          if (!f.length) return;
          const first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
      // デスクトップに戻ったら閉じておく
      window.addEventListener('resize', () => { if (window.innerWidth > 900) closeDrawer(); });
  
      /* -----------------------------
         4) Player tabs
         ----------------------------- */
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
  
    /* -----------------------------
       5) Popular posts loader
       ----------------------------- */
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
      const esc = (s='') => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
      const fDate = (iso) => iso ? iso.replace(/-/g,'/') : '';
  
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
          </a>
        `;
      }
    })();
  })();