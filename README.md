# ARIA Official Website

## 概要
ARIA（アリア）の公式ウェブサイト - Harmony Dimensionから来た、Dolby Atmosネイティブ・ソロアーティスト

## プロジェクト構造
```
aria_site/
├── index.html              # メインHTML
├── assets/
│   ├── css/
│   │   ├── reset.css      # CSSリセット
│   │   ├── header.css     # ヘッダースタイル
│   │   └── main.css       # メインスタイル
│   ├── js/
│   │   ├── header.js      # ヘッダーインタラクション
│   │   └── particles.js   # パーティクルシステム
│   ├── images/            # 画像ファイル
│   └── fonts/            # カスタムフォント
└── README.md

```

## デザインコンセプト

### テーマ：「Harmony Dimensionへのポータル」
- **色彩**：深い宇宙空間を思わせる暗い背景に、紫・青・ピンクのグラデーション
- **動き**：3D音響を視覚化した波動エフェクト、千の声を表現するパーティクル
- **インタラクション**：ホバー時の音波エフェクト、言語切替時の声質変化表現

## 必要な画像素材（Midjourney用プロンプト）

### 1. 背景画像（portal-bg.png）
```
Deep space dimensional portal, purple and blue nebula clouds, 
ethereal cosmic dust particles, luxury dark aesthetic, 
subtle glowing orbs floating, cinematic lighting, 
8K resolution, ultra detailed --ar 16:9 --v 6
```

### 2. ARIAビジュアル（aria-visual.png）
```
Beautiful ethereal AI female artist, 19 years old, 
angelic elegant appearance, conducting invisible sounds,
purple blue gradient aura, floating in digital space,
sophisticated futuristic fashion, holographic effects,
cinematic portrait, ultra realistic --ar 9:16 --v 6
```

### 3. 音波ビジュアライゼーション（sound-waves.png）
```
3D sound waves visualization, Dolby Atmos spatial audio,
concentric circles and flowing lines, purple blue gradient,
abstract geometric patterns, luxury minimalist design,
transparent background, vector style --ar 16:9 --v 6
```

### 4. Harmony Dimensionロゴ（dimension-logo.png）
```
Minimalist sacred geometry logo, interconnected circles,
representing thousand voices, metallic silver gradient,
luxury brand aesthetic, clean modern design,
transparent background --ar 1:1 --v 6
```

### 5. 言語オーブ（language-orbs.png）
```
Four floating crystal orbs, representing different languages,
Korean Japanese English Chinese symbols inside,
holographic iridescent material, soft glow effect,
dark background, 3D render --ar 16:9 --v 6
```

## 技術仕様

### 使用技術
- HTML5 / CSS3
- Vanilla JavaScript（フレームワークなし）
- Canvas API（パーティクルシステム）
- CSS Grid / Flexbox
- CSS Animation / Transition

### ブラウザ対応
- Chrome（推奨）
- Firefox
- Safari
- Edge

### パフォーマンス最適化
- GPU加速アニメーション（transform, opacity）
- RequestAnimationFrame使用
- Lazy loading対応
- 画像最適化（WebP形式推奨）

## セットアップ

1. リポジトリをクローン
```bash
git clone [repository-url]
cd aria_site
```

2. ローカルサーバーで起動
```bash
# Python 3の場合
python -m http.server 8000

# Node.jsの場合
npx serve
```

3. ブラウザでアクセス
```
http://localhost:8000
```

## 今後の実装予定

### フェーズ1（ヘッダー完成）✅
- [x] 基本構造
- [x] アニメーション
- [x] インタラクション
- [x] パーティクルシステム

### フェーズ2（コンテンツエリア）
- [ ] ヒーローセクション
- [ ] 音楽プレイヤー（3D Audio対応）
- [ ] ディスコグラフィー
- [ ] ライブスケジュール

### フェーズ3（インタラクティブ要素）
- [ ] WebGL 3Dビジュアライゼーション
- [ ] Web Audio API連携
- [ ] AIチャット機能
- [ ] ファンポータル

## ライセンス
© 2025 K&R Entertainment. All rights reserved.

## コンタクト
ARIA Official Website Development Team
