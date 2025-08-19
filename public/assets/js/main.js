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
// === header shrink on scroll ===
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const TH = 24; // 24px超で縮小
  let last = 0;
  const onScroll = () => {
    const y = window.scrollY || 0;
    if (y > TH && last <= TH) header.classList.add('shrink');
    if (y <= TH && last > TH) header.classList.remove('shrink');
    last = y;
  };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
})();

// === nav active (hash-based fallback) ===
(() => {
  const links = [...document.querySelectorAll('nav.primary a')];
  if (!links.length) return;
  const setActive = (hash) => {
    links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === hash));
  };
  window.addEventListener('hashchange', () => setActive(location.hash));
  setActive(location.hash || '#music');
})();
// ===== Scroll Active Nav =====
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll("nav.primary a");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        // 全部リセット
        navLinks.forEach(link => link.classList.remove("is-active"));
        // id一致リンクを点灯
        const active = document.querySelector(`nav.primary a[href="#${entry.target.id}"]`);
        if(active) active.classList.add("is-active");
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(sec => observer.observe(sec));
});
/* Dockの外枠がゆっくり呼吸するように光る */
.right.dock::before{
  content:""; position:absolute; inset:-3px; border-radius:20px;
  background: radial-gradient(circle at 30% 30%, rgba(122,167,255,.3), transparent 60%),
              radial-gradient(circle at 70% 70%, rgba(199,210,255,.25), transparent 60%);
  filter: blur(12px);
  animation: dock-breathe 6s ease-in-out infinite;
  z-index:-1;
}

@keyframes dock-breathe{
  0%  { opacity:.3; transform: scale(1);}
  50% { opacity:.65; transform: scale(1.04);}
  100%{ opacity:.3; transform: scale(1);}
}