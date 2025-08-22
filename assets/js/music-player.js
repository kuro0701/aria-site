// ARIA Music Player - 3D Spatial Audio Visualizer with Local Audio Support

class ARIAMusicPlayer {
    constructor() {
        // Player State
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.isAtmos = true;
        
        // Audio Elements
        this.audioElement = null;
        this.currentTrackIndex = 0;
        
        // Track Data - Multiple tracks with local files
        this.tracks = [
            {
                id: 1,
                title: 'Supersonic',
                artist: 'ARIA',
                album: 'Digital Dreams',
                audioFile: 'supersonic.mp3',
                audioFileAtmos: 'supersonic_atmos.mp3',
                image: 'supersonic.jpg',
                youtubeLink: 'https://www.youtube.com/watch?v=pTL_XZpYDzM'
            },
            {
                id: 2,
                title: 'Harmony Dimension',
                artist: 'ARIA',
                album: 'Spatial Voices',
                audioFile: 'harmony.mp3',
                audioFileAtmos: 'harmony_atmos.mp3',
                image: 'harmony.jpg',
                youtubeLink: 'https://www.youtube.com/watch?v=example2'
            },
            {
                id: 3,
                title: 'Thousand Voices',
                artist: 'ARIA',
                album: 'Echo Chamber',
                audioFile: 'thousand.mp3',
                audioFileAtmos: 'thousand_atmos.mp3',
                image: 'thousand.jpg',
                youtubeLink: 'https://www.youtube.com/watch?v=example3'
            }
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
        
        // Audio Context for visualization
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        
        this.init();
    }
    
    init() {
        this.setupAudio();
        this.setupCanvas();
        this.setupControls();
        this.setupProgressBar();
        this.setupTrackNavigation();
        this.createSpatialParticles();
        this.animate();
        this.loadTrack(0);
    }
    
    // Audio Setup
    setupAudio() {
        // Create audio element
        this.audioElement = new Audio();
        this.audioElement.crossOrigin = 'anonymous';
        
        // Audio event listeners
        this.audioElement.addEventListener('loadedmetadata', () => {
            this.duration = this.audioElement.duration;
            this.updateTimeDisplay();
        });
        
        this.audioElement.addEventListener('timeupdate', () => {
            this.currentTime = this.audioElement.currentTime;
            this.updateProgressBar();
            this.updateTimeDisplay();
        });
        
        this.audioElement.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayButton();
            document.querySelector('.spatial-visualizer').classList.add('playing');
        });
        
        this.audioElement.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayButton();
            document.querySelector('.spatial-visualizer').classList.remove('playing');
        });
        
        this.audioElement.addEventListener('ended', () => {
            this.nextTrack();
        });
        
        // Setup Web Audio API for visualization
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            const source = this.audioContext.createMediaElementSource(this.audioElement);
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
        } catch (e) {
            console.log('Web Audio API not supported:', e);
        }
    }
    
    // Load Track
    loadTrack(index) {
        if (index < 0 || index >= this.tracks.length) return;
        
        this.currentTrackIndex = index;
        const track = this.tracks[index];
        
        // Update audio source based on Atmos mode
        const audioFile = this.isAtmos ? track.audioFileAtmos : track.audioFile;
        const audioPath = `assets/audio/${audioFile}`;
        
        // Check if file exists, if not use placeholder
        this.audioElement.src = audioPath;
        
        // Update track info
        this.updateTrackInfo(track);
        
        // Update artwork
        this.updateArtwork(track);
        
        // Update YouTube link
        this.updateYouTubeLink(track);
        
        // Reset progress
        this.currentTime = 0;
        this.updateProgressBar();
        
        // Auto-play if was playing
        if (this.isPlaying) {
            this.audioElement.play().catch(e => {
                console.log('Auto-play prevented:', e);
            });
        }
    }
    
    // Update Track Info
    updateTrackInfo(track) {
        document.getElementById('trackTitle').textContent = track.title;
        document.getElementById('trackArtist').textContent = track.artist;
        document.getElementById('trackAlbum').textContent = track.album;
        
        // Update mini player info
        const trackNameMini = document.querySelector('.track-name-mini');
        const trackInfoMini = document.querySelector('.track-info-mini');
        if (trackNameMini) trackNameMini.textContent = track.title;
        if (trackInfoMini) trackInfoMini.textContent = `${track.artist} • ${track.album}`;
        
        // Update track indicator
        const trackCurrent = document.querySelector('.track-current');
        const trackTotal = document.querySelector('.track-total');
        if (trackCurrent) trackCurrent.textContent = this.currentTrackIndex + 1;
        if (trackTotal) trackTotal.textContent = this.tracks.length;
    }
    
    // Update Artwork
    updateArtwork(track) {
        const artworkContainer = document.querySelector('.track-artwork');
        if (!artworkContainer) return;
        
        // Check if image exists, otherwise use generated SVG
        const imagePath = `assets/images/${track.image}`;
        
        // Try to load image
        const img = new Image();
        img.onload = () => {
            // Image exists, use it
            artworkContainer.innerHTML = `
                <img src="${imagePath}" alt="${track.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                <div class="artwork-glow"></div>
            `;
        };
        img.onerror = () => {
            // Image doesn't exist, use generated artwork
            artworkContainer.innerHTML = `
                <svg width="120" height="120" viewBox="0 0 120 120">
                    <defs>
                        <linearGradient id="coverGradient${track.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:${this.getTrackColor(track.id, 0)};stop-opacity:1" />
                            <stop offset="50%" style="stop-color:${this.getTrackColor(track.id, 1)};stop-opacity:1" />
                            <stop offset="100%" style="stop-color:${this.getTrackColor(track.id, 2)};stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="centerGlow${track.id}">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.8" />
                            <stop offset="100%" style="stop-color:#fff;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <rect width="120" height="120" fill="url(#coverGradient${track.id})"/>
                    <circle cx="60" cy="60" r="30" fill="url(#centerGlow${track.id})" opacity="0.3"/>
                    <text x="60" y="55" font-family="Cinzel" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">ARIA</text>
                    <text x="60" y="75" font-family="Arial" font-size="8" fill="white" text-anchor="middle" opacity="0.8">${track.title}</text>
                </svg>
                <div class="artwork-glow"></div>
            `;
        };
        img.src = imagePath;
    }
    
    // Get track-specific colors for artwork
    getTrackColor(trackId, index) {
        const colors = [
            ['#a78bfa', '#818cf8', '#c084fc'], // Purple gradient
            ['#f472b6', '#ec4899', '#db2777'], // Pink gradient
            ['#60a5fa', '#3b82f6', '#2563eb'], // Blue gradient
        ];
        return colors[(trackId - 1) % colors.length][index];
    }
    
    // Update YouTube Link
    updateYouTubeLink(track) {
        const youtubeLink = document.querySelector('.youtube-music-link');
        if (youtubeLink) {
            youtubeLink.href = track.youtubeLink;
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
        const particleCount = this.isAtmos ? 70 : 30;
        
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
                pulsePhase: Math.random() * Math.PI * 2
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
        
        // Draw frequency visualization if playing
        if (this.isPlaying && this.analyser) {
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
            
            // Audio reactive
            if (this.isPlaying && this.dataArray) {
                const audioLevel = this.dataArray[Math.floor(Math.random() * this.dataArray.length)] / 255;
                particle.radius = (Math.sin(particle.pulsePhase) * 0.5 + 1) * 2 * (0.5 + audioLevel * 0.5);
                particle.opacity = 0.2 + audioLevel * 0.5;
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
        if (!this.analyser || !this.dataArray) return;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        const centerX = this.spatialCanvas.width / 2;
        const centerY = this.spatialCanvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 50;
        
        const bars = this.isAtmos ? 64 : 32;
        const barWidth = (Math.PI * 2) / bars;
        
        for (let i = 0; i < bars; i++) {
            const dataIndex = Math.floor(i * this.dataArray.length / bars);
            const amplitude = this.dataArray[dataIndex] / 255;
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
            this.spatialCtx.lineWidth = this.isAtmos ? 2 : 3;
            this.spatialCtx.beginPath();
            this.spatialCtx.moveTo(x1, y1);
            this.spatialCtx.lineTo(x2, y2);
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
        
        // Track Navigation Buttons
        const prevBtn = document.getElementById('prevTrack');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousTrack());
        }
        
        const nextBtn = document.getElementById('nextTrack');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextTrack());
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
    
    // Setup Track Navigation
    setupTrackNavigation() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
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
    
    // Playback Controls
    togglePlay() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        if (this.isPlaying) {
            this.audioElement.pause();
        } else {
            this.audioElement.play().catch(e => {
                console.log('Playback prevented:', e);
            });
        }
    }
    
    nextTrack() {
        const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.loadTrack(nextIndex);
    }
    
    previousTrack() {
        const prevIndex = this.currentTrackIndex === 0 ? this.tracks.length - 1 : this.currentTrackIndex - 1;
        this.loadTrack(prevIndex);
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
        
        // Reload current track with Atmos version
        this.loadTrack(this.currentTrackIndex);
        
        // Enhance spatial effect
        this.enhanceSpatialVisualization();
    }
    
    enableStereo() {
        this.isAtmos = false;
        document.getElementById('atmosBtn').classList.remove('active');
        document.getElementById('stereoBtn').classList.add('active');
        
        // Reload current track with stereo version
        this.loadTrack(this.currentTrackIndex);
        
        // Simplify to stereo visualization
        this.simplifyStereoVisualization();
    }
    
    enhanceSpatialVisualization() {
        // Add more particles for Atmos mode
        if (this.particles.length < 70) {
            for (let i = this.particles.length; i < 70; i++) {
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
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }
        }
    }
    
    simplifyStereoVisualization() {
        // Reduce particles for stereo mode
        this.particles = this.particles.slice(0, 30);
    }
    
    // Progress Bar Setup
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
                if (isDragging) {
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
        if (this.audioElement && this.duration > 0) {
            this.audioElement.currentTime = percent * this.duration;
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
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.src = '';
        }
        if (this.audioContext) {
            this.audioContext.close();
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
        
        .track-artwork img {
            animation: rotate 20s linear infinite;
        }
        
        .spatial-visualizer.playing .track-artwork img {
            animation-play-state: running;
        }
        
        .spatial-visualizer:not(.playing) .track-artwork img {
            animation-play-state: paused;
        }
        
        @keyframes rotate {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
    
    console.log('ARIA Music Player initialized with local audio support');
    console.log('Ready to play local audio files');
});
