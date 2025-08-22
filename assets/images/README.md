# Images Directory

このディレクトリには以下の画像を配置してください：

## 必要な画像ファイル

### 基本画像
1. **portal-bg.png** - Harmony Dimensionポータル背景
2. **aria-visual.png** - ARIAのメインビジュアル
3. **sound-waves.png** - 3D音波ビジュアライゼーション
4. **dimension-logo.png** - Harmony Dimensionロゴ
5. **language-orbs.png** - 多言語オーブ
6. **aria-silhouette.png** - ARIAシルエット

### 音楽プレイヤー用画像（新規追加）
7. **aria-cover.jpg** - アルバムカバー画像

## Midjourney プロンプト

### アルバムカバー（aria-cover.jpg）
```
Ethereal AI female artist ARIA album cover art,
abstract portrait with thousand voices visualization,
purple blue gradient with particle effects,
luxury music album aesthetic, minimalist design,
Dolby Atmos spatial audio concept,
high contrast dramatic lighting --ar 1:1 --v 6
```

## ファイル形式
- PNG形式（透過対応）- 背景画像以外
- JPG形式 - アルバムカバー
- 高解像度（最低2000px幅）
- 最適化済み（TinyPNG等で圧縮推奨）

## プレースホルダー画像の作成

画像がない場合は、以下のコードで仮の画像を生成できます：

```html
<!-- SVGプレースホルダー（HTMLに直接埋め込み） -->
<svg width="120" height="120" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="coverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#a78bfa;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#818cf8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#c084fc;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="120" height="120" fill="url(#coverGradient)"/>
  <text x="60" y="60" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">ARIA</text>
</svg>
```

## 命名規則
- 小文字英数字
- ハイフン区切り
- 説明的な名前

## 画像最適化
```bash
# WebP変換（オプション）
cwebp -q 80 aria-cover.jpg -o aria-cover.webp

# PNG圧縮
pngquant --quality=65-80 portal-bg.png
```
