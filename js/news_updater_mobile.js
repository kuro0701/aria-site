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
            newsHTML += `
                <li class="news-item">
                    <a href="${post.url}">
                        <time datetime="${post.datetime}">${post.date}</time>
                        <p class="news-title">${post.title}</p>
                    </a>
                </li>
            `;
        });
        newsContainer.innerHTML = newsHTML;
    }
});