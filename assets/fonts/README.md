# Fonts Directory

## 使用フォント

現在はGoogle Fontsを使用していますが、カスタムフォントを追加する場合はこのディレクトリに配置してください。

### 現在使用中のフォント（Google Fonts経由）
- **Cinzel** - ロゴ、見出し用
- **Montserrat** - 英語テキスト用
- **Noto Sans JP** - 日本語テキスト用

### カスタムフォント追加時の形式
- WOFF2（推奨）
- WOFF
- TTF/OTF（フォールバック）

### 実装例
```css
@font-face {
    font-family: 'CustomFont';
    src: url('../fonts/customfont.woff2') format('woff2'),
         url('../fonts/customfont.woff') format('woff');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}
```
