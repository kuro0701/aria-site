// ARIA Hero Section Interactive Functions

class ARIAHero {
    constructor() {
        this.heroSection = document.querySelector('.hero-section');
        this.ariaVisual = document.querySelector('.hero-aria-visual');
        this.lastMove = 0;
        this.throttleDelay = 16; // 約60fpsに調整

        if (this.heroSection && this.ariaVisual) {
            this.init();
        } else {
            console.error('Hero section elements not found.');
        }
    }

    init() {
        // PCでのマウス追従
        document.addEventListener('mousemove', (e) => this.throttle(this.handleMouseMove.bind(this, e)));

        // モバイルでのジャイロセンサー追従
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => this.throttle(this.handleDeviceOrientation.bind(this, e)));
        }
    }

    /**
     * イベントの発火を間引く（スロットル）関数
     * @param {function} func - 実行する関数
     */
    throttle(func) {
        const now = Date.now();
        if (now - this.lastMove > this.throttleDelay) {
            this.lastMove = now;
            func();
        }
    }

    /**
     * マウスの動きに応じてARIAを動かす
     * @param {MouseEvent} e - MouseEventオブジェクト
     */
    handleMouseMove(e) {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        // 画面の中心からのマウスの相対位置を-1から1の範囲で計算
        const moveX = (clientX / innerWidth - 0.5) * 2;
        const moveY = (clientY / innerHeight - 0.5) * 2;

        this.applyTransform(moveX, moveY);
    }

    /**
     * デバイスの傾きに応じてARIAを動かす
     * @param {DeviceOrientationEvent} e - DeviceOrientationEventオブジェクト
     */
    handleDeviceOrientation(e) {
        // gamma: 左右の傾き (-90 to 90)
        // beta: 前後の傾き (-180 to 180)
        let { beta, gamma } = e;

        // 値を正規化して使いやすくする
        gamma = Math.max(-45, Math.min(45, gamma)); // 左右の傾きを制限
        beta = Math.max(-45, Math.min(45, beta));  // 前後の傾きを制限

        const moveX = gamma / 45;
        const moveY = beta / 45;

        this.applyTransform(moveX, moveY);
    }

    /**
     * 実際に要素にtransformを適用する
     * @param {number} moveX - X軸の移動量 (-1 to 1)
     * @param {number} moveY - Y軸の移動量 (-1 to 1)
     */
    applyTransform(moveX, moveY) {
        const maxRotation = 5; // 最大回転角度（度）
        const maxTranslation = 15; // 最大移動量（px）

        const rotateY = -moveX * maxRotation;
        const rotateX = moveY * maxRotation;
        const translateX = -moveX * maxTranslation;
        const translateY = -moveY * maxTranslation;

        // パフォーマンス向上のため、requestAnimationFrameを使用
        requestAnimationFrame(() => {
            this.ariaVisual.style.transform = `
                perspective(1000px)
                translateX(${translateX}px) 
                translateY(${translateY}px)
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg)
            `;
            this.ariaVisual.style.transition = 'transform 0.2s ease-out';
        });
    }
}

// DOMが読み込まれたら初期化
document.addEventListener('DOMContentLoaded', () => {
    new ARIAHero();
    console.log('ARIA Hero initialized');
});