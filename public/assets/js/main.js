// lang menu
(() => {
  const btn = document.querySelector('.lang-btn');
  const menu = document.getElementById('lang-menu');
  if (!btn || !menu) return;

  const close = () => { menu.style.display = 'none'; btn.setAttribute('aria-expanded','false'); };
  const toggle = () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    menu.style.display = expanded ? 'none' : 'block';
  };

  btn.addEventListener('click', toggle);
  document.addEventListener('click', (e) => { if (!e.target.closest('.lang')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

// hamburger & drawer
(() => {
  const hamb = document.getElementById('hamb');
  const drawer = document.getElementById('drawer');
  if (!hamb || !drawer) return;

  const toggle = () => {
    const open = hamb.getAttribute('aria-expanded') === 'true';
    hamb.setAttribute('aria-expanded', String(!open));
    drawer.style.display = open ? 'none' : 'block';
  };
  hamb.addEventListener('click', toggle);
})();