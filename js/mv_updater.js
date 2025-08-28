document.addEventListener('DOMContentLoaded', () => {
    const videoContainer = document.getElementById('video-list-container');
    
    // 表示したいYouTube動画のIDリスト
    // 新しいMVを公開したら、このリストの先頭に動画IDを追加してください。
    const videoIds = [
        "hrkK4HNHNdA",
        "iMUzwx4xw5M",
        "uNartEoU2mY",
        "vouUmGWAY5U"
    ];

    if (videoContainer && videoIds.length > 0) {
        let videoHTML = '';
        videoIds.forEach(videoId => {
            videoHTML += `
                <div class="video-item">
                    <iframe 
                        src="https://www.youtube.com/embed/${videoId}" 
                        title="YouTube video player" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
            `;
        });
        videoContainer.innerHTML = videoHTML;
    } else if (videoContainer) {
        videoContainer.innerHTML = '<p style="text-align: center;">現在公開中のミュージックビデオはありません。</p>';
    }
});