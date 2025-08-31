document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-list-container');

    if (newsContainer && typeof blogPosts !== 'undefined') {
        const postsToShow = blogPosts.slice(0, 3);

        if (postsToShow.length === 0) {
            newsContainer.innerHTML = '<li><p>新しいお知らせはありません。</p></li>';
            return;
        }

        let newsHTML = '';
        postsToShow.forEach(post => {
            // スマートフォン版のHTML構造に統一
            newsHTML += `
                <li class="news-item">
                    <a href="${post.url}" class="news-item__link">
                        <div>
                            <time datetime="${post.datetime}" class="news-item__date">${post.date}</time>
                            <span class="news-item__title">${post.title}</span>
                        </div>
                    </a>
                </li>
            `;
        });
        newsContainer.innerHTML = newsHTML;
    }
});