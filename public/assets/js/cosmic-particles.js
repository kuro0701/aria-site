/*
* ARIA Cosmic Particles v1.0
* - 軽量なCanvas 2Dベース（WebGL依存なし）
* - マウス／タッチに緩やか追従（Harmony Dimensionの“声の海”イメージ）
* - prefers-reduced-motion対応（静止背景へフォールバック）
* - タブ非アクティブ時は自動スリープ
*/
(function () {
const DPR = Math.min(window.devicePixelRatio || 1, 2);
const MAX_PARTICLES_DESKTOP = 120;
const MAX_PARTICLES_MOBILE = 60;
const isMobile = matchMedia('(max-width: 768px)').matches;
const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;


const canvas = document.getElementById('cosmic-bg');
if (!canvas) return;
const ctx = canvas.getContext('2d', { alpha: true });


// レイヤー調整（保険）
canvas.style.position = 'fixed';
canvas.style.inset = 0;
canvas.style.zIndex = '0';
canvas.style.pointerEvents = 'none';


let W = 0, H = 0, running = true;
let particles = [];
let mouse = { x: 0, y: 0, active: false };


function resize() {
W = canvas.clientWidth;
H = canvas.clientHeight;
canvas.width = Math.floor(W * DPR);
canvas.height = Math.floor(H * DPR);
ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
// 画面面積に応じた粒子数
const target = Math.floor((W * H) / 12000);
const max = isMobile ? MAX_PARTICLES_MOBILE : MAX_PARTICLES_DESKTOP;
const count = Math.min(target, max);
// 粒子数を調整
if (particles.length > count) particles.length = count;
while (particles.length < count) particles.push(makeParticle());
}


function rand(a, b) { return a + Math.random() * (b - a); }


function makeParticle() {
const speed = rand(0.05, 0.25);
return {
x: rand(0, W),
y: rand(0, H),
vx: rand(-speed, speed),
vy: rand(-speed, speed),
s: rand(0.6, 2.0), // サイズ
a: rand(0.35, 0.85), // 透明度
};
}


function update(dt) {
const attract = mouse.active ? 0.0009 * dt : 0; // カーソル吸引の強さ
for (let p of particles) {
// 緩やかなカーソル追従（万一オーバーシュートしないよう弱め）
if (attract) {
const dx = mouse.x - p.x;
const dy = mouse.y - p.y;
p.vx += dx * attract;
p.vy += dy * attract;
}
// 自然なドリフト（わずかな乱流）
p.vx += rand(-0.005, 0.005);
p.vy += rand(-0.005, 0.005);


// 速度クランプ
const maxV = 0.6;
const sp = Math.hypot(p.vx, p.vy);
if (sp > maxV) { p.vx = (p.vx / sp) * maxV; p.vy = (p.vy / sp) * maxV; }


})();