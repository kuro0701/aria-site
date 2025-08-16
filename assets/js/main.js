// main.js
// Adds dynamic interactions for the ARIA website

document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav a');

  // Change navbar background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(15, 13, 33, 0.9)';
    } else {
      navbar.style.background = 'rgba(0, 0, 0, 0.6)';
    }
  });

  // Smooth scroll for anchor links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});
// ===== Popular posts loader =====
(async () => {
  const root = document.querySelector('#popular-posts');
  if (!root) return;

  try {
    // 同一オリジンに /blog/posts.json を置く
    const res = await fetch('/blog/posts.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('posts.json not found');
    const posts = await res.json();

    // 並べ替え方針: views降順 → date降順（viewsが無い時はdateのみ）
    posts.sort((a, b) => {
      const va = Number(a.views || 0), vb = Number(b.views || 0);
      if (vb !== va) return vb - va;
      return new Date(b.date) - new Date(a.date);
    });

    const top = posts.slice(0, 3);

    root.innerHTML = top.map(p => {
      const href = p.url || `/blog/${p.slug}/`;
      const cover = p.cover || '/assets/images/blog-intro.png';
      const date  = p.date ? new Date(p.date).toLocaleDateString('ja-JP') : '';
      const badge = (p.tags && p.tags[0]) ? p.tags[0] : 'Blog';

      return `
        <a class="p-card" href="${href}">
          <div class="thumb">
            <img src="${cover}" alt="${p.title || ''}" loading="lazy">
          </div>
          <div class="content">
            <div class="meta"><span class="badge">${badge}</span>${date ? `<time>${date}</time>`:''}</div>
            <h3>${p.title || ''}</h3>
            <p class="excerpt">${p.excerpt || ''}</p>
          </div>
        </a>
      `;
    }).join('');
  } catch (e) {
    // 失敗時はフォールバック
    root.innerHTML = `
      <a class="p-card" href="/blog/">
        <div class="thumb"><img src="/assets/images/blog-intro.png" alt="Blog"></div>
        <div class="content">
          <div class="meta"><span class="badge">Blog</span></div>
          <h3>ブログへ</h3>
          <p class="excerpt">最新の記事を一覧でチェック。</p>
        </div>
      </a>
    `;
  }
})();