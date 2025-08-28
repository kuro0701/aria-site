let player;
let lyrics, lyricSpans;
let lyricInterval;

// "Neon Dreams" のYouTube動画ID
const YOUTUBE_VIDEO_ID = 'fl09mV_RFjk';

// YouTube IFrame Player APIの準備ができたら呼ばれる関数
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '360',
        width: '640',
        videoId: YOUTUBE_VIDEO_ID,
        events: {
            'onReady': onPlayerReady
        }
    });
}

// プレーヤーの準備ができたら呼ばれる関数
function onPlayerReady(event) {
    const playPauseBtn = document.getElementById('play-pause-btn');
    
    // 再生・一時停止ボタンのクリックイベント
    playPauseBtn.addEventListener('click', () => {
        const playerState = player.getPlayerState();
        if (playerState === YT.PlayerState.PLAYING) {
            player.pauseVideo();
            playPauseBtn.classList.remove('playing');
            clearInterval(lyricInterval);
        } else {
            player.playVideo();
            playPauseBtn.classList.add('playing');
            lyricInterval = setInterval(updateLyricHighlight, 250); // 0.25秒ごとに歌詞を更新
        }
    });

    initializeLyricInteraction();
}

// 歌詞のハイライトを更新する関数
function updateLyricHighlight() {
    if (!player || typeof player.getCurrentTime !== 'function') return;

    const currentTime = player.getCurrentTime();
    let currentLyric = null;

    for (let i = 0; i < lyricSpans.length; i++) {
        const span = lyricSpans[i];
        const time = parseFloat(span.dataset.time);

        if (currentTime >= time) {
            currentLyric = span;
        } else {
            break; 
        }
    }

    // 全てのハイライトを一度リセット
    lyricSpans.forEach(span => span.classList.remove('current'));

    // 現在の行をハイライト
    if (currentLyric) {
        currentLyric.classList.add('current');
    }
}


// インタラクティブな歌詞やポップアップの初期設定
function initializeLyricInteraction() {
    lyricSpans = document.querySelectorAll('#lyrics-container span[data-time]');
    const interactiveLyrics = document.querySelectorAll('.interactive-lyric');
    const popup = document.getElementById('lyric-popup');
    const popupContent = document.getElementById('lyric-popup-content');
    const popupClose = document.getElementById('lyric-popup-close');

    interactiveLyrics.forEach(lyric => {
        lyric.addEventListener('click', () => {
            const quote = lyric.dataset.quote;
            if (quote) {
                popupContent.textContent = quote;
                popup.classList.add('is-visible');
            }
        });
    });

    // ポップアップを閉じる
    popupClose.addEventListener('click', () => {
        popup.classList.remove('is-visible');
    });

    popup.addEventListener('click', (event) => {
        if (event.target === popup) {
            popup.classList.remove('is-visible');
        }
    });
}