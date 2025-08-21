// ========== Atmos Halo Header – Polished (Full) ==========

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.aria-header');

  // ハンバーガーが万一重複していたら1個だけ残す
  const toggleBtns = Array.from(document.querySelectorAll('.aria-nav__toggle'));
  if (toggleBtns.length > 1) {
    toggleBtns.slice(1).forEach(btn => btn.remove());
  }
  const toggleBtn  = document.querySelector('.aria-nav__toggle');
  const toggleIcon = document.querySelector('.aria-nav__toggle-icon');

  const leftList  = document.querySelector('.aria-nav__list--left');
  const rightList = document.querySelector('.aria-nav__list--right');
  const mainEl    = document.getElementById('main');

  /* ---------- Scrim ---------- */
  let scrim = document.querySelector('.aria-scrim');
  if (!scrim) {
    scrim = document.createElement('div');
    scrim.className = 'aria-scrim';
    document.body.appendChild(scrim);
  }

  /* ---------- Drawer ---------- */
  let drawer = document.getElementById('aria-drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'aria-drawer';
    drawer.className = 'aria-drawer';
    const ul = document.createElement('ul');

    const buildItem = (href, label) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href; a.textContent = label;
      li.appendChild(a);
      return li;
    };

    // 左右のPCナビから項目を転記 + LISTENを追加
    [
      ...Array.from(leftList?.querySelectorAll('a') || []).map(a => [a.getAttribute('href'), a.textContent]),
      ...Array.from(rightList?.querySelectorAll('a') || []).map(a => [a.getAttribute('href'), a.textContent]),
      ['#listen', 'LISTEN']
    ].forEach(([href, label]) => ul.appendChild(buildItem(href, label)));

    drawer.appendChild(ul);
    header.appendChild(drawer);
  }

  /* ---------- Open / Close with focus trap ---------- */
  const focusableSelector = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const getFocusable = (root) => Array.from(root.querySelectorAll(focusableSelector)).filter(el => !el.hasAttribute('disabled'));

  const openDrawer = () => {
    drawer.classList.add('is-open');
    scrim.classList.add('is-open');
    toggleBtn?.setAttribute('aria-expanded', 'true');
    if (toggleIcon) toggleIcon.src = '/assets/img/icon-close.png';
    document.body.style.overflow = 'hidden';
    if (mainEl) mainEl.setAttribute('aria-hidden', 'true');

    // Focus trap
    const focusables = getFocusable(drawer);
    focusables[0]?.focus();
    const trap = (e) => {
      if (e.key !== 'Tab') return;
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    };
    drawer.addEventListener('keydown', trap);
    drawer._trap = trap;
  };

  const closeDrawer = () => {
    drawer.classList.remove('is-open');
    scrim.classList.remove('is-open');
    toggleBtn?.setAttribute('aria-expanded', 'false');
    if (toggleIcon) toggleIcon.src = '/assets/img/icon-menu.png';
    document.body.style.overflow = '';
    if (mainEl) mainEl.removeAttribute('aria-hidden');
    if (drawer._trap) drawer.removeEventListener('keydown', drawer._trap);
    toggleBtn?.focus();
  };

  // Toggle
  toggleBtn?.addEventListener('click', () => {
    if (drawer.classList.contains('is-open')) closeDrawer();
    else openDrawer();
  });

  // Scrim click to close
  scrim.addEventListener('click', closeDrawer);

  // Outside click (header内でもdrawer外なら閉じる)
  document.addEventListener('click', (e) => {
    if (!drawer.classList.contains('is-open')) return;
    const clickedToggle = toggleBtn && toggleBtn.contains(e.target);
    if (!clickedToggle && !drawer.contains(e.target)) closeDrawer();
  });

  // Esc to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
  });

  // Drawer link click closes drawer
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

  // Elevation on scroll
  const onScroll = () => {
    if (window.scrollY > 6) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Close drawer on resize to desktop
  const onResize = () => {
    if (window.matchMedia('(min-width: 961px)').matches && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  };
  window.addEventListener('resize', onResize);

  /* ---------- ScrollSpy ---------- */
  const navLinks = Array.from((leftList?.querySelectorAll('a') || []))
    .concat(Array.from(rightList?.querySelectorAll('a') || []));

  const idFromHref = (href) => (href && href.startsWith('#')) ? href.slice(1) : null;
  const sections = navLinks
    .map(a => document.getElementById(idFromHref(a.getAttribute('href'))))
    .filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach(a => {
      const isActive = id && id === idFromHref(a.getAttribute('href'));
      a.classList.toggle('is-active', !!isActive);
      a.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { root: null, threshold: 0.5, rootMargin: "-40% 0px -55% 0px" });

  sections.forEach(sec => io.observe(sec));
});
