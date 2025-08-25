document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-list-container');
    
    // blog_data.js の blogPosts が存在するか確認
    if (newsContainer && typeof blogPosts !== 'undefined') {
        // 表示する記事の数を設定（ここでは最新3件）
        const postsToShow = blogPosts.slice(0, 3);

        if (postsToShow.length === 0) {
            newsContainer.innerHTML = '<li><p>新しいお知らせはありません。</p></li>';
            return;
        }

        let newsHTML = '';
        postsToShow.forEach(post => {
            newsHTML += `
                <li>
                    <time datetime="${post.datetime}">${post.date}</time>
                    <a href="${post.url}">${post.title}</a>
                </li>
            `;
        });
        newsContainer.innerHTML = newsHTML;
    }
});