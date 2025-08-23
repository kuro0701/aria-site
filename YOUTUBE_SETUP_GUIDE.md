# YouTube Music Player - APIキー不要版

## 🎵 概要

このミュージックプレーヤーは**APIキーなし**でYouTube/YouTube Musicの音楽を再生できます！

## ✨ 主な特徴

- **APIキー不要** - YouTube IFrame APIのみで動作
- **手動管理** - 動画IDを直接コードに記載
- **簡単更新** - 管理者モードで新しい曲を追加
- **プレイリスト対応** - YouTubeプレイリストの埋め込みも可能

## 📝 使い方

### 1. 動画IDの取得方法

YouTubeの動画URLから動画IDを取得します：
```
https://www.youtube.com/watch?v=pTL_XZpYDzM
                                ^^^^^^^^^^^
                                この部分が動画ID
```

### 2. 曲の追加方法（2つのリストを管理）

#### 🎵 左側のグリッド表示用（videos配列）
最新リリースや人気曲を表示するためのリスト：

```javascript
// music-player.js の loadVideoList() 関数内
const defaultVideos = [
    {
        videoId: 'dQw4w9WgXcQ',   // YouTube動画ID
        title: 'Aethelburg',      // 曲名
        artist: 'Aria Nexus',     // アーティスト名
        album: 'Harmony Collection', // アルバム名
        publishedAt: '2024-12-22', // 公開日
        status: '本日更新',       // ステータス表示
        isDolby: true            // Dolby Atmosかどうか
    },
    // 他の動画を追加...
];
```

#### 🎧 右側のプレーヤー用（playerTracks配列）
実際に再生する楽曲のリスト：

```javascript
// music-player.js のコンストラクタ内
this.playerTracks = [
    {
        videoId: 'dQw4w9WgXcQ',    // YouTube動画ID（必須）
        title: 'DIGITAL ANGEL',    // 曲名
        artist: 'ARIA',            // アーティスト名
        album: 'Harmony Dimension', // アルバム名
        duration: '3:47'           // 再生時間（オプション）
    },
    {
        videoId: 'pTL_XZpYDzM',    // 別の曲のID
        title: 'QUANTUM HEART',
        artist: 'ARIA',
        album: 'Nexus Collection',
        duration: '4:12'
    },
    // 最大10曲程度を推奨
];
```

#### 方法B: 管理者モードを使用（推奨）

1. サイトを開く
2. **Ctrl + Shift + U** を押す
3. 管理画面が表示される
4. 動画IDとタイトルを入力
5. 「追加」ボタンをクリック
6. プレーヤーリストにも追加するか確認ダイアログが表示される

#### 方法C: ローカルストレージを利用（自動保存）

動画リストは自動的にブラウザのローカルストレージに保存されます：
- 追加した動画は自動保存
- ブラウザを閉じても保持
- 別のブラウザでは別管理

リセットしたい場合：
```javascript
localStorage.removeItem('ariaVideoList');
location.reload();
```

### 3. YouTubeプレイリストを使用する場合

公開プレイリストを作成して、そのIDを設定：

```javascript
// プレイリストIDを設定
this.playlistId = 'PLxxxxxxxxxxxxxx'; // あなたのプレイリストID
```

プレイリストのIDは、プレイリストURLから取得：
```
https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxx
                                       ^^^^^^^^^^^^^^^^
                                       この部分がプレイリストID
```

## 🎮 操作方法

### キーボードショートカット
- **スペース**: 再生/一時停止
- **→**: 次の曲
- **←**: 前の曲
- **Ctrl+Shift+U**: 管理者モード表示/非表示

### マウス操作
- 再生ボタン: クリックで再生/一時停止
- プログレスバー: クリックまたはドラッグでシーク
- 前/次ボタン: 曲の切り替え

## 📋 トラブルシューティング

### 動画が再生されない場合

1. **動画が埋め込み可能か確認**
   - 一部の動画は埋め込みが制限されています
   - 別の動画IDを試してください

2. **動画IDが正しいか確認**
   - URLから正確にコピーしているか確認
   - 余分な文字が含まれていないか確認

3. **ブラウザのコンソールを確認**
   - F12でコンソールを開く
   - エラーメッセージを確認

### エラーコードの意味

- **Error 2**: 無効な動画ID
- **Error 5**: HTML5プレーヤーエラー
- **Error 100**: 動画が見つかりません（非公開または削除済み）
- **Error 101/150**: 動画の埋め込みが許可されていません

## 🎨 カスタマイズ

### ビジュアライゼーションの色を変更

`getRandomColor()`メソッドで色を調整：

```javascript
getRandomColor() {
    const colors = [
        'rgba(167, 139, 250,',  // 紫
        'rgba(129, 140, 248,',  // 青紫
        'rgba(192, 132, 252,',  // ピンク紫
        // 好きな色を追加
        'rgba(255, 100, 100,',  // 赤
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}
```

### パーティクル数を変更

```javascript
createSpatialParticles() {
    const particleCount = 50; // この数値を変更
    // ...
}
```

## 🔒 セキュリティ

- APIキー不要なので、セキュリティリスクが低い
- 動画IDは公開情報なので問題なし
- 管理者モードは簡易的なもの（本番環境では別途認証を推奨）

## 📱 対応ブラウザ

- Chrome (推奨)
- Firefox
- Safari
- Edge
- モバイルブラウザ対応

## 💡 Tips

1. **最新の曲を上に表示**
   - `publishedAt`の日付で自動ソート
   - 新しい曲を追加すると自動的に最初に表示

2. **サムネイル画像**
   - YouTubeから自動取得
   - 高画質版が利用不可の場合は自動的に標準画質にフォールバック

3. **複数のチャンネル対応**
   - 異なるチャンネルの動画IDも追加可能
   - artistフィールドでアーティスト名を変更

## 🚀 実装済み機能と今後の拡張案

### ✅ 実装済み
- ✓ localStorage で曲リストを保存
- ✓ 2つの独立したプレイリスト管理
- ✓ YouTube動画IDによる楽曲管理
- ✓ 自動サムネイル取得
- ✓ リッチな音楽プラットフォームアイコン

### 📋 今後の拡張案
- お気に入り機能
- 再生履歴
- シャッフル再生
- リピート機能
- 音量コントロール
- プレイリストのエクスポート/インポート

## 🎨 音楽プラットフォームアイコン

各音楽プラットフォームへのリンクは、以下のように設定できます：

```javascript
// 音楽プラットフォームのリンクを設定
const platformLinks = {
    'apple-music': 'https://music.apple.com/jp/artist/your-artist-id',
    'youtube-music': 'https://music.youtube.com/channel/your-channel-id',
    'amazon-music': 'https://music.amazon.co.jp/artists/your-artist-id',
    'spotify': 'https://open.spotify.com/artist/your-artist-id'
};
```

## 📞 サポート

問題が発生した場合は：
1. ブラウザのキャッシュをクリア
2. ページを再読み込み
3. コンソールでエラーを確認

---

**Note**: このバージョンはAPIキーが不要なので、すぐに使い始められます！
