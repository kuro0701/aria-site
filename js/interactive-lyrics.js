// YouTube IFrame Player API関連の変数は今回は使用しない
// let player;
// let lyrics, lyricSpans;
// let lyricInterval;
// const YOUTUBE_VIDEO_ID = 'fl09mV_RFjk'; // このIDも今回は不要

// YouTube IFrame Player APIの準備ができたら呼ばれる関数 (今回は未使用)
/*
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
*/

// プレーヤーの準備ができたら呼ばれる関数 (今回は未使用)
/*
function onPlayerReady(event) {
    const playPauseBtn = document.getElementById('play-pause-btn');
    
    playPauseBtn.addEventListener('click', () => {
        const playerState = player.getPlayerState();
        if (playerState === YT.PlayerState.PLAYING) {
            player.pauseVideo();
            playPauseBtn.classList.remove('playing');
            clearInterval(lyricInterval);
        } else {
            player.playVideo();
            playPauseBtn.classList.add('playing');
            lyricInterval = setInterval(updateLyricHighlight, 250);
        }
    });
}
*/

// 歌詞のハイライトを更新する関数 (今回は未使用)
/*
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

    lyricSpans.forEach(span => span.classList.remove('current'));

    if (currentLyric) {
        currentLyric.classList.add('current');
    }
}
*/


// インタラクティブな歌詞やポップアップの初期設定を行う関数
function initializeLyricInteraction() {
    // lyricSpans = document.querySelectorAll('#lyrics-container span[data-time]'); // タイムスタンプ付きのspanは今回対象外
    const interactiveLyrics = document.querySelectorAll('.interactive-lyric');
    const popup = document.getElementById('lyric-popup');
    const popupContent = document.getElementById('lyric-popup-content');
    const popupClose = document.getElementById('lyric-popup-close');

    interactiveLyrics.forEach(lyric => {
        lyric.addEventListener('click', () => {
            const quote = lyric.dataset.quote;
            if (quote) {
                // テキスト内の改行を<br>タグに変換してHTMLに挿入
                popupContent.innerHTML = quote.replace(/\n/g, '<br>');
                popup.classList.add('is-visible');
            }
        });
    });

    // ポップアップを閉じる
    popupClose.addEventListener('click', () => {
        popup.classList.remove('is-visible');
    });

    // ポップアップの外側をクリックしても閉じる
    popup.addEventListener('click', (event) => {
        if (event.target === popup) {
            popup.classList.remove('is-visible');
        }
    });
}

// DOMの読み込みが完了したら、インタラクションの初期化を実行
document.addEventListener('DOMContentLoaded', () => {
    initializeLyricInteraction();
});