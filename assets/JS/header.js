// ========== Atmos Halo Header Script ==========
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.aria-header');
  const toggleBtn = document.querySelector('.aria-nav__toggle');
  const toggleIcon = document.querySelector('.aria-nav__toggle-icon');

  // PCナビ（左右） – モバイルではドロワーに複製して使う
  const leftList = document.querySelector('.aria-nav__list--left');
  const rightList = document.querySelector('.aria-nav__list--right');

  // モバイルドロワー生成
  let drawer = document.querySelector('.aria-drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.className = 'aria-drawer';
    const ul = document.createElement('ul');

    const buildItem = (href, label) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href; a.textContent = label;
      li.appendChild(a); return li;
    };

    // 左右リストから項目を転記
    [
      ...Array.from(leftList?.querySelectorAll('a') || []).map(a => [a.getAttribute('href'), a.textContent]),
      ...Array.from(rightList?.querySelectorAll('a') || []).map(a => [a.getAttribute('href'), a.textContent]),
      ['#listen', 'LISTEN'] // 追加: CTAの対象
    ].forEach(([href, label]) => ul.appendChild(buildItem(href, label)));

    drawer.appendChild(ul);
    header.appendChild(drawer);
  }

  const drawerLinks = () => Array.from(drawer.querySelectorAll('a'));

  const openDrawer = () => {
    drawer.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    if (toggleIcon) toggleIcon.src = '/assets/img/icon-close.png';
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    if (toggleIcon) toggleIcon.src = '/assets/img/icon-menu.png';
    document.body.style.overflow = '';
  };

  // トグル動作
  toggleBtn?.addEventListener('click', () => {
    if (drawer.classList.contains('is-open')) closeDrawer();
    else openDrawer();
  });

  // 外側クリックでクローズ
  document.addEventListener('click', (e) => {
    if (!drawer.classList.contains('is-open')) return;
    const withinHeader = header.contains(e.target);
    const clickedToggle = toggleBtn && toggleBtn.contains(e.target);
    if (withinHeader && !clickedToggle && !drawer.contains(e.target)) {
      closeDrawer();
    }
  });

  // Escでクローズ
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
  });

  // ドロワー内リンククリックでクローズ
  drawerLinks().forEach(a => a.addEventListener('click', closeDrawer));

  // スクロール時の微エレベーション
  const onScroll = () => {
    if (window.scrollY > 6) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});
