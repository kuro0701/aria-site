// main.js — ARIA strong site baseline
(() => {
  'use strict';

  // ===== 1) Navigation Drawer =====
  const toggle = document.querySelector('.menu-toggle');
  const drawer = document.getElementById('mobileMenu');
  const closeBtn = drawer ? drawer.querySelector('.menu-close') : null;

  const open = () => {
    if (!drawer) return;
    drawer.hidden = false;
    drawer.classList.add('is-open');
    toggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    setTimeout(() => { drawer.hidden = true; }, 250);
  };

  toggle?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  drawer?.addEventListener('click', (e) => { if (e.target === drawer) close(); });

  // ===== 2) Link Prefetch (hover) =====
  document.addEventListener('mouseover', (e) => {
    const a = e.target.closest('a[href^="/"]');
    if (!a || a.dataset.prefetched) return;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = a.href;
    document.head.appendChild(link);
    a.dataset.prefetched = 'true';
  });

  // ===== 3) GA4: helper & click tracking =====
  const sendGA = (name, params = {}) => {
    try { window.gtag && gtag('event', name, params); } catch (_) {}
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    // Streaming links
    if (a.classList.contains('stream-link')) {
      const platform = ['youtube','apple','spotify','amazon'].find(p => a.classList.contains(p)) || 'unknown';
      sendGA('click_stream', { platform, link_url: a.href, link_text: (a.textContent || '').trim() });
    }

    // Hero CTAs
    if (a.classList.contains('listen') || a.classList.contains('follow')) {
      sendGA('click_cta', { action: a.classList.contains('listen') ? 'listen' : 'follow', link_url: a.href });
    }

    // Social areas (header/cards/footer)
    if (a.closest('.social-links-header') || a.closest('.social-cards') || a.closest('.social-links')) {
      const label = (a.getAttribute('aria-label') || a.textContent || '').trim();
      sendGA('click_social', { label, link_url: a.href });
    }

    // Any nav link
    if (a.closest('nav')) {
      sendGA('click_nav', { link_url: a.href, link_text: (a.textContent || '').trim() });
    }
  });

  // ===== 4) Player Tabs (YouTube / Apple / Spotify) =====
  (function initTabs(){
    const tablist = document.querySelector('.player-tabs');
    if (!tablist) return;

    const panes = Array.from(document.querySelectorAll('.feature-embed .pane'));
    const show = (selector) => {
      panes.forEach(p => {
        const active = ('#' + p.id) === selector;
        p.classList.toggle('active', active);
        p.style.display = active ? 'block' : 'none';
      });
    };

    // initial state
    panes.forEach((p, i) => { if (!p.classList.contains('active')) p.style.display = 'none'; });

    tablist.addEventListener('click', (e) => {
      const btn = e.target.closest('button.tab');
      if (!btn) return;
      const targetSel = btn.getAttribute('data-target');
      if (!targetSel) return;

      tablist.querySelectorAll('button.tab').forEach(b => {
        const on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      show(targetSel);
      sendGA('switch_player_tab', { label: targetSel.replace('#','') });
    });
  })();

})();