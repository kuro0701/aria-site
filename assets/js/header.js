// ARIA Header Interactive Functions

class ARIAHeader {
    constructor() {
        this.header = document.querySelector('.aria-header');
        this.navItems = document.querySelectorAll('.nav-item');
        this.langToggle = document.querySelector('.lang-toggle');
        this.langOptions = document.querySelectorAll('.lang-option');
        this.ctaButton = document.querySelector('.cta-listen');
        this.voiceWaves = document.querySelector('.voice-waves');
        
        this.init();
    }
    
    init() {
        this.setupScrollEffects();
        this.setupNavigation();
        this.setupLanguageSelector();
        this.setupCTAButton();
        this.setupLogoAnimation();
        this.createDynamicParticles();
    }
    
    // Header transparency on scroll
    setupScrollEffects() {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                this.header.style.background = 'rgba(10, 10, 15, 0.98)';
                this.header.style.backdropFilter = 'blur(30px)';
            } else {
                this.header.style.background = 'linear-gradient(180deg, rgba(10, 10, 15, 0.95) 0%, rgba(10, 10, 15, 0.8) 100%)';
                this.header.style.backdropFilter = 'blur(20px)';
            }
            
            // Hide/show header on scroll
            if (currentScroll > lastScroll && currentScroll > 100) {
                this.header.style.transform = 'translateY(-100%)';
            } else {
                this.header.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        });
    }
    
    // 3D Navigation Effects
    setupNavigation() {
        this.navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            
            link.addEventListener('mouseenter', () => {
                this.create3DSoundEffect(item);
            });
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                this.navigateToDimension(target, item);
            });
        });
    }
    
    // Create 3D sound visualization on hover
    create3DSoundEffect(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create temporary sound wave elements
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const wave = document.createElement('div');
                wave.className = 'temp-sound-wave';
                wave.style.cssText = `
                    position: fixed;
                    left: ${centerX}px;
                    top: ${centerY}px;
                    width: 30px;
                    height: 30px;
                    border: 1px solid rgba(167, 139, 250, 0.5);
                    border-radius: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    pointer-events: none;
                    z-index: 999;
                `;
                document.body.appendChild(wave);
                
                // Animate the wave
                requestAnimationFrame(() => {
                    wave.style.transition = 'all 0.8s ease-out';
                    wave.style.transform = 'translate(-50%, -50%) scale(3)';
                    wave.style.opacity = '0';
                });
                
                // Remove after animation
                setTimeout(() => wave.remove(), 800);
            }, i * 100);
        }
    }
    
    // Navigate to different "dimensions" (sections)
    navigateToDimension(target, navItem) {
        const dimension = navItem.dataset.dimension;
        
        // Create portal transition effect
        this.createPortalTransition(dimension);
        
        // Smooth scroll to section (if exists)
        if (target !== '#') {
            const targetElement = document.querySelector(target);
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        }
    }
    
    // Portal transition effect
    createPortalTransition(dimension) {
        const portal = document.createElement('div');
        portal.className = 'portal-transition';
        portal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: radial-gradient(circle, 
                rgba(167, 139, 250, 0.8) 0%, 
                rgba(192, 132, 252, 0.6) 50%, 
                transparent 100%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 9999;
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        document.body.appendChild(portal);
        
        requestAnimationFrame(() => {
            portal.style.width = '300vw';
            portal.style.height = '300vh';
            portal.style.opacity = '0';
        });
        
        setTimeout(() => portal.remove(), 600);
    }
    
    // Language Selector with Orbital Animation
    setupLanguageSelector() {
        const languages = ['JP', 'KO', 'EN', 'ZH'];
        let currentLangIndex = 0;
        
        this.langToggle.addEventListener('click', () => {
            currentLangIndex = (currentLangIndex + 1) % languages.length;
            const currentLang = this.langToggle.querySelector('.lang-current');
            
            // Create swirl effect
            currentLang.style.animation = 'langSwirl 0.5s ease-out';
            
            setTimeout(() => {
                currentLang.textContent = languages[currentLangIndex];
                currentLang.style.animation = '';
            }, 250);
            
            // Trigger voice change effect
            this.triggerVoiceChange(languages[currentLangIndex]);
        });
        
        // Add swirl animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes langSwirl {
                0% { transform: rotate(0deg) scale(1); opacity: 1; }
                50% { transform: rotate(180deg) scale(0.5); opacity: 0; }
                100% { transform: rotate(360deg) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Voice change visualization when language switches
    triggerVoiceChange(language) {
        const colors = {
            'JP': '#a78bfa',
            'KO': '#818cf8',
            'EN': '#c084fc',
            'ZH': '#e879f9'
        };
        
        // Create voice particles
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                left: ${Math.random() * window.innerWidth}px;
                bottom: 0;
                width: 3px;
                height: 3px;
                background: ${colors[language]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: voiceFloat 2s ease-out forwards;
            `;
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 2000);
        }
    }
    
    // CTA Button 3D Audio Effect
    setupCTAButton() {
        this.ctaButton.addEventListener('mouseenter', () => {
            this.create3DAudioRipple();
        });
        
        this.ctaButton.addEventListener('click', () => {
            this.initiate3DListeningExperience();
        });
    }
    
    // Create 3D audio ripple effect
    create3DAudioRipple() {
        const rect = this.ctaButton.getBoundingClientRect();
        const ripple = document.createElement('div');
        
        ripple.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            border: 2px solid rgba(167, 139, 250, 0.6);
            border-radius: 30px;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 999;
            animation: rippleExpand 1s ease-out forwards;
        `;
        
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1000);
    }
    
    // Initiate 3D listening experience
    initiate3DListeningExperience() {
        console.log('Initiating Harmony Dimension Portal...');
        
        // Create immersive transition
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, 
                rgba(167, 139, 250, 0.9) 0%, 
                rgba(10, 10, 15, 0.95) 100%);
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.5s ease-in;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const message = document.createElement('div');
        message.style.cssText = `
            font-family: 'Cinzel', serif;
            font-size: 2rem;
            color: white;
            letter-spacing: 0.2em;
            opacity: 0;
            transition: opacity 0.5s ease-in 0.3s;
        `;
        message.textContent = 'Entering Harmony Dimension...';
        
        overlay.appendChild(message);
        document.body.appendChild(overlay);
        
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            message.style.opacity = '1';
        });
        
        // Remove after animation
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 500);
        }, 2000);
    }
    
    // Logo Animation
    setupLogoAnimation() {
        const logoWrapper = document.querySelector('.logo-wrapper');
        
        logoWrapper.addEventListener('mouseenter', () => {
            // Trigger voice wave expansion
            const waves = this.voiceWaves.querySelectorAll('circle');
            waves.forEach((wave, index) => {
                wave.style.animation = 'none';
                setTimeout(() => {
                    wave.style.animation = `waveExpand 1s ease-out ${index * 0.1}s`;
                }, 10);
            });
        });
    }
    
    // Create dynamic background particles
    createDynamicParticles() {
        const particleContainer = document.querySelector('.dimension-particles');
        
        setInterval(() => {
            if (Math.random() > 0.7) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    width: 2px;
                    height: 2px;
                    background: rgba(167, 139, 250, ${Math.random() * 0.5 + 0.2});
                    border-radius: 50%;
                    animation: particleFade 3s ease-out forwards;
                `;
                
                if (particleContainer) {
                    particleContainer.appendChild(particle);
                    setTimeout(() => particle.remove(), 3000);
                }
            }
        }, 500);
    }
}

// Add necessary animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes voiceFloat {
        0% {
            transform: translateY(0) translateX(0);
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
        }
    }
    
    @keyframes rippleExpand {
        0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
        }
    }
    
    @keyframes particleFade {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        50% {
            transform: scale(1);
            opacity: 1;
        }
        100% {
            transform: scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(animationStyles);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const ariaHeader = new ARIAHeader();
    
    // Log initialization
    console.log('ARIA Header initialized');
    console.log('Welcome to Harmony Dimension');
});
