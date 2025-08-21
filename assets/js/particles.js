// ARIA Particles System - Harmony Dimension Visualization

class HarmonyParticles {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.soundWaves = [];
        this.voiceNodes = [];
        this.animationId = null;
        
        this.config = {
            particleCount: 50,
            waveCount: 3,
            nodeCount: 7,
            colors: {
                primary: 'rgba(167, 139, 250, ',
                secondary: 'rgba(129, 140, 248, ',
                accent: 'rgba(192, 132, 252, ',
                glow: 'rgba(233, 121, 249, '
            }
        };
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.setupParticles();
        this.setupSoundWaves();
        this.setupVoiceNodes();
        this.animate();
        this.handleResize();
    }
    
    createCanvas() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'harmony-particles-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.3;
        `;
        
        // Insert after portal background
        const portalBg = document.querySelector('.portal-background');
        if (portalBg) {
            portalBg.appendChild(this.canvas);
        } else {
            document.body.appendChild(this.canvas);
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupParticles() {
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: this.getRandomColor(),
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    setupSoundWaves() {
        // Create expanding sound waves from random positions
        for (let i = 0; i < this.config.waveCount; i++) {
            this.soundWaves.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 0,
                maxRadius: 200,
                speed: Math.random() * 0.5 + 0.5,
                opacity: 0.3,
                color: this.config.colors.primary
            });
        }
    }
    
    setupVoiceNodes() {
        // Create voice nodes representing the "thousand voices"
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3;
        
        for (let i = 0; i < this.config.nodeCount; i++) {
            const angle = (i / this.config.nodeCount) * Math.PI * 2;
            this.voiceNodes.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                targetX: centerX + Math.cos(angle) * radius,
                targetY: centerY + Math.sin(angle) * radius,
                radius: 5,
                pulseRadius: 5,
                angle: angle,
                orbitRadius: radius,
                centerX: centerX,
                centerY: centerY,
                color: this.getRandomColor(),
                connections: []
            });
        }
        
        // Create connections between nodes
        this.voiceNodes.forEach((node, i) => {
            const connectCount = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < connectCount; j++) {
                const targetIndex = (i + j + 1) % this.config.nodeCount;
                node.connections.push(targetIndex);
            }
        });
    }
    
    getRandomColor() {
        const colors = [
            this.config.colors.primary,
            this.config.colors.secondary,
            this.config.colors.accent,
            this.config.colors.glow
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Pulse effect
            particle.pulsePhase += 0.02;
            particle.radius = Math.sin(particle.pulsePhase) * 0.5 + 1.5;
            
            // Wrap around screen
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Random direction change
            if (Math.random() < 0.01) {
                particle.vx = (Math.random() - 0.5) * 0.5;
                particle.vy = (Math.random() - 0.5) * 0.5;
            }
        });
    }
    
    updateSoundWaves() {
        this.soundWaves.forEach(wave => {
            wave.radius += wave.speed;
            wave.opacity = (1 - wave.radius / wave.maxRadius) * 0.3;
            
            // Reset wave when it reaches max radius
            if (wave.radius > wave.maxRadius) {
                wave.radius = 0;
                wave.x = Math.random() * this.canvas.width;
                wave.y = Math.random() * this.canvas.height;
                wave.speed = Math.random() * 0.5 + 0.5;
            }
        });
    }
    
    updateVoiceNodes() {
        const time = Date.now() * 0.0005;
        
        this.voiceNodes.forEach((node, i) => {
            // Orbital motion
            node.angle += 0.002 * (i % 2 === 0 ? 1 : -1);
            node.targetX = node.centerX + Math.cos(node.angle) * node.orbitRadius;
            node.targetY = node.centerY + Math.sin(node.angle) * node.orbitRadius;
            
            // Smooth movement to target
            node.x += (node.targetX - node.x) * 0.1;
            node.y += (node.targetY - node.y) * 0.1;
            
            // Pulse effect
            node.pulseRadius = node.radius + Math.sin(time + i) * 2;
            
            // Random orbit radius change
            if (Math.random() < 0.005) {
                node.orbitRadius = Math.min(
                    Math.min(this.canvas.width, this.canvas.height) * 0.4,
                    Math.max(50, node.orbitRadius + (Math.random() - 0.5) * 50)
                );
            }
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + particle.opacity + ')';
            this.ctx.fill();
            
            // Add glow effect
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + (particle.opacity * 0.2) + ')';
            this.ctx.fill();
        });
    }
    
    drawSoundWaves() {
        this.soundWaves.forEach(wave => {
            this.ctx.beginPath();
            this.ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = wave.color + wave.opacity + ')';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }
    
    drawVoiceNodes() {
        // Draw connections first
        this.ctx.strokeStyle = this.config.colors.primary + '0.1)';
        this.ctx.lineWidth = 0.5;
        
        this.voiceNodes.forEach(node => {
            node.connections.forEach(targetIndex => {
                const target = this.voiceNodes[targetIndex];
                this.ctx.beginPath();
                this.ctx.moveTo(node.x, node.y);
                
                // Create curved connections
                const controlX = (node.x + target.x) / 2;
                const controlY = (node.y + target.y) / 2 - 50;
                this.ctx.quadraticCurveTo(controlX, controlY, target.x, target.y);
                this.ctx.stroke();
            });
        });
        
        // Draw nodes
        this.voiceNodes.forEach(node => {
            // Outer glow
            const gradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.pulseRadius * 3
            );
            gradient.addColorStop(0, node.color + '0.5)');
            gradient.addColorStop(1, node.color + '0)');
            
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.pulseRadius * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // Core
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.pulseRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = node.color + '0.8)';
            this.ctx.fill();
        });
    }
    
    animate() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw all elements
        this.updateParticles();
        this.updateSoundWaves();
        this.updateVoiceNodes();
        
        this.drawSoundWaves();
        this.drawParticles();
        this.drawVoiceNodes();
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    handleResize() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            
            // Recalculate voice nodes positions
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3;
            
            this.voiceNodes.forEach(node => {
                node.centerX = centerX;
                node.centerY = centerY;
                node.orbitRadius = radius;
            });
        });
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize particles system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const harmonyParticles = new HarmonyParticles();
    
    // Make it globally accessible if needed
    window.harmonyParticles = harmonyParticles;
    
    console.log('Harmony Dimension particles initialized');
});
