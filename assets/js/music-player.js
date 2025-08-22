// ARIA Music Player - 3D Spatial Audio Visualizer with YouTube Integration

class ARIAMusicPlayer {
    constructor() {
        // Player State
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.isAtmos = true;
        
        // YouTube Player
        this.youtubePlayer = null;
        this.playerReady = false;
        
        // Track Data (Single track)
        this.track = {
            id: 1,
            title: 'Supersonic',
            artist: 'ARIA',
            album: 'Digital Dreams',
            youtubeId: 'pTL_XZpYDzM' // Your specified YouTube Video ID
        };
        
        // Voice Layers
        this.voiceLayers = [
            { id: 1, name: 'Main', volume: 100, x: -50, y: 0, z: 50 },
            { id: 2, name: 'Harmony', volume: 80, x: 50, y: 0, z: 50 },
            { id: 3, name: 'Upper', volume: 60, x: 0, y: 50, z: 0 },
            { id: 4, name: 'Bass', volume: 70, x: -30, y: -30, z: -50 }
        ];
        
        // Canvas Elements
        this.spatialCanvas = null;
        this.spatialCtx = null;
        this.waveformCanvas = null;
        this.waveformCtx = null;
        
        // Animation
        this.animationId = null;
        this.particles = [];
        this.updateInterval = null;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupYouTubePlayer();
        this.setupControls();
        this.setupVoiceLayers();
        this.setupProgressBar();
        this.createSpatialParticles();
        this.animate();
        this.updateTrackInfo();
    }
    
    // YouTube Player Setup
    setupYouTubePlayer() {
        // Ensure the container exists
        if (!document.getElementById('youtube-player-container')) {
            const container = document.createElement('div');
            container.id = 'youtube-player-container';
            // ★変更点：画面外に隠すスタイルを削除
            document.body.appendChild(container);
        }

        // Load YouTube IFrame API if not already loaded
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
            window.onYouTubeIframeAPIReady = () => {
                this.createYouTubePlayer();
            };
        } else if (this.youtubePlayer) {
             this.youtubePlayer.destroy();
             this.createYouTubePlayer();
        }
        else {
            this.createYouTubePlayer();
        }
    }
    
    createYouTubePlayer() {
        this.youtubePlayer = new YT.Player('youtube-player-container', {
            height: '100%',
            width: '100%',
            videoId: this.track.youtubeId,
            playerVars: {
                'autoplay': 0,
                'controls': 0,
                'showinfo': 0,
                'modestbranding': 1,
                'loop': 1, // Loop the single video
                'playlist': this.track.youtubeId, // Required for looping a single video
                'fs': 0,
                'cc_load_policy': 0,
                'iv_load_policy': 3,
                'autohide': 1,
                'playsinline': 1 // Important for mobile browsers
            },
            events: {
                'onReady': (event) => this.onPlayerReady(event),
                'onStateChange': (event) => this.onPlayerStateChange(event)
            }
        });
    }
    
    onPlayerReady(event) {
        console.log('YouTube Player ready');
        this.playerReady = true;
        this.duration = this.youtubePlayer.getDuration() || 0;
        this.updateTimeDisplay();
        // Mute the video to allow potential autoplay, and control volume via another interface if needed
        event.target.mute();
    }
    
    onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
            this.isPlaying = true;
            this.duration = this.youtubePlayer.getDuration() || 0; // Update duration on play
            this.startProgressUpdate();
            this.updatePlayButton();
            document.querySelector('.spatial-visualizer').classList.add('playing');
        } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
            this.isPlaying = false;
            this.stopProgressUpdate();
            this.updatePlayButton();
            document.querySelector('.spatial-visualizer').classList.remove('playing');
            if (event.data === YT.PlayerState.ENDED) {
                // The video will loop automatically due to playerVars, but we can reset the UI state here
                this.currentTime = 0;
                this.updateProgressBar();
            }
        }
    }
    
    // Update Track Info
    updateTrackInfo() {
        document.getElementById('trackTitle').textContent = this.track.title;
        document.getElementById('trackArtist').textContent = this.track.artist;
        document.getElementById('trackAlbum').textContent = this.track.album;
        // Also update album art if you have it
        const artImg = document.getElementById('trackArtworkImg');
        if (artImg) {
            artImg.src = 'assets/images/aria-cover.jpg'; // Assuming this is the correct path
            artImg.alt = `${this.track.album} - ${this.track.title}`;
        }
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
        this.particles = [];
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * (this.spatialCanvas?.width || 0),
                y: Math.random() * (this.spatialCanvas?.height || 0),
                z: Math.random() * 100 - 50,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                vz: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: this.getRandomColor(),
                pulsePhase: Math.random() * Math.PI * 2,
                layerId: Math.floor(Math.random() * 4) + 1
            });
        }
    }
    
    getRandomColor() {
        const colors = [
            'rgba(167, 139, 250,',
            'rgba(129, 140, 248,',
            'rgba(192, 132, 252,',
            'rgba(232, 121, 249,'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Animation Loop
    animate() {
        if (this.spatialCtx) {
            this.spatialCtx.clearRect(0, 0, this.spatialCanvas.width, this.spatialCanvas.height);
            this.drawCenterPoint();
            this.updateParticles();
            this.drawParticles();
            this.drawVoiceConnections();
            if (this.isPlaying) {
                this.drawFrequencyVisualization();
            }
        }
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    drawCenterPoint() {
        const centerX = this.spatialCanvas.width / 2;
        const centerY = this.spatialCanvas.height / 2;
        const gradient = this.spatialCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
        gradient.addColorStop(0, 'rgba(167, 139, 250, 0.3)');
        gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');
        this.spatialCtx.fillStyle = gradient;
        this.spatialCtx.beginPath();
        this.spatialCtx.arc(centerX, centerY, 50, 0, Math.PI * 2);
        this.spatialCtx.fill();
        this.spatialCtx.fillStyle = 'rgba(167, 139, 250, 0.8)';
        this.spatialCtx.beginPath();
        this.spatialCtx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        this.spatialCtx.fill();
    }
    
    updateParticles() {
        const centerX = this.spatialCanvas.width / 2;
        const centerY = this.spatialCanvas.height / 2;
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.z += particle.vz;
            const scale = 1 + particle.z / 100;
            particle.projectedX = centerX + (particle.x - centerX) * scale;
            particle.projectedY = centerY + (particle.y - centerY) * scale;
            particle.projectedScale = scale;
            if (particle.x < 0 || particle.x > this.spatialCanvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.spatialCanvas.height) particle.vy *= -1;
            if (particle.z < -50 || particle.z > 50) particle.vz *= -1;
            particle.pulsePhase += 0.05;
            const layer = this.voiceLayers.find(l => l.id === particle.layerId);
            if (layer && this.isPlaying) {
                particle.radius = (Math.sin(particle.pulsePhase) * 0.5 + 1) * 2 * (layer.volume / 100);
                particle.opacity = 0.2 + (layer.volume / 100) * 0.5;
            }
        });
    }
    
    drawParticles() {
        const sortedParticles = [...this.particles].sort((a, b) => a.z - b.z);
        sortedParticles.forEach(particle => {
            const size = particle.radius * particle.projectedScale;
            const gradient = this.spatialCtx.createRadialGradient(particle.projectedX, particle.projectedY, 0, particle.projectedX, particle.projectedY, size * 3);
            gradient.addColorStop(0, particle.color + particle.opacity + ')');
            gradient.addColorStop(1, particle.color + '0)');
            this.spatialCtx.fillStyle = gradient;
            this.spatialCtx.beginPath();
            this.spatialCtx.arc(particle.projectedX, particle.projectedY, size * 3, 0, Math.PI * 2);
            this.spatialCtx.fill();
            this.spatialCtx.fillStyle = particle.color + (particle.opacity * 1.5) + ')';
            this.spatialCtx.beginPath();
            this.spatialCtx.arc(particle.projectedX, particle.projectedY, size, 0, Math.PI * 2);
            this.spatialCtx.fill();
        });
    }
    
    drawVoiceConnections() {
        const centerX = this.spatialCanvas.width / 2;
        const centerY = this.spatialCanvas.height / 2;
        
        this.voiceLayers.forEach((layer, index) => {
            const angle = (index / this.voiceLayers.length) * Math.PI * 2 + Date.now() * 0.0001;
            const distance = 100 + Math.sin(Date.now() * 0.001 + index) * 20;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            this.spatialCtx.strokeStyle = `rgba(167, 139, 250, ${layer.volume / 100 * 0.3})`;
            this.spatialCtx.lineWidth = layer.volume / 100 * 2;
            this.spatialCtx.beginPath();
            this.spatialCtx.moveTo(centerX, centerY);
            this.spatialCtx.lineTo(x, y);
            this.spatialCtx.stroke();
            
            const pointSize = 5 + (layer.volume / 100) * 5;
            this.spatialCtx.fillStyle = `rgba(167, 139, 250, ${layer.volume / 100})`;
            this.spatialCtx.beginPath();
            this.spatialCtx.arc(x, y, pointSize, 0, Math.PI * 2);
            this.spatialCtx.fill();
        });
    }
    
    drawFrequencyVisualization() {
        const centerX = this.spatialCanvas.width / 2;
        const centerY = this.spatialCanvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 50;
        const frequencies = 32;
        for (let i = 0; i < frequencies; i++) {
            const angle = (i / frequencies) * Math.PI * 2;
            const frequency = Math.random() * 0.5 + 0.5;
            const radius = maxRadius * frequency;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            this.spatialCtx.strokeStyle = `rgba(167, 139, 250, ${frequency * 0.5})`;
            this.spatialCtx.lineWidth = 1;
            this.spatialCtx.beginPath();
            this.spatialCtx.moveTo(centerX, centerY);
            this.spatialCtx.lineTo(x, y);
            this.spatialCtx.stroke();
        }
    }
    
    // Generate Waveform
    generateWaveform() {
        if (!this.waveformCtx) return;
        const width = this.waveformCanvas.width;
        const height = this.waveformCanvas.height;
        const centerY = height / 2;
        this.waveformCtx.clearRect(0, 0, width, height);
        this.waveformCtx.strokeStyle = 'rgba(167, 139, 250, 0.3)';
        this.waveformCtx.lineWidth = 1;
        this.waveformCtx.beginPath();
        for (let x = 0; x < width; x++) {
            const amplitude = Math.sin(x * 0.05 + Math.random()) * Math.random() * (height / 3);
            this.waveformCtx.lineTo(x, centerY + amplitude);
        }
        this.waveformCtx.stroke();
    }
    
    // Setup Controls
    setupControls() {
        document.getElementById('playBtn')?.addEventListener('click', () => this.togglePlay());
        document.getElementById('atmosBtn')?.addEventListener('click', () => this.enableAtmos());
        document.getElementById('stereoBtn')?.addEventListener('click', () => this.enableStereo());
        // Disable prev/next buttons for single track
        document.getElementById('prevBtn')?.setAttribute('disabled', 'true');
        document.getElementById('nextBtn')?.setAttribute('disabled', 'true');
    }
    
    // Playback Controls
    togglePlay() {
        if (!this.playerReady) {
            console.warn('Player not ready yet.');
            return;
        }
        if (this.isPlaying) {
            this.youtubePlayer.pauseVideo();
        } else {
            // Unmute on first play interaction
            if (this.youtubePlayer.isMuted()) {
                this.youtubePlayer.unMute();
            }
            this.youtubePlayer.playVideo();
        }
    }
    
    updatePlayButton() {
        const playBtn = document.getElementById('playBtn');
        if (!playBtn) return;
        const playIcon = playBtn.querySelector('.play-icon');
        const pauseIcon = playBtn.querySelector('.pause-icon');
        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }
    
    enableAtmos() {
        this.isAtmos = true;
        document.getElementById('atmosBtn')?.classList.add('active');
        document.getElementById('stereoBtn')?.classList.remove('active');
    }
    
    enableStereo() {
        this.isAtmos = false;
        document.getElementById('atmosBtn')?.classList.remove('active');
        document.getElementById('stereoBtn')?.classList.add('active');
    }
    
    // Voice Layers Setup
    setupVoiceLayers() {
        document.querySelectorAll('.layer-control').forEach(control => {
            const slider = control.querySelector('.layer-volume');
            const fill = control.querySelector('.layer-fill');
            const value = control.querySelector('.layer-value');
            slider?.addEventListener('input', (e) => {
                const layerId = parseInt(control.dataset.layer);
                const volume = parseInt(e.target.value);
                const layer = this.voiceLayers.find(l => l.id === layerId);
                if (layer) layer.volume = volume;
                fill.style.width = `${volume}%`;
                value.textContent = `${volume}%`;
            });
        });
    }
    
    // Progress Bar Setup
    setupProgressBar() {
        const progressBar = document.querySelector('.progress-bar');
        const progressHandle = document.getElementById('progressHandle');
        let isDragging = false;

        const seek = (e) => {
            if (!this.playerReady || this.duration <= 0) return;
            const rect = progressBar.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            this.seekTo(percent);
        };
        
        progressBar?.addEventListener('click', seek);
        progressHandle?.addEventListener('mousedown', () => { isDragging = true; });
        document.addEventListener('mousemove', (e) => { if (isDragging) seek(e); });
        document.addEventListener('mouseup', () => { isDragging = false; });
    }
    
    seekTo(percent) {
        if (this.playerReady && this.duration > 0) {
            const time = percent * this.duration;
            this.youtubePlayer.seekTo(time, true);
            this.currentTime = time;
            this.updateProgressBar();
        }
    }
    
    startProgressUpdate() {
        this.stopProgressUpdate();
        this.updateInterval = setInterval(() => {
            if (this.playerReady && this.isPlaying) {
                this.currentTime = this.youtubePlayer.getCurrentTime() || 0;
                this.updateProgressBar();
                this.updateTimeDisplay();
            }
        }, 250);
    }
    
    stopProgressUpdate() {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
    }
    
    updateProgressBar() {
        const percent = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
        document.getElementById('progressFill').style.width = `${percent}%`;
        document.getElementById('progressHandle').style.left = `${percent}%`;
    }
    
    updateTimeDisplay() {
        document.getElementById('timeCurrent').textContent = this.formatTime(this.currentTime);
        document.getElementById('timeTotal').textContent = this.formatTime(this.duration);
    }
    
    formatTime(seconds) {
        seconds = Math.round(seconds) || 0;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Cleanup
    destroy() {
        cancelAnimationFrame(this.animationId);
        this.stopProgressUpdate();
        this.youtubePlayer?.destroy();
    }
}

// Initialize Music Player
document.addEventListener('DOMContentLoaded', () => {
    // Ensure only one player instance exists
    if (!window.ariaMusicPlayer) {
        window.ariaMusicPlayer = new ARIAMusicPlayer();
        console.log('ARIA Music Player initialized with YouTube');
        console.log('Loading Supersonic...');
    }
});