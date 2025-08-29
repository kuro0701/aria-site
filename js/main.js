document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');

    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- Canvas パーティクルエフェクト ---
    const canvas = document.getElementById('particle-canvas');
    
    // START: モバイル最適化コード
    // 画面幅が820px以下の場合は、パーティクル処理をここで終了させる
    if (window.innerWidth <= 820) {
        if(canvas) {
            canvas.style.display = 'none'; //念のためcanvasを非表示に
        }
    // END: モバイル最適化コード
    } else if (canvas) { // 元々の処理を 'else if' で囲む
        const ctx = canvas.getContext('2d');
        let particlesArray;

        const mouse = {
            x: null,
            y: null,
            radius: 80
        };

        window.addEventListener('mousemove', (event) => {
            mouse.x = event.x;
            mouse.y = event.y;
        });

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                if (this.x > canvas.width || this.x < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                }

                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius + this.size) {
                    if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                        this.x += 3;
                    }
                    if (mouse.x > this.x && this.x > this.size * 10) {
                        this.x -= 3;
                    }
                    if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                        this.y += 3;
                    }
                    if (mouse.y > this.y && this.y > this.size * 10) {
                        this.y -= 3;
                    }
                }

                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        function initParticles() {
            particlesArray = [];
            let numberOfParticles = (canvas.width * canvas.height) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 1;
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.height;
                let directionX = (Math.random() * 0.4) - 0.2;
                let directionY = (Math.random() * 0.4) - 0.2;
                let color = 'rgba(0, 242, 255, 0.5)';
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        function animateParticles() {
            requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
        }

        function setCanvasSize() {
            if (header) {
                canvas.width = header.offsetWidth;
                canvas.height = header.offsetHeight;
                initParticles();
            }
        }

        window.addEventListener('resize', setCanvasSize);
        setCanvasSize();
        animateParticles();
    }

    // --- ハンバーガーメニュー ---
    const hamburger = document.querySelector('.hamburger');
    const navArea = document.querySelector('.nav-area');
    const navLinks = document.querySelectorAll('.main-nav a');

    if (hamburger && navArea) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('is-active');
            navArea.classList.toggle('is-active');
            document.body.classList.toggle('no-scroll');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger.classList.contains('is-active')) {
                hamburger.classList.remove('is-active');
                navArea.classList.remove('is-active');
                document.body.classList.remove('no-scroll');
            }
        });
    });
});