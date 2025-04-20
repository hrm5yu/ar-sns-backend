const express = require('express');
const { db,admin } = require('./firebase');
const bodyParser = require('body-parser');

const app = express();

// ミドルウェアの設定
app.use(bodyParser.json()); // JSONのリクエストを処理

// 新しい投稿をFirestoreの"posts"コレクションに追加するエンドポイント
app.post('/posts', async (req, res) => {
  const {latitude, longitude,  text, userId } = req.body;

  // 投稿が必要なフィールドを含んでいるか確認
  if ( !latitude || !longitude || !text || !userId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const createdAt = admin.firestore.FieldValue.serverTimestamp();

  // 新しい投稿のデータ
  const newPost = {
    createdAt,
    latitude,
    longitude,
    text,
    userId
  };

  try {
    // "posts" コレクションに新しい投稿を追加
    const docRef = await db.collection('posts').add(newPost);
    res.status(201).json({
      id: docRef.id,
      ...newPost
    });
  } catch (error) {
    res.status(500).json({ error: 'Error adding post: ' + error.message });
  }
});

// サーバーを起動
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
