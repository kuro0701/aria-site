document.addEventListener('DOMContentLoaded', () => {
    const lyricsContainer = document.getElementById('lyrics-list-container');

    if (lyricsContainer && typeof lyricsData !== 'undefined' && lyricsData.length > 0) {
        let lyricsHTML = '';
        lyricsData.forEach(song => {
            lyricsHTML += `
                <li class="blog-item">
                    <a href="${song.url}" class="blog-link">
                        <div class="blog-thumbnail">
                            <img src="${song.thumbnail}" alt="${song.title} artwork">
                        </div>
                        <div class="blog-info">
                            <h2 class="blog-title">${song.title}</h2>
                            <p class="blog-excerpt">${song.description}</p>
                            <p class="lyrics-snippet">${song.snippet}</p>
                        </div>
                    </a>
                </li>
            `;
        });
        lyricsContainer.innerHTML = lyricsHTML;
    }
});