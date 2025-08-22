# ARIA Music Player - ファイル配置ガイド

## 🎵 音楽ファイルの配置

`/assets/audio/` ディレクトリに以下のWAVファイルを配置してください：

### Ver.1（通常版/ステレオ）
- `digital_angel_ver1.wav` - DIGITAL ANGEL（Ver.1）
- `digital_harmony_ver1.wav` - Digital Harmony（Ver.1）
- `neon_dreams_ver1.wav` - Neon Dreams（Ver.1）

### Ver.2（Dolby Atmos版）
- `digital_angel_ver2.wav` - DIGITAL ANGEL（Ver.2）
- `digital_harmony_ver2.wav` - Digital Harmony（Ver.2）
- `neon_dreams_ver2.wav` - Neon Dreams（Ver.2）

## 🖼️ 画像ファイルの配置

`/assets/images/` ディレクトリに以下のPNGファイルを配置してください：

- `digital_angel.png` - DIGITAL ANGELのアートワーク
- `digital_harmony.png` - Digital Harmonyのアートワーク
- `neon_dreams.png` - Neon Dreamsのアートワーク

### 推奨画像サイズ
- 最小: 300x300px
- 推奨: 600x600px
- 最大: 1200x1200px
- フォーマット: PNG（透過対応）

## 📁 ディレクトリ構造

```
aria_site/
├── assets/
│   ├── audio/
│   │   ├── digital_angel_ver1.wav
│   │   ├── digital_angel_ver2.wav
│   │   ├── digital_harmony_ver1.wav
│   │   ├── digital_harmony_ver2.wav
│   │   ├── neon_dreams_ver1.wav
│   │   └── neon_dreams_ver2.wav
│   └── images/
│       ├── digital_angel.png
│       ├── digital_harmony.png
│       └── neon_dreams.png
```

## 🎮 操作方法

### キーボードショートカット
- **スペースキー**: 再生/一時停止
- **→ 右矢印**: 次のトラック
- **← 左矢印**: 前のトラック

### 音質切り替え
- **Ver.1ボタン**: 通常ステレオ版を再生
- **Ver.2ボタン**: Dolby Atmos版を再生

## ⚠️ 注意事項

- ファイル名は大文字小文字を区別します（case-sensitive）
- WAVファイルは非圧縮のため、ファイルサイズが大きくなります
- 画像ファイルが存在しない場合、自動生成されたアートワークが表示されます
- 音楽ファイルが存在しない場合、再生はスキップされます

## 🔧 トラブルシューティング

### 音楽が再生されない場合
1. ブラウザのコンソールでエラーを確認
2. ファイル名が正しいか確認
3. WAVファイルのフォーマットが正しいか確認（44.1kHz/16bit推奨）

### 画像が表示されない場合
1. ファイル名の拡張子が`.png`であることを確認
2. ファイルパスが正しいか確認
3. 画像ファイルが破損していないか確認
