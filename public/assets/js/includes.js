// public/assets/js/includes.js
(function () {
  async function includePartials() {
    const nodes = document.querySelectorAll('[data-include]');
    await Promise.all([...nodes].map(async (el) => {
      const url = el.getAttribute('data-include');
      try {
        const res = await fetch(url, { cache: 'no-cache', credentials: 'omit' });
        if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
        const html = await res.text();
        el.outerHTML = html;
      } catch (e) {
        console.error('Include failed:', url, e);
      }
    }));
    wireHeader();
  }

  function wireHeader() {
    // ドロワー開閉（イベント委譲でパーシャル後もOK）
    document.addEventListener('click', (e) => {
      const hamb = e.target.closest('#hamb');
      if (hamb) {
        const drawer = document.getElementById('drawer');
        const isOpen = hamb.getAttribute('aria-expanded') === 'true';
        hamb.setAttribute('aria-expanded', String(!isOpen));
        if (drawer) drawer.style.display = isOpen ? 'none' : 'block';
      }
      if (e.target.matches('#drawer a')) {
        const drawer = document.getElementById('drawer');
        const hamb2 = document.getElementById('hamb');
        if (drawer) drawer.style.display = 'none';
        if (hamb2) hamb2.setAttribute('aria-expanded', 'false');
      }
    });

    // スクロールでヘッダーを縮める
    const onScroll = () => {
      const hdr = document.querySelector('.site-header');
      if (!hdr) return;
      const y = window.scrollY || 0;
      if (y > 10) hdr.classList.add('shrink'); else hdr.classList.remove('shrink');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  document.addEventListener('DOMContentLoaded', includePartials);
})();
