document.addEventListener('DOMContentLoaded', () => {
    const blogContainer = document.getElementById('blog-list-container');

    // blog_data.js の blogPosts が存在するか確認
    if (blogContainer && typeof blogPosts !== 'undefined') {
        if (blogPosts.length === 0) {
            blogContainer.innerHTML = '<p style="text-align: center;">まだ記事がありません。</p>';
            return;
        }

        let blogHTML = '';
        blogPosts.forEach(post => {
            blogHTML += `
                <li class="blog-item">
                    <a href="${post.url}" class="blog-link">
                        <div class="blog-thumbnail">
                            <img src="${post.thumbnail}" alt="">
                        </div>
                        <div class="blog-info">
                            <time class="blog-date" datetime="${post.datetime}">${post.date}</time>
                            <h2 class="blog-title">${post.title}</h2>
                            <p class="blog-excerpt">${post.excerpt}</p>
                        </div>
                    </a>
                </li>
            `;
        });
        blogContainer.innerHTML = blogHTML;
    }
});