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
            youtubeId: 'pTL_XZpYDzM'
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
        // Create YouTube iframe container
        const playerContainer = document.getElementById('youtube-player-container');
        if (!playerContainer) {
            const container = document.createElement('div');
            container.id = 'youtube-player-container';
            container.style.cssText = `
                position: absolute;
                top: -1000px;
                left: -1000px;
                width: 1px;
                height: 1px;
                opacity: 0;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        
        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
            // Wait for API to load
            window.onYouTubeIframeAPIReady = () => {
                this.createYouTubePlayer();
            };
        } else {
            this.createYouTubePlayer();
        }
    }
    
    createYouTubePlayer() {
        this.youtubePlayer = new YT.Player('youtube-player-container', {
            height: '1',
            width: '1',
            videoId: this.track.youtubeId,
            playerVars: {
                'autoplay': 0,
                'controls': 0,
                'showinfo': 0,
                'modestbranding': 1,
                'loop': 1,
                'playlist': this.track.youtubeId,
                'fs': 0,
                'cc_load_policy': 0,
                'iv_load_policy': 3,
                'autohide': 1
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
        this.duration = this.youtubePlayer.getDuration();
        this.updateTimeDisplay();
    }
    
    onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
            this.isPlaying = true;
            this.startProgressUpdate();
            this.updatePlayButton();
            document.querySelector('.spatial-visualizer').classList.add('playing');
        } else if (event.data === YT.PlayerState.PAUSED) {
            this.isPlaying = false;
            this.stopProgressUpdate();
            this.updatePlayButton();
            document.querySelector('.spatial-visualizer').classList.remove('playing');
        } else if (event.data === YT.PlayerState.ENDED) {
            this.isPlaying = false;
            this.currentTime = 0;
            this.updateProgressBar();
            this.updatePlayButton();
        }
    }
    
    // Update Track Info
    updateTrackInfo() {
        document.getElementById('trackTitle').textContent = this.track.title;
        document.getElementById('trackArtist').textContent = this.track.artist;
        document.getElementById('trackAlbum').textContent = this.track.album;
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
                x: Math.random() * this.spatialCanvas.width,
                y: Math.random() * this.spatialCanvas.height,
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
        if (!this.spatialCtx) return;
        
        // Clear canvas
        this.spatialCtx.clearRect(0, 0, this.spatialCanvas.width, this.spatialCanvas.height);
        
        // Draw center point
        this.drawCenterPoint();
        
        // Update and draw particles
        this.updateParticles();
        this.drawParticles();
        
        // Draw voice connections
        this.drawVoiceConnections();
        
        // Draw frequency visualization if playing
        if (this.isPlaying) {
            this.drawFrequencyVisualization();
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    drawCenterPoint() {
        const centerX = this.spatialCanvas.width / 2;
        const centerY = this.spatialCanvas.height / 2;
        
        // Center glow
        const gradient = this.spatialCtx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 50
        );
        gradient.addColorStop(0, 'rgba(167, 139, 250, 0.3)');
        gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');
        
        this.spatialCtx.fillStyle = gradient;
        this.spatialCtx.beginPath();
        this.spatialCtx.arc(centerX, centerY, 50, 0, Math.PI * 2);
        this.spatialCtx.fill();
        
        // Center point
        this.spatialCtx.fillStyle = 'rgba(167, 139, 250, 0.8)';
        this.spatialCtx.beginPath();
        this.spatialCtx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        this.spatialCtx.fill();
    }
    
    updateParticles() {
        const centerX = this.spatialCanvas.width / 2;
        const centerY = this.spatialCanvas.height / 2;
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.z += particle.vz;
            
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
            
            // Voice layer influence
            if (this.isPlaying) {
                const layer = this.voiceLayers.find(l => l.id === particle.layerId);
                if (layer) {
                    particle.radius = (Math.sin(particle.pulsePhase) * 0.5 + 1) * 2 * (layer.volume / 100);
                    particle.opacity = 0.2 + (layer.volume / 100) * 0.5;
                }
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
    
    drawVoiceConnections() {
        const centerX = this.spatialCanvas.width / 2;
        const centerY = this.spatialCanvas.height / 2;
        
        this.voiceLayers.forEach((layer, index) => {
            const angle = (index / this.voiceLayers.length) * Math.PI * 2;
            const distance = 100 + Math.sin(Date.now() * 0.001 + index) * 20;
            
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            // Draw connection line
            this.spatialCtx.strokeStyle = `rgba(167, 139, 250, ${layer.volume / 100 * 0.3})`;
            this.spatialCtx.lineWidth = layer.volume / 100 * 2;
            this.spatialCtx.beginPath();
            this.spatialCtx.moveTo(centerX, centerY);
            this.spatialCtx.lineTo(x, y);
            this.spatialCtx.stroke();
            
            // Draw voice point
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
        
        // Simulate frequency data
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
        
        // Spatial Audio Buttons
        const atmosBtn = document.getElementById('atmosBtn');
        if (atmosBtn) {
            atmosBtn.addEventListener('click', () => this.enableAtmos());
        }
        
        const stereoBtn = document.getElementById('stereoBtn');
        if (stereoBtn) {
            stereoBtn.addEventListener('click', () => this.enableStereo());
        }
    }
    
    // Playback Controls
    togglePlay() {
        if (!this.playerReady) {
            console.log('Player not ready yet');
            return;
        }
        
        if (this.isPlaying) {
            this.youtubePlayer.pauseVideo();
        } else {
            this.youtubePlayer.playVideo();
        }
    }
    
    updatePlayButton() {
        const playBtn = document.getElementById('playBtn');
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
        document.getElementById('atmosBtn').classList.add('active');
        document.getElementById('stereoBtn').classList.remove('active');
        
        // Enhance spatial effect
        this.enhanceSpatialVisualization();
    }
    
    enableStereo() {
        this.isAtmos = false;
        document.getElementById('atmosBtn').classList.remove('active');
        document.getElementById('stereoBtn').classList.add('active');
        
        // Simplify to stereo visualization
        this.simplifyStereoVisualization();
    }
    
    enhanceSpatialVisualization() {
        // Add more particles for Atmos mode
        if (this.particles.length < 70) {
            for (let i = 0; i < 20; i++) {
                this.particles.push({
                    x: Math.random() * this.spatialCanvas.width,
                    y: Math.random() * this.spatialCanvas.height,
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
    }
    
    simplifyStereoVisualization() {
        // Reduce particles for stereo mode
        this.particles = this.particles.slice(0, 30);
    }
    
    // Voice Layers Setup
    setupVoiceLayers() {
        const layerControls = document.querySelectorAll('.layer-control');
        
        layerControls.forEach(control => {
            const slider = control.querySelector('.layer-volume');
            const fill = control.querySelector('.layer-fill');
            const value = control.querySelector('.layer-value');
            
            if (slider) {
                slider.addEventListener('input', (e) => {
                    const layerId = parseInt(control.dataset.layer);
                    const volume = parseInt(e.target.value);
                    
                    // Update layer volume
                    const layer = this.voiceLayers.find(l => l.id === layerId);
                    if (layer) {
                        layer.volume = volume;
                    }
                    
                    // Update UI
                    fill.style.width = `${volume}%`;
                    value.textContent = `${volume}%`;
                    
                    // Update 3D visualization
                    this.updateVoiceLayerPosition(layerId, volume);
                });
            }
        });
    }
    
    updateVoiceLayerPosition(layerId, volume) {
        const layerElement = document.querySelector(`.voice-layer[data-layer="${layerId}"]`);
        if (layerElement) {
            const scale = 0.5 + (volume / 100) * 0.5;
            layerElement.style.transform = `scale(${scale})`;
            layerElement.style.opacity = 0.3 + (volume / 100) * 0.7;
        }
    }
    
    // Progress Bar Setup
    setupProgressBar() {
        const progressBar = document.querySelector('.progress-bar');
        const progressHandle = document.getElementById('progressHandle');
        
        if (progressBar && progressHandle) {
            let isDragging = false;
            
            progressBar.addEventListener('click', (e) => {
                if (!this.playerReady) return;
                const rect = progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                this.seekTo(percent);
            });
            
            progressHandle.addEventListener('mousedown', () => {
                isDragging = true;
            });
            
            document.addEventListener('mousemove', (e) => {
                if (isDragging && this.playerReady) {
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
    
    seekTo(percent) {
        if (this.youtubePlayer && this.playerReady) {
            const time = percent * this.duration;
            this.youtubePlayer.seekTo(time, true);
        }
    }
    
    startProgressUpdate() {
        this.stopProgressUpdate();
        
        this.updateInterval = setInterval(() => {
            if (this.youtubePlayer && this.playerReady) {
                this.currentTime = this.youtubePlayer.getCurrentTime();
                this.duration = this.youtubePlayer.getDuration();
                this.updateProgressBar();
                this.updateTimeDisplay();
            }
        }, 100);
    }
    
    stopProgressUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
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
        this.stopProgressUpdate();
        if (this.youtubePlayer) {
            this.youtubePlayer.destroy();
        }
    }
}

// Initialize Music Player
document.addEventListener('DOMContentLoaded', () => {
    const musicPlayer = new ARIAMusicPlayer();
    
    // Make player globally accessible
    window.ariaMusicPlayer = musicPlayer;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes voiceLayerFloat {
            0%, 100% {
                transform: translateY(0) scale(1);
            }
            50% {
                transform: translateY(-10px) scale(1.1);
            }
        }
        
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
    `;
    document.head.appendChild(style);
    
    console.log('ARIA Music Player initialized with YouTube');
    console.log('Loading Supersonic...');
});
