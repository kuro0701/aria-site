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
        
        // 手動で管理する動画リスト
        // @NexusAria チャンネルの楽曲
        // 新しい曲を追加する場合: YouTube URLから watch?v=XXXXX のXXXXX部分をコピー
        this.videos = [
            {
                videoId: '7hXsZkmDaic',
                title: 'DIGITAL ANGEL',
                artist: 'ARIA',
                album: '@NexusAria',
                publishedAt: '2024-12-10'
            },
            {
                videoId: '4-oAxJiFDmo',
                title: 'Digital Harmony',
                artist: 'ARIA',
                album: '@NexusAria',
                publishedAt: '2024-12-10'
            },
            {
                videoId: 'fl09mV_RFjk',
                title: 'Neon Dreams',
                artist: 'ARIA',
                album: '@NexusAria',
                publishedAt: '2024-12-10'
            }
        ];
        
        // YouTubeプレイリストを使用する場合（オプション）
        this.playlistId = null; // 'YOUR_PLAYLIST_ID' を設定可能
        
        // Canvas Elements
        this.spatialCanvas = null;
        this.spatialCtx = null;
        this.waveformCanvas = null;
        this.waveformCtx = null;
        
        // Animation
        this.animationId = null;
        this.particles = [];
        this.updateInterval = null;
        
        // Visualization data
        this.visualizationIntensity = 0;
        this.targetIntensity = 0;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupControls();
        this.setupProgressBar();
        this.createSpatialParticles();
        this.animate();
        this.sortVideosByDate();
        
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
    }
    
    // 動画を日付順にソート
    sortVideosByDate() {
        this.videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
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
        this.displayVideoList();
        
        // 入力フィールドをクリア
        document.getElementById('newVideoId').value = '';
        document.getElementById('newVideoTitle').value = '';
        
        console.log('新しい動画を追加:', newVideo);
        console.log('現在のリスト:', this.videos);
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
        const playerOptions = {
            height: '0',
            width: '0',
            videoId: this.videos[0]?.videoId || '',
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
                document.querySelector('.spatial-visualizer')?.classList.add('playing');
                this.targetIntensity = 1;
                
                // 現在の動画情報を取得して表示
                if (this.playlistId && this.player.getVideoData) {
                    const videoData = this.player.getVideoData();
                    this.updateTrackInfoFromVideoData(videoData);
                }
                break;
            case YT.PlayerState.PAUSED:
                this.isPlaying = false;
                this.updatePlayButton();
                document.querySelector('.spatial-visualizer')?.classList.remove('playing');
                this.targetIntensity = 0;
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
        if (video.videoId) {
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
        // Spatial Canvas
        this.spatialCanvas = document.getElementById('spatialCanvas');
        if (this.spatialCanvas) {
            this.spatialCtx = this.spatialCanvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }
        
        // Waveform Canvas
        this.waveformCanvas = document.getElementById('waveform');
        if (this.waveformCanvas) {
            this.waveformCtx = this.waveformCanvas.getContext('2d');
            this.waveformCanvas.width = this.waveformCanvas.offsetWidth;
            this.waveformCanvas.height = this.waveformCanvas.offsetHeight;
            this.generateWaveform();
        }
    }
    
    resizeCanvas() {
        if (this.spatialCanvas) {
            this.spatialCanvas.width = this.spatialCanvas.offsetWidth;
            this.spatialCanvas.height = this.spatialCanvas.offsetHeight;
        }
    }
    
    // Create Spatial Particles
    createSpatialParticles() {
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * (this.spatialCanvas?.width || 400),
                y: Math.random() * (this.spatialCanvas?.height || 400),
                z: Math.random() * 100 - 50,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                vz: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: this.getRandomColor(),
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    getRandomColor() {
        const colors = [
            'rgba(167, 139, 250,',
            'rgba(129, 140, 248,',
            'rgba(192, 132, 252,',
            'rgba(232, 121, 249,',
            'rgba(244, 114, 182,',
            'rgba(96, 165, 250,'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Animation Loop
    animate() {
        // Canvasが存在しない場合は再試行
        if (!this.spatialCtx || !this.spatialCanvas) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }
        
        // Clear canvas with very transparent background for smoother trail effect
        this.spatialCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.spatialCtx.fillRect(0, 0, this.spatialCanvas.width, this.spatialCanvas.height);
        
        // Smooth intensity transition
        this.visualizationIntensity += (this.targetIntensity - this.visualizationIntensity) * 0.1;
        
        // Draw center point
        this.drawCenterPoint();
        
        // Update and draw particles
        this.updateParticles();
        this.drawParticles();
        
        // Draw frequency visualization if playing
        if (this.isPlaying) {
            this.drawFrequencyVisualization();
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    drawCenterPoint() {
        if (!this.spatialCanvas) return;
        
        const centerX = this.spatialCanvas.width / 2;
        const centerY = this.spatialCanvas.height / 2;
        
        // Center glow with pulsing effect
        const pulseSize = 50 + (Math.sin(Date.now() * 0.002) * 10 * this.visualizationIntensity);
        const gradient = this.spatialCtx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, pulseSize
        );
        gradient.addColorStop(0, `rgba(167, 139, 250, ${0.3 + this.visualizationIntensity * 0.3})`);
        gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');
        
        this.spatialCtx.fillStyle = gradient;
        this.spatialCtx.beginPath();
        this.spatialCtx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        this.spatialCtx.fill();
        
        // Center point
        this.spatialCtx.fillStyle = `rgba(167, 139, 250, ${0.8 + this.visualizationIntensity * 0.2})`;
        this.spatialCtx.beginPath();
        this.spatialCtx.arc(centerX, centerY, 3 + this.visualizationIntensity * 2, 0, Math.PI * 2);
        this.spatialCtx.fill();
    }
    
    updateParticles() {
        if (!this.spatialCanvas) return;
        
        const centerX = this.spatialCanvas.width / 2;
        const centerY = this.spatialCanvas.height / 2;
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx * (1 + this.visualizationIntensity * 0.5);
            particle.y += particle.vy * (1 + this.visualizationIntensity * 0.5);
            particle.z += particle.vz * (1 + this.visualizationIntensity * 0.5);
            
            // 3D to 2D projection
            const scale = 1 + particle.z / 100;
            const projectedX = centerX + (particle.x - centerX) * scale;
            const projectedY = centerY + (particle.y - centerY) * scale;
            
            particle.projectedX = projectedX;
            particle.projectedY = projectedY;
            particle.projectedScale = scale;
            
            // Wrap around
            if (particle.x < 0) particle.x = this.spatialCanvas.width;
            if (particle.x > this.spatialCanvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.spatialCanvas.height;
            if (particle.y > this.spatialCanvas.height) particle.y = 0;
            if (particle.z < -50) particle.z = 50;
            if (particle.z > 50) particle.z = -50;
            
            // Pulse effect
            particle.pulsePhase += 0.05;
            
            // Music reactive
            if (this.isPlaying) {
                const audioLevel = Math.sin(Date.now() * 0.001 + particle.pulsePhase) * 0.5 + 0.5;
                particle.radius = (Math.sin(particle.pulsePhase) * 0.5 + 1) * 2 * (0.5 + audioLevel * 0.5 * this.visualizationIntensity);
                particle.opacity = 0.2 + audioLevel * 0.5 * this.visualizationIntensity;
            }
        });
    }
    
    drawParticles() {
        // Sort by z-index (far to near)
        const sortedParticles = [...this.particles].sort((a, b) => a.z - b.z);
        
        sortedParticles.forEach(particle => {
            const size = particle.radius * particle.projectedScale;
            
            // Draw glow
            const gradient = this.spatialCtx.createRadialGradient(
                particle.projectedX, particle.projectedY, 0,
                particle.projectedX, particle.projectedY, size * 3
            );
            gradient.addColorStop(0, particle.color + particle.opacity + ')');
            gradient.addColorStop(1, particle.color + '0)');
            
            this.spatialCtx.fillStyle = gradient;
            this.spatialCtx.beginPath();
            this.spatialCtx.arc(particle.projectedX, particle.projectedY, size * 3, 0, Math.PI * 2);
            this.spatialCtx.fill();
            
            // Draw core
            this.spatialCtx.fillStyle = particle.color + (particle.opacity * 1.5) + ')';
            this.spatialCtx.beginPath();
            this.spatialCtx.arc(particle.projectedX, particle.projectedY, size, 0, Math.PI * 2);
            this.spatialCtx.fill();
        });
    }
    
    drawFrequencyVisualization() {
        if (!this.spatialCanvas) return;
        
        const centerX = this.spatialCanvas.width / 2;
        const centerY = this.spatialCanvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 50;
        
        const bars = 48;
        const barWidth = (Math.PI * 2) / bars;
        
        for (let i = 0; i < bars; i++) {
            // シミュレートされた周波数データ
            const time = Date.now() * 0.001;
            const amplitude = (Math.sin(time * 2 + i * 0.5) * 0.3 + 
                             Math.sin(time * 3 + i * 0.3) * 0.2 + 
                             Math.sin(time * 5 + i * 0.1) * 0.1 + 0.4) * this.visualizationIntensity;
            
            const barHeight = amplitude * maxRadius;
            
            const angle = i * barWidth;
            const x1 = centerX + Math.cos(angle) * 50;
            const y1 = centerY + Math.sin(angle) * 50;
            const x2 = centerX + Math.cos(angle) * (50 + barHeight);
            const y2 = centerY + Math.sin(angle) * (50 + barHeight);
            
            const gradient = this.spatialCtx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, `rgba(167, 139, 250, ${amplitude})`);
            gradient.addColorStop(1, `rgba(192, 132, 252, ${amplitude * 0.5})`);
            
            this.spatialCtx.strokeStyle = gradient;
            this.spatialCtx.lineWidth = 2;
            this.spatialCtx.beginPath();
            this.spatialCtx.moveTo(x1, y1);
            this.spatialCtx.lineTo(x2, y2);
            this.spatialCtx.stroke();
        }
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
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
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
        
        /* Playing state animations */
        .spatial-visualizer.playing {
            animation: visualizerGlow 2s ease-in-out infinite;
        }
        
        @keyframes visualizerGlow {
            0%, 100% {
                box-shadow: 0 0 20px rgba(167, 139, 250, 0.3);
            }
            50% {
                box-shadow: 0 0 40px rgba(167, 139, 250, 0.6);
            }
        }
        
        /* Track artwork rotation */
        .track-artwork img {
            animation: rotate 20s linear infinite paused;
            border-radius: 8px;
        }
        
        .spatial-visualizer.playing .track-artwork img {
            animation-play-state: running;
        }
        
        @keyframes rotate {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
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
