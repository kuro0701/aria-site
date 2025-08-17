/* ========================================================================
   ARIA Website - main.js (mobile-friendly, single source of truth)
   - Navbar effects
   - Smooth anchors
   - Mobile drawer (hamburger) open/close with focus trap
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
        if (window.scrollY > 10) {
          navbar.style.background = 'rgba(15, 13, 33, 0.9)';
        } else {
          navbar.style.background = 'rgba(0, 0, 0, 0.6)';
        }
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
          // もしモバイルドロワー内のリンクなら閉じる
          if (a.closest('#mobileMenu')) closeDrawer();
        });
      });
  
      /* -----------------------------
         3) Mobile drawer (hamburger)
         ----------------------------- */
      const drawer  = $('#mobileMenu');       // <nav id="mobileMenu" ...>
      const openBtn = $('.menu-toggle');      // <button class="menu-toggle">
      const closeBtn= $('.menu-close');       // <button class="menu-close">
  
      // フォーカストラップ用
      let lastFocused = null;
      const getFocusable = () =>
        $$('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])', drawer)
          .filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);
  
      function openDrawer() {
        if (!drawer) return;
        // hiddenが付いていたら除去（古い実装との互換）
        drawer.removeAttribute('hidden');
        drawer.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        openBtn?.setAttribute('aria-expanded', 'true');
        // 画面上端へ（「下にスワイプしないと出ない」症状の回避）
        window.scrollTo(0, 0);
        lastFocused = document.activeElement;
        // 少し待ってからフォーカスをクローズボタンへ
        setTimeout(() => {
          (closeBtn || getFocusable()[0] || drawer).focus?.();
        }, 120);
      }
  
      function closeDrawer() {
        if (!drawer) return;
        drawer.classList.remove('is-open');
        document.body.style.overflow = '';
        openBtn?.setAttribute('aria-expanded', 'false');
        // トランジション後にhiddenを戻す（アクセシビリティ配慮）
        setTimeout(() => drawer.setAttribute('hidden', ''), 250);
        // 元のフォーカス復帰
        setTimeout(() => lastFocused?.focus?.(), 10);
      }
  
      openBtn?.addEventListener('click', openDrawer);
      closeBtn?.addEventListener('click', closeDrawer);
  
      // オーバーレイ（黒い部分）クリックで閉じる
      drawer?.addEventListener('click', (e) => {
        if (e.target === drawer) closeDrawer();
      });
  
      // Escで閉じる
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
        // フォーカストラップ（Tab循環）
        if (drawer?.classList.contains('is-open') && e.key === 'Tab') {
          const f = getFocusable();
          if (f.length === 0) return;
          const first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
          }
        }
      });
  
      /* -----------------------------
         4) Player tabs
         ----------------------------- */
      const tabs  = $$('.player-tabs .tab');
      const panes = $$('.feature-embed .pane');
      tabs.forEach(btn => {
        btn.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          btn.classList.add('active');
          const targetSel = btn.dataset.target;
          panes.forEach(p => p.classList.remove('active'));
          const target = targetSel ? $(targetSel) : null;
          target?.classList.add('active');
        });
      });
    });
  
    /* -----------------------------
       5) Popular posts loader (single source)
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
  
      const esc = (s='') => String(s)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/"/g,'&quot;');
  
      const fDate = (iso) => {
        if (!iso) return '';
        try { return iso.replace(/-/g,'/'); } catch { return iso; }
      };
  
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
  
        const top = posts
          .slice()
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