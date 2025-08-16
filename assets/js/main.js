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
<script>
/* ==== Blog Popular cards (posts.json から自動描画) ==== */
(async () => {
  const grid = document.getElementById('popular-posts');
  if (!grid) return;

  async function loadPosts() {
    // まず絶対パスで取得（本番ホスティング向け）
    try {
      const r = await fetch('/blog/posts.json', { cache: 'no-store' });
      if (r.ok) return r.json();
      throw new Error('abs path not found');
    } catch {
      // ローカル検証用に相対パスも試す
      const r2 = await fetch('blog/posts.json', { cache: 'no-store' }).catch(()=>null);
      if (r2 && r2.ok) return r2.json();
      return [];
    }
  }

  const posts = await loadPosts();
  if (!Array.isArray(posts) || posts.length === 0) {
    grid.innerHTML = `<p style="opacity:.8">まだ記事がありません。</p>`;
    return;
  }

  // 人気順（views desc）→日付 desc
  const top = posts
    .slice()
    .sort((a, b) => {
      const v = (b.views || 0) - (a.views || 0);
      if (v !== 0) return v;
      return new Date(b.date || 0) - new Date(a.date || 0);
    })
    .slice(0, 3);

  const toBadge = tags => (tags && tags.length ? `<span class="badge">${tags[0]}</span>` : '');
  const safe = s => (s || '').replace(/"/g,'&quot;');

  const html = top.map(p => `
    <a class="blog-card" href="${p.url || '/blog/'}">
      <div class="thumb">
        <img src="${p.cover || '/assets/images/blog-fallback.jpg'}"
             alt="${safe(p.title)}" loading="lazy"
             onerror="this.style.display='none'">
        <div class="thumb-fallback"></div>
      </div>
      <div class="card-content">
        <div class="meta">
          ${toBadge(p.tags)}
          <time datetime="${p.date || ''}">
            ${(p.date || '').replace(/-/g,'/')}
          </time>
        </div>
        <h4>${p.title || 'Untitled'}</h4>
        <p class="excerpt">${p.excerpt || ''}</p>
      </div>
    </a>
  `).join('');

  grid.innerHTML = html;
})();
</script>