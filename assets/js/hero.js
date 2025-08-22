// ARIA Hero Section Interactive Features

class ARIAHero {
    constructor() {
        this.voiceField = null;
        this.ctx = null;
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.centralOrb = null;
        this.audioContext = null;
        this.analyser = null;
        this.isPlaying = false;
        
        this.init();
    }
    
    init() {
        this.setupVoiceField();
        this.setupInteractions();
        this.setupScrollEffects();
        this.setupAudioVisualizer();
        this.animate();
    }
    
    // Voice Field Canvas Setup
    setupVoiceField() {
        this.voiceField = document.getElementById('voiceField');
        if (!this.voiceField) return;
        
        this.ctx = this.voiceField.getContext('2d');
        this.resizeCanvas();
        
        // Create voice particles
        this.createVoiceParticles();
        
        // Handle resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Track mouse movement
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }
    
    resizeCanvas() {
        if (!this.voiceField) return;
        this.voiceField.width = window.innerWidth;
        this.voiceField.height = window.innerHeight;
    }
    
    createVoiceParticles() {
        const particleCount = 100;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                baseX: Math.random() * window.innerWidth,
                baseY: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                radius: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.01,
                color: this.getRandomVoiceColor(),
                language: this.getRandomLanguage(),
                connectionRadius: 150
            });
        }
    }
    
    getRandomVoiceColor() {
        const colors = [
            'rgba(167, 139, 250,', // Primary purple
            'rgba(129, 140, 248,', // Secondary blue
            'rgba(192, 132, 252,', // Accent purple
            'rgba(232, 121, 249,'  // Pink
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    getRandomLanguage() {
        const languages = ['JP', 'KO', 'EN', 'ZH'];
        return languages[Math.floor(Math.random() * languages.length)];
    }
    
    // Animation Loop
    animate() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.voiceField.width, this.voiceField.height);
        
        // Update and draw particles
        this.updateParticles();
        this.drawConnections();
        this.drawParticles();
        
        requestAnimationFrame(() => this.animate());
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Mouse interaction
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) {
                const force = (200 - distance) / 200;
                particle.x -= (dx * force) * 0.02;
                particle.y -= (dy * force) * 0.02;
            } else {
                // Return to base position
                particle.x += (particle.baseX - particle.x) * 0.02;
                particle.y += (particle.baseY - particle.y) * 0.02;
            }
            
            // Add floating movement
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Pulse effect
            particle.pulsePhase += particle.pulseSpeed;
            particle.radius = (Math.sin(particle.pulsePhase) * 0.5 + 1) * 1.5;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
            if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;
        });
    }
    
    drawConnections() {
        this.particles.forEach((particle, i) => {
            this.particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < particle.connectionRadius) {
                    const opacity = (1 - distance / particle.connectionRadius) * 0.2;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.strokeStyle = particle.color + opacity + ')';
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            });
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            // Draw glow
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.radius * 4
            );
            gradient.addColorStop(0, particle.color + '0.8)');
            gradient.addColorStop(1, particle.color + '0)');
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // Draw core
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + particle.opacity + ')';
            this.ctx.fill();
        });
    }
    
    // Interactive Elements
    setupInteractions() {
        // Central Orb Interaction
        this.centralOrb = document.getElementById('centralOrb');
        if (this.centralOrb) {
            this.centralOrb.addEventListener('click', () => {
                this.pulseVoices();
                this.playVoiceDemo();
            });
            
            this.centralOrb.addEventListener('mouseenter', () => {
                this.startOrbAnimation();
            });
            
            this.centralOrb.addEventListener('mouseleave', () => {
                this.stopOrbAnimation();
            });
        }
        
        // Experience Button
        const experienceBtn = document.getElementById('experienceBtn');
        if (experienceBtn) {
            experienceBtn.addEventListener('click', () => {
                this.startExperience();
            });
        }
        
        // Dimension Button
        const dimensionBtn = document.getElementById('dimensionBtn');
        if (dimensionBtn) {
            dimensionBtn.addEventListener('click', () => {
                this.exploreDimension();
            });
        }
        
        // Floating Voices Interaction
        const voices = document.querySelectorAll('.floating-voices .voice');
        voices.forEach(voice => {
            voice.style.cursor = 'pointer';
            voice.addEventListener('mouseenter', (e) => {
                this.highlightLanguage(e.target.dataset.lang);
            });
        });
    }
    
    // Voice Pulse Effect
    pulseVoices() {
        const voices = document.querySelectorAll('.floating-voices .voice');
        voices.forEach((voice, index) => {
            setTimeout(() => {
                voice.style.animation = 'none';
                void voice.offsetWidth; // Trigger reflow
                voice.style.animation = `voicePulse 1s ease-out`;
                
                // Create ripple effect
                this.createRipple(voice);
            }, index * 100);
        });
        
        // Add pulse animation if not exists
        if (!document.getElementById('voicePulseStyle')) {
            const style = document.createElement('style');
            style.id = 'voicePulseStyle';
            style.textContent = `
                @keyframes voicePulse {
                    0% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.5); opacity: 1; }
                    100% { transform: scale(1); opacity: 0.6; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Create Ripple Effect
    createRipple(element) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        
        ripple.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            width: 10px;
            height: 10px;
            background: radial-gradient(circle, 
                rgba(167, 139, 250, 0.8) 0%, 
                transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 1000;
            animation: rippleExpand 1.5s ease-out forwards;
        `;
        
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1500);
        
        // Add ripple animation if not exists
        if (!document.getElementById('rippleExpandStyle')) {
            const style = document.createElement('style');
            style.id = 'rippleExpandStyle';
            style.textContent = `
                @keyframes rippleExpand {
                    to {
                        width: 300px;
                        height: 300px;
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Play Voice Demo (Simulated)
    playVoiceDemo() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        
        // Visual feedback
        const orb = document.querySelector('.orb-core');
        if (orb) {
            orb.style.animation = 'orbPulseIntense 0.5s ease-out';
            setTimeout(() => {
                orb.style.animation = '';
            }, 500);
        }
        
        // Create floating text effect
        const languages = ['音', '소리', 'Voice', '聲'];
        languages.forEach((text, index) => {
            setTimeout(() => {
                this.createFloatingText(text, this.centralOrb);
            }, index * 200);
        });
        
        setTimeout(() => {
            this.isPlaying = false;
        }, 2000);
    }
    
    // Create Floating Text
    createFloatingText(text, origin) {
        const floatingText = document.createElement('div');
        const rect = origin.getBoundingClientRect();
        
        floatingText.textContent = text;
        floatingText.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            font-family: 'Noto Sans JP', sans-serif;
            font-size: 1.5rem;
            color: rgba(167, 139, 250, 0.9);
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 1000;
            animation: floatUp 2s ease-out forwards;
            text-shadow: 0 0 20px rgba(167, 139, 250, 0.8);
        `;
        
        document.body.appendChild(floatingText);
        setTimeout(() => floatingText.remove(), 2000);
        
        // Add float animation if not exists
        if (!document.getElementById('floatUpStyle')) {
            const style = document.createElement('style');
            style.id = 'floatUpStyle';
            style.textContent = `
                @keyframes floatUp {
                    to {
                        transform: translate(-50%, -250%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Start Experience
    startExperience() {
        console.log('Starting ARIA Experience...');
        
        // Create immersive overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, 
                rgba(167, 139, 250, 0.95) 0%, 
                rgba(10, 10, 15, 1) 100%);
            z-index: 10000;
            opacity: 0;
            transition: opacity 1s ease-in;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 2rem;
        `;
        
        const message = document.createElement('div');
        message.style.cssText = `
            font-family: 'Cinzel', serif;
            font-size: 3rem;
            color: white;
            letter-spacing: 0.2em;
            opacity: 0;
            transition: opacity 0.5s ease-in 0.5s;
        `;
        message.textContent = 'INITIALIZING...';
        
        const subMessage = document.createElement('div');
        subMessage.style.cssText = `
            font-family: 'Noto Sans JP', sans-serif;
            font-size: 1.5rem;
            color: rgba(255, 255, 255, 0.8);
            letter-spacing: 0.1em;
            opacity: 0;
            transition: opacity 0.5s ease-in 0.8s;
        `;
        subMessage.textContent = 'Harmony Dimensionへ接続中...';
        
        overlay.appendChild(message);
        overlay.appendChild(subMessage);
        document.body.appendChild(overlay);
        
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            message.style.opacity = '1';
            subMessage.style.opacity = '1';
        });
        
        // Simulate loading and redirect
        setTimeout(() => {
            message.textContent = 'WELCOME';
            subMessage.textContent = 'ようこそ、ARIAの世界へ';
        }, 2000);
        
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 1000);
        }, 4000);
    }
    
    // Explore Dimension
    exploreDimension() {
        console.log('Exploring Harmony Dimension...');
        
        // Create portal effect
        const portal = document.createElement('div');
        portal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: radial-gradient(circle, 
                rgba(167, 139, 250, 1) 0%, 
                rgba(129, 140, 248, 0.8) 50%, 
                transparent 100%);
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 9999;
            transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        document.body.appendChild(portal);
        
        requestAnimationFrame(() => {
            portal.style.width = '200vw';
            portal.style.height = '200vh';
            portal.style.opacity = '0';
        });
        
        setTimeout(() => portal.remove(), 1000);
    }
    
    // Highlight Language
    highlightLanguage(lang) {
        // Create language-specific effect
        const colors = {
            jp: 'rgba(167, 139, 250, 0.8)',
            ko: 'rgba(129, 140, 248, 0.8)',
            en: 'rgba(192, 132, 252, 0.8)',
            zh: 'rgba(232, 121, 249, 0.8)'
        };
        
        const color = colors[lang] || colors.jp;
        
        // Create highlight effect
        const highlight = document.createElement('div');
        highlight.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, ${color} 0%, transparent 70%);
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 999;
            animation: highlightPulse 0.5s ease-out;
        `;
        
        document.body.appendChild(highlight);
        setTimeout(() => highlight.remove(), 500);
    }
    
    // Orb Animations
    startOrbAnimation() {
        if (!this.centralOrb) return;
        this.centralOrb.classList.add('active');
        
        // Intensify particle connections near orb
        this.particles.forEach(particle => {
            particle.connectionRadius = 200;
        });
    }
    
    stopOrbAnimation() {
        if (!this.centralOrb) return;
        this.centralOrb.classList.remove('active');
        
        // Reset particle connections
        this.particles.forEach(particle => {
            particle.connectionRadius = 150;
        });
    }
    
    // Scroll Effects
    setupScrollEffects() {
        const heroSection = document.querySelector('.hero-section');
        const heroContent = document.querySelector('.hero-content');
        
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            const heroHeight = heroSection.offsetHeight;
            const scrollPercent = scrollY / heroHeight;
            
            // Parallax effect
            if (heroContent) {
                heroContent.style.transform = `translateY(${scrollY * 0.5}px)`;
                heroContent.style.opacity = 1 - scrollPercent * 0.8;
            }
            
            // Adjust particle opacity
            if (this.voiceField) {
                this.voiceField.style.opacity = 0.6 - scrollPercent * 0.4;
            }
        });
    }
    
    // Audio Visualizer Setup (Simulated)
    setupAudioVisualizer() {
        const bars = document.querySelectorAll('.frequency-bars .bar');
        
        if (bars.length > 0) {
            // Simulate audio frequency data
            setInterval(() => {
                bars.forEach((bar, index) => {
                    const height = Math.random() * 60 + 20;
                    bar.style.height = `${height}%`;
                    bar.style.opacity = height / 100;
                });
            }, 200);
        }
    }
}

// Initialize Hero Section
document.addEventListener('DOMContentLoaded', () => {
    const ariaHero = new ARIAHero();
    
    // Add loading animation
    setTimeout(() => {
        document.querySelector('.hero-section').classList.add('loaded');
    }, 100);
    
    console.log('ARIA Hero Section initialized');
    console.log('千の声が響き始める...');
});

// Add necessary styles for active states
const heroStyles = document.createElement('style');
heroStyles.textContent = `
    .voice-orb.active .orb-core {
        animation: orbPulseIntense 0.5s ease-out infinite;
    }
    
    @keyframes orbPulseIntense {
        0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 
                0 0 60px rgba(167, 139, 250, 0.6),
                0 0 120px rgba(167, 139, 250, 0.4),
                inset 0 0 30px rgba(255, 255, 255, 0.4);
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2);
            box-shadow: 
                0 0 80px rgba(167, 139, 250, 0.8),
                0 0 160px rgba(167, 139, 250, 0.6),
                inset 0 0 40px rgba(255, 255, 255, 0.6);
        }
    }
    
    @keyframes highlightPulse {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
        }
    }
    
    .hero-section.loaded .hero-content {
        animation: heroContentLoad 1.5s ease-out;
    }
    
    @keyframes heroContentLoad {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(heroStyles);
