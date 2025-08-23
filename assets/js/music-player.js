// ARIA Music Player - YouTube Integration (No API Key Required)
// @NexusAria チャンネルの音楽を手動管理で再生

class ARIAMusicPlayer {
    constructor() {
        // Player State
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.currentTrackIndex = 0;
        
        // YouTube Player
        this.player = null;
        this.playerReady = false;
        
        // Channel Info
        this.channelHandle = '@NexusAria';
        this.channelUrl = 'https://www.youtube.com/@NexusAria';
        
        // 手動で管理する動画リスト - 最新リリースに更新
        // @NexusAria チャンネルの楽曲
        // 新しい曲を追加する場合: YouTube URLから watch?v=XXXXX のXXXXX部分をコピー
        this.videos = this.loadVideoList();
        
        // YouTubeプレイリストを使用する場合（オプション）
        this.playlistId = null; // 'YOUR_PLAYLIST_ID' を設定可能
        
        // 右側のプレーヤー専用の楽曲リスト
        this.playerTracks = [
            {
                videoId: 'dQw4w9WgXcQ', // サンプル動画ID - 実際のIDに置き換えてください
                title: 'DIGITAL ANGEL',
                artist: 'ARIA',
                album: 'Harmony Dimension',
                duration: '3:47'
            },
            {
                videoId: 'pTL_XZpYDzM', // サンプル動画ID - 実際のIDに置き換えてください
                title: 'QUANTUM HEART',
                artist: 'ARIA',
                album: 'Nexus Collection',
                duration: '4:12'
            },
            {
                videoId: '7hXsZkmDaic', // サンプル動画ID - 実際のIDに置き換えてください
                title: 'Singularity Genesis',
                artist: 'ARIA',
                album: 'Beyond Dimensions',
                duration: '5:23'
            }
        ];
        
        // 現在のプレーヤートラックインデックス
        this.currentPlayerTrackIndex = 0;
        
        // Waveform Canvas
        this.waveformCanvas = null;
        this.waveformCtx = null;
        
        // Update interval
        this.updateInterval = null;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupControls();
        this.setupProgressBar();
        this.sortVideosByDate();
        this.renderYouTubeGrid();  // グリッドを描画
        this.setupVideoItems();
        this.setupPlayerTrackControls(); // プレーヤートラックコントロールのセットアップ
        this.updatePlayerTrackInfo(0); // 最初のトラック情報を表示
        
        // YouTube IFrame API の準備ができたら呼ばれる
        window.onYouTubeIframeAPIReady = () => {
            this.initYouTubePlayer();
        };
        
        // すでにAPIが読み込まれている場合
        if (window.YT && window.YT.Player) {
            this.initYouTubePlayer();
        }
        
        // 動画リスト更新ボタンの追加
        this.addUpdateButton();
        
        // ローカルストレージに動画リストを保存する機能
        this.setupVideoListStorage();
    }
    
    // Render YouTube videos grid
    renderYouTubeGrid() {
        const gridContainer = document.getElementById('youtube-videos-grid');
        if (!gridContainer) return;
        
        // 最新6件を表示
        const latestVideos = this.videos.slice(0, 6);
        
        gridContainer.innerHTML = latestVideos.map((video, index) => {
            const isDolby = video.isDolby || video.title.includes('Dolby');
            const displayTitle = isDolby && !video.title.includes('Dolby') ? 
                `${video.title} <span class="dolby-tag">Dolby</span>` : video.title;
            
            // プレースホルダー画像（実際のYouTubeサムネイルが取得できない場合）
            const thumbnailUrl = video.videoId.includes('_ID') ? 
                `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='360' viewBox='0 0 480 360'%3E%3Crect fill='%23333' width='480' height='360'/%3E%3Ctext x='50%25' y='50%25' fill='white' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='24'%3E${encodeURIComponent(video.title)}%3C/text%3E%3C/svg%3E` :
                `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;
            
            return `
                <div class="video-item" data-video-id="${video.videoId}" data-index="${index}">
                    <div class="video-thumbnail">
                        <img src="${thumbnailUrl}" 
                             alt="${video.title}"
                             onerror="this.src='https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg'">
                        <div class="play-overlay">
                            <svg width="48" height="48" viewBox="0 0 24 24">
                                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                            </svg>
                        </div>
                        ${isDolby ? '<div class="dolby-badge">DOLBY ATMOS</div>' : ''}
                        ${video.status && video.status !== '再生リストの全体を見る' ? 
                            `<div class="update-badge">${video.status}</div>` : ''}
                    </div>
                    <div class="video-info">
                        <h4 class="video-title">${displayTitle}</h4>
                        <p class="video-meta">${video.artist} • ${video.album}</p>
                        ${video.status === '再生リストの全体を見る' ? 
                            '<p class="video-status">再生リストの全体を見る</p>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // 動画を日付順にソート
    sortVideosByDate() {
        this.videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    }
    
    // 動画リストを読み込む（ローカルストレージから）
    loadVideoList() {
        // デフォルトの動画リスト
        const defaultVideos = [
            {
                videoId: 'dQw4w9WgXcQ',  // サンプルID - 実際のIDに置き換え
                title: 'Aethelburg',
                artist: 'Aria Nexus',
                album: 'Harmony Collection',
                publishedAt: new Date().toISOString().split('T')[0],
                status: '本日更新',
                isDolby: false
            },
            {
                videoId: 'pTL_XZpYDzM',  // サンプルID - 実際のIDに置き換え
                title: 'Singularity Genesis',
                artist: 'Aria Nexus',
                album: 'Nexus Album',
                publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: '更新: 2日前',
                isDolby: true
            },
            {
                videoId: '7hXsZkmDaic',  // サンプルID - 実際のIDに置き換え
                title: 'Divine Realms',
                artist: 'Aria Nexus',
                album: 'Crystal Voice',
                publishedAt: '2024-12-20',
                status: '再生リストの全体を見る',
                isDolby: false
            },
            {
                videoId: 'kJQP7kiw5Fk',  // サンプルID - 実際のIDに置き換え
                title: 'Crypto assets',
                artist: 'Aria Nexus',
                album: 'Digital Dreams',
                publishedAt: '2024-12-19',
                status: '再生リストの全体を見る',
                isDolby: false
            },
            {
                videoId: 'JGwWNGJdvx8',  // サンプルID - 実際のIDに置き換え
                title: 'QUANTUM HEART',
                artist: 'Aria Nexus',
                album: 'Quantum Collection',
                publishedAt: '2024-12-18',
                status: '再生リストの全体を見る',
                isDolby: true
            },
            {
                videoId: '9bZkp7q19f0',  // サンプルID - 実際のIDに置き換え
                title: 'DIGITAL ANGEL',
                artist: 'ARIA',
                album: '@NexusAria',
                publishedAt: '2024-12-10',
                isDolby: false
            }
        ];
        
        // ローカルストレージから読み込み
        try {
            const stored = localStorage.getItem('ariaVideoList');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.log('Using default video list');
        }
        
        return defaultVideos;
    }
    
    // ローカルストレージのセットアップ
    setupVideoListStorage() {
        // 現在のリストを保存
        this.saveVideoList();
    }
    
    // 動画リストを保存
    saveVideoList() {
        try {
            localStorage.setItem('ariaVideoList', JSON.stringify(this.videos));
        } catch (e) {
            console.error('Failed to save video list:', e);
        }
    }
    
    // プレーヤートラックコントロールのセットアップ
    setupPlayerTrackControls() {
        // プレーヤー用のトラックナビゲーション
        const prevBtn = document.getElementById('prevTrack');
        const nextBtn = document.getElementById('nextTrack');
        
        if (prevBtn) {
            prevBtn.removeEventListener('click', this.previousTrack);
            prevBtn.addEventListener('click', () => this.previousPlayerTrack());
        }
        
        if (nextBtn) {
            nextBtn.removeEventListener('click', this.nextTrack);
            nextBtn.addEventListener('click', () => this.nextPlayerTrack());
        }
    }
    
    // プレーヤートラック情報を更新
    updatePlayerTrackInfo(index) {
        if (index < 0 || index >= this.playerTracks.length) return;
        
        const track = this.playerTracks[index];
        this.currentPlayerTrackIndex = index;
        
        // トラック情報を更新
        const trackTitle = document.getElementById('trackTitle');
        const trackArtist = document.getElementById('trackArtist');
        const trackAlbum = document.getElementById('trackAlbum');
        
        if (trackTitle) trackTitle.textContent = track.title;
        if (trackArtist) trackArtist.textContent = track.artist;
        if (trackAlbum) trackAlbum.textContent = track.album;
        
        // トラックインジケーターを更新
        const trackCurrent = document.querySelector('.track-current');
        const trackTotal = document.querySelector('.track-total');
        if (trackCurrent) trackCurrent.textContent = index + 1;
        if (trackTotal) trackTotal.textContent = this.playerTracks.length;
        
        // YouTube動画をロード
        if (this.player && this.playerReady) {
            this.player.loadVideoById(track.videoId);
        }
        
        // アートワークを更新
        this.updatePlayerArtwork(track);
        
        // YouTube リンクを更新
        const youtubeLink = document.querySelector('.youtube-music-link');
        if (youtubeLink && track.videoId) {
            youtubeLink.href = `https://www.youtube.com/watch?v=${track.videoId}`;
        }
    }
    
    // プレーヤー用アートワークを更新
    updatePlayerArtwork(track) {
        const artworkContainer = document.querySelector('.track-artwork');
        if (!artworkContainer) return;
        
        // YouTubeのサムネイルを使用
        const thumbnailUrl = `https://img.youtube.com/vi/${track.videoId}/maxresdefault.jpg`;
        const fallbackUrl = `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`;
        
        artworkContainer.innerHTML = `
            <img src="${thumbnailUrl}" 
                 onerror="this.src='${fallbackUrl}'" 
                 alt="${track.title}" 
                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
            <div class="artwork-glow"></div>
        `;
    }
    
    // 次のプレーヤートラック
    nextPlayerTrack() {
        const nextIndex = (this.currentPlayerTrackIndex + 1) % this.playerTracks.length;
        this.updatePlayerTrackInfo(nextIndex);
    }
    
    // 前のプレーヤートラック
    previousPlayerTrack() {
        const prevIndex = this.currentPlayerTrackIndex === 0 ? 
            this.playerTracks.length - 1 : this.currentPlayerTrackIndex - 1;
        this.updatePlayerTrackInfo(prevIndex);
    }
    
    // 動画リスト更新用のUIを追加
    addUpdateButton() {
        const playerSection = document.querySelector('.music-player-section');
        if (!playerSection) return;
        
        // 管理者用の更新インターフェース（通常は非表示）
        const updateInterface = document.createElement('div');
        updateInterface.className = 'update-interface';
        updateInterface.style.cssText = 'display: none; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 8px; margin: 20px;';
        updateInterface.innerHTML = `
            <h4 style="color: white; margin-bottom: 10px;">動画リストを更新</h4>
            <input type="text" id="newVideoId" placeholder="YouTube動画ID" style="padding: 5px; margin-right: 10px;">
            <input type="text" id="newVideoTitle" placeholder="タイトル" style="padding: 5px; margin-right: 10px;">
            <button onclick="window.ariaMusicPlayer.addNewVideo()" style="padding: 5px 10px;">追加</button>
            <div id="videoListDisplay" style="color: white; margin-top: 10px; font-size: 12px;"></div>
        `;
        
        // Ctrl+Shift+Uで表示/非表示を切り替え（管理者用）
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'U') {
                updateInterface.style.display = updateInterface.style.display === 'none' ? 'block' : 'none';
                this.displayVideoList();
            }
        });
        
        playerSection.appendChild(updateInterface);
    }
    
    // 新しい動画を追加（管理者用）
    addNewVideo() {
        const videoId = document.getElementById('newVideoId')?.value;
        const title = document.getElementById('newVideoTitle')?.value;
        
        if (!videoId || !title) {
            alert('動画IDとタイトルを入力してください');
            return;
        }
        
        const newVideo = {
            videoId: videoId,
            title: title,
            artist: 'ARIA',
            album: '@NexusAria',
            publishedAt: new Date().toISOString().split('T')[0]
        };
        
        this.videos.unshift(newVideo); // 最新として先頭に追加
        this.saveVideoList(); // ローカルストレージに保存
        this.renderYouTubeGrid(); // グリッドを再描画
        this.setupVideoItems(); // イベントリスナーを再設定
        this.displayVideoList();
        
        // 入力フィールドをクリア
        document.getElementById('newVideoId').value = '';
        document.getElementById('newVideoTitle').value = '';
        
        console.log('新しい動画を追加:', newVideo);
        console.log('現在のリスト:', this.videos);
        
        // プレーヤートラックリストにも追加するか確認
        if (confirm('この曲をプレーヤーリストにも追加しますか？')) {
            this.playerTracks.push({
                videoId: newVideo.videoId,
                title: newVideo.title,
                artist: newVideo.artist,
                album: newVideo.album,
                duration: 'Unknown'
            });
            this.updatePlayerTrackInfo(this.playerTracks.length - 1);
        }
    }
    
    // 動画リストを表示（管理者用）
    displayVideoList() {
        const display = document.getElementById('videoListDisplay');
        if (!display) return;
        
        display.innerHTML = '<h5>現在の動画リスト:</h5>' + 
            this.videos.map((v, i) => 
                `${i+1}. ${v.title} (${v.videoId})`
            ).join('<br>');
    }
    
    // YouTube Player の初期化
    initYouTubePlayer() {
        // プレーヤー用のトラックを使用
        const initialVideoId = this.playerTracks[0]?.videoId || this.videos[0]?.videoId || '';
        
        const playerOptions = {
            height: '0',
            width: '0',
            videoId: initialVideoId,
            playerVars: {
                'autoplay': 0,
                'controls': 0,
                'disablekb': 1,
                'enablejsapi': 1,
                'fs': 0,
                'modestbranding': 1,
                'origin': window.location.origin,
                'playsinline': 1,
                'rel': 0,
                'showinfo': 0
            },
            events: {
                'onReady': (event) => this.onPlayerReady(event),
                'onStateChange': (event) => this.onPlayerStateChange(event),
                'onError': (event) => this.onPlayerError(event)
            }
        };
        
        // プレイリストを使用する場合
        if (this.playlistId) {
            delete playerOptions.videoId;
            playerOptions.playerVars.list = this.playlistId;
            playerOptions.playerVars.listType = 'playlist';
        }
        
        this.player = new YT.Player('youtube-player', playerOptions);
    }
    
    onPlayerReady(event) {
        this.playerReady = true;
        console.log('YouTube Player Ready');
        console.log('Loaded videos:', this.videos.length);
        
        // 最初のトラック情報を更新
        if (this.videos.length > 0) {
            this.updateTrackInfo(this.videos[0]);
            this.updateArtwork(this.videos[0]);
        }
        
        // プログレスバー更新のタイマー
        this.startProgressTimer();
    }
    
    onPlayerStateChange(event) {
        switch(event.data) {
            case YT.PlayerState.PLAYING:
                this.isPlaying = true;
                this.updatePlayButton();
                this.highlightCurrentVideo();
                
                // 現在の動画情報を取得して表示
                if (this.playlistId && this.player.getVideoData) {
                    const videoData = this.player.getVideoData();
                    this.updateTrackInfoFromVideoData(videoData);
                }
                break;
            case YT.PlayerState.PAUSED:
                this.isPlaying = false;
                this.updatePlayButton();
                break;
            case YT.PlayerState.ENDED:
                this.nextTrack();
                break;
            case YT.PlayerState.BUFFERING:
                console.log('Buffering...');
                break;
        }
    }
    
    onPlayerError(event) {
        console.error('YouTube Player Error:', event.data);
        switch(event.data) {
            case 2:
                console.error('無効な動画ID');
                break;
            case 5:
                console.error('HTML5プレーヤーエラー');
                break;
            case 100:
                console.error('動画が見つかりません（非公開または削除済み）');
                break;
            case 101:
            case 150:
                console.error('動画の埋め込みが許可されていません');
                break;
        }
        // エラー時は次の動画を試す
        if (this.videos.length > 1) {
            this.nextTrack();
        }
    }
    
    // YouTubeの動画データから情報を更新
    updateTrackInfoFromVideoData(videoData) {
        if (!videoData) return;
        
        const trackInfo = {
            videoId: videoData.video_id,
            title: videoData.title || 'Unknown Title',
            artist: videoData.author || 'ARIA',
            album: '@NexusAria'
        };
        
        this.updateTrackInfo(trackInfo);
    }
    
    // 動画をロード
    loadVideo(index) {
        if (!this.playerReady || index < 0 || index >= this.videos.length) return;
        
        this.currentTrackIndex = index;
        const video = this.videos[index];
        
        // YouTube Player に動画をロード
        if (this.player && this.player.loadVideoById) {
            this.player.loadVideoById(video.videoId);
        }
        
        // トラック情報を更新
        this.updateTrackInfo(video);
        
        // アートワークを更新
        this.updateArtwork(video);
        
        // YouTube リンクを更新
        this.updateYouTubeLink(video);
        
        // トラックインジケーターを更新
        this.updateTrackIndicator();
    }
    
    // トラック情報を更新
    updateTrackInfo(video) {
        const trackTitle = document.getElementById('trackTitle');
        const trackArtist = document.getElementById('trackArtist');
        const trackAlbum = document.getElementById('trackAlbum');
        
        if (trackTitle) trackTitle.textContent = video.title || 'Loading...';
        if (trackArtist) trackArtist.textContent = video.artist || 'ARIA';
        if (trackAlbum) trackAlbum.textContent = video.album || '@NexusAria';
        
        // ミニプレーヤー情報を更新
        const trackNameMini = document.querySelector('.track-name-mini');
        const trackInfoMini = document.querySelector('.track-info-mini');
        if (trackNameMini) trackNameMini.textContent = video.title || 'Loading...';
        if (trackInfoMini) {
            trackInfoMini.textContent = `${video.artist || 'ARIA'} • ${video.album || '@NexusAria'}`;
        }
    }
    
    // アートワークを更新
    updateArtwork(video) {
        const artworkContainer = document.querySelector('.track-artwork');
        if (!artworkContainer) return;
        
        // YouTubeのサムネイルを使用
        if (video.videoId && !video.videoId.includes('_ID')) {
            const thumbnailUrl = `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;
            const fallbackUrl = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
            
            artworkContainer.innerHTML = `
                <img src="${thumbnailUrl}" 
                     onerror="this.src='${fallbackUrl}'" 
                     alt="${video.title}" 
                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                <div class="artwork-glow"></div>
            `;
        } else {
            // デフォルトのSVGアートワーク
            this.setDefaultArtwork(video);
        }
    }
    
    // デフォルトのアートワークを設定
    setDefaultArtwork(video) {
        const artworkContainer = document.querySelector('.track-artwork');
        if (!artworkContainer) return;
        
        const colors = this.getTrackColors(this.currentTrackIndex);
        artworkContainer.innerHTML = `
            <svg width="120" height="120" viewBox="0 0 120 120">
                <defs>
                    <linearGradient id="coverGradient${this.currentTrackIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
                        <stop offset="50%" style="stop-color:${colors[1]};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${colors[2]};stop-opacity:1" />
                    </linearGradient>
                    <radialGradient id="centerGlow${this.currentTrackIndex}">
                        <stop offset="0%" style="stop-color:#fff;stop-opacity:0.8" />
                        <stop offset="100%" style="stop-color:#fff;stop-opacity:0" />
                    </radialGradient>
                </defs>
                <rect width="120" height="120" fill="url(#coverGradient${this.currentTrackIndex})"/>
                <circle cx="60" cy="60" r="30" fill="url(#centerGlow${this.currentTrackIndex})" opacity="0.3"/>
                <text x="60" y="55" font-family="Cinzel" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">ARIA</text>
                <text x="60" y="75" font-family="Arial" font-size="8" fill="white" text-anchor="middle" opacity="0.8">${video.title || 'Loading...'}</text>
            </svg>
            <div class="artwork-glow"></div>
        `;
    }
    
    // トラックカラーを取得
    getTrackColors(index) {
        const colorSets = [
            ['#a78bfa', '#818cf8', '#c084fc'], // Purple
            ['#f472b6', '#ec4899', '#db2777'], // Pink
            ['#60a5fa', '#3b82f6', '#2563eb'], // Blue
            ['#34d399', '#10b981', '#059669'], // Green
            ['#fbbf24', '#f59e0b', '#d97706'], // Amber
            ['#f87171', '#ef4444', '#dc2626'], // Red
            ['#a78bfa', '#8b5cf6', '#7c3aed'], // Violet
        ];
        return colorSets[index % colorSets.length];
    }
    
    // YouTube リンクを更新
    updateYouTubeLink(video) {
        const youtubeLink = document.querySelector('.youtube-music-link');
        if (youtubeLink && video.videoId) {
            youtubeLink.href = `https://www.youtube.com/watch?v=${video.videoId}`;
        }
    }
    
    // トラックインジケーターを更新
    updateTrackIndicator() {
        const trackCurrent = document.querySelector('.track-current');
        const trackTotal = document.querySelector('.track-total');
        if (trackCurrent) trackCurrent.textContent = this.currentTrackIndex + 1;
        if (trackTotal) trackTotal.textContent = this.videos.length;
    }
    
    // Canvas Setup
    setupCanvas() {
        // Waveform Canvas
        this.waveformCanvas = document.getElementById('waveform');
        if (this.waveformCanvas) {
            this.waveformCtx = this.waveformCanvas.getContext('2d');
            this.waveformCanvas.width = this.waveformCanvas.offsetWidth;
            this.waveformCanvas.height = this.waveformCanvas.offsetHeight;
            this.generateWaveform();
        }
    }
    
    // Setup video items for YouTube section
    setupVideoItems() {
        const videoItems = document.querySelectorAll('.video-item');
        videoItems.forEach((item) => {
            const index = parseInt(item.dataset.index);
            item.addEventListener('click', () => {
                this.loadVideo(index);
                // スクロールしてプレーヤーを表示
                document.querySelector('.player-interface')?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            });
        });
    }
    
    // Highlight current video in the grid
    highlightCurrentVideo() {
        const videoItems = document.querySelectorAll('.video-item');
        videoItems.forEach((item, index) => {
            if (index === this.currentTrackIndex) {
                item.classList.add('playing');
            } else {
                item.classList.remove('playing');
            }
        });
    }
    
    // Generate Waveform
    generateWaveform() {
        if (!this.waveformCtx || !this.waveformCanvas) return;
        
        const width = this.waveformCanvas.width;
        const height = this.waveformCanvas.height;
        const centerY = height / 2;
        
        this.waveformCtx.clearRect(0, 0, width, height);
        this.waveformCtx.strokeStyle = 'rgba(167, 139, 250, 0.3)';
        this.waveformCtx.lineWidth = 1;
        
        this.waveformCtx.beginPath();
        for (let x = 0; x < width; x++) {
            const amplitude = Math.sin(x * 0.05) * Math.random() * (height / 4);
            const y = centerY + amplitude;
            
            if (x === 0) {
                this.waveformCtx.moveTo(x, y);
            } else {
                this.waveformCtx.lineTo(x, y);
            }
        }
        this.waveformCtx.stroke();
    }
    
    // Setup Controls
    setupControls() {
        // Play/Pause Button
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.togglePlay());
        }
        
        // Track Navigation Buttons
        const prevBtn = document.getElementById('prevTrack');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousTrack());
        }
        
        const nextBtn = document.getElementById('nextTrack');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextTrack());
        }
        
        // 音楽プラットフォームのリンクを設定
        // リンクは後でユーザーから提供される予定
        const platformLinks = document.querySelectorAll('.platform-link');
        platformLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.href === '#') {
                    e.preventDefault();
                    console.log(`Platform link clicked: ${link.dataset.platform}`);
                    // ユーザーにリンクが未設定であることを通知
                    alert('音楽プラットフォームのリンクはまもなく設定されます');
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+U は管理者用なので除外
            if (e.ctrlKey && e.shiftKey && e.key === 'U') return;
            
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'ArrowRight':
                    this.nextTrack();
                    break;
                case 'ArrowLeft':
                    this.previousTrack();
                    break;
            }
        });
    }
    
    // Setup Progress Bar
    setupProgressBar() {
        const progressBar = document.querySelector('.progress-bar');
        const progressHandle = document.getElementById('progressHandle');
        
        if (progressBar && progressHandle) {
            let isDragging = false;
            
            progressBar.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                this.seekTo(percent);
            });
            
            progressHandle.addEventListener('mousedown', () => {
                isDragging = true;
            });
            
            document.addEventListener('mousemove', (e) => {
                if (isDragging && progressBar) {
                    const rect = progressBar.getBoundingClientRect();
                    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    this.seekTo(percent);
                }
            });
            
            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
        }
    }
    
    // Progress Timer
    startProgressTimer() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(() => {
            if (this.player && this.playerReady && this.isPlaying) {
                try {
                    this.currentTime = this.player.getCurrentTime();
                    this.duration = this.player.getDuration();
                    this.updateProgressBar();
                    this.updateTimeDisplay();
                } catch (e) {
                    // プレーヤーがまだ準備できていない場合のエラーを無視
                }
            }
        }, 100);
    }
    
    // Playback Controls
    togglePlay() {
        if (!this.playerReady) return;
        
        if (this.isPlaying) {
            this.player.pauseVideo();
        } else {
            this.player.playVideo();
        }
    }
    
    nextTrack() {
        if (this.playlistId && this.player.nextVideo) {
            // プレイリストモードの場合
            this.player.nextVideo();
        } else {
            // 手動管理モードの場合
            const nextIndex = (this.currentTrackIndex + 1) % this.videos.length;
            this.loadVideo(nextIndex);
        }
    }
    
    previousTrack() {
        if (this.playlistId && this.player.previousVideo) {
            // プレイリストモードの場合
            this.player.previousVideo();
        } else {
            // 手動管理モードの場合
            const prevIndex = this.currentTrackIndex === 0 ? this.videos.length - 1 : this.currentTrackIndex - 1;
            this.loadVideo(prevIndex);
        }
    }
    
    seekTo(percent) {
        if (this.player && this.playerReady && this.duration > 0) {
            const time = percent * this.duration;
            this.player.seekTo(time, true);
        }
    }
    
    updatePlayButton() {
        const playBtn = document.getElementById('playBtn');
        if (!playBtn) return;
        
        const playIcon = playBtn.querySelector('.play-icon');
        const pauseIcon = playBtn.querySelector('.pause-icon');
        
        if (this.isPlaying) {
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';
        } else {
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
        }
    }
    
    updateProgressBar() {
        const percent = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
        
        const progressFill = document.getElementById('progressFill');
        const progressHandle = document.getElementById('progressHandle');
        
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
        
        if (progressHandle) {
            progressHandle.style.left = `${percent}%`;
        }
    }
    
    updateTimeDisplay() {
        const timeCurrent = document.getElementById('timeCurrent');
        const timeTotal = document.getElementById('timeTotal');
        
        if (timeCurrent) {
            timeCurrent.textContent = this.formatTime(this.currentTime);
        }
        
        if (timeTotal) {
            timeTotal.textContent = this.formatTime(this.duration);
        }
    }
    
    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Cleanup
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.player) {
            this.player.destroy();
        }
    }
}

// Initialize Music Player
document.addEventListener('DOMContentLoaded', () => {
    const musicPlayer = new ARIAMusicPlayer();
    
    // Make player globally accessible
    window.ariaMusicPlayer = musicPlayer;
    
    // Add dynamic CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        /* YouTube Player Container */
        #youtube-player-container {
            position: absolute;
            top: -9999px;
            left: -9999px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        }
        
        /* Playing state for video items */
        .video-item.playing {
            position: relative;
        }
        
        .video-item.playing::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, #a78bfa, #c084fc);
            border-radius: 14px;
            z-index: -1;
            animation: playingGlow 2s ease-in-out infinite;
        }
        
        @keyframes playingGlow {
            0%, 100% {
                opacity: 0.5;
            }
            50% {
                opacity: 1;
            }
        }
        
        /* Track artwork animation */
        .track-artwork img {
            border-radius: 8px;
            transition: transform 0.3s ease;
        }
        
        .track-artwork:hover img {
            transform: scale(1.05);
        }
        
        /* Wave bars animation */
        .wave-bar {
            display: inline-block;
            width: 3px;
            height: 20px;
            margin: 0 2px;
            background: linear-gradient(to top, #a78bfa, #c084fc);
            animation: wave 0.5s ease-in-out infinite;
            animation-delay: calc(var(--i) * 0.1s);
        }
        
        @keyframes wave {
            0%, 100% {
                transform: scaleY(0.5);
            }
            50% {
                transform: scaleY(1);
            }
        }
        
        /* Pause icon fix */
        .pause-icon {
            display: none;
        }
        
        /* Update Badge Styles */
        .update-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            padding: 0.3rem 0.7rem;
            background: linear-gradient(135deg, #f59e0b, #ef4444);
            border-radius: 5px;
            color: white;
            font-family: var(--font-primary);
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.03em;
        }
        
        /* Video Status Style */
        .video-status {
            font-family: var(--font-primary);
            font-size: 0.85rem;
            color: rgba(167, 139, 250, 0.8);
            margin-top: 0.3rem;
        }
        
        /* Update interface styles */
        .update-interface input {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(167, 139, 250, 0.3);
            color: white;
            border-radius: 4px;
        }
        
        .update-interface button {
            background: linear-gradient(135deg, #a78bfa, #c084fc);
            border: none;
            color: white;
            border-radius: 4px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .update-interface button:hover {
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
    
    console.log('ARIA Music Player initialized (No API Key Required!)');
    console.log('YouTube/YouTube Music integration ready');
    console.log('管理者モード: Ctrl+Shift+U で動画リスト更新画面を表示');
});
