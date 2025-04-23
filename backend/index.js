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

  // 新しい投稿のデータ
  const newPost = {
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
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

app.post("/spots", async (req, res) => {
    const {name, latitude, longitude, tags, isActive, description} = req.body;

    if ( !name || !latitude || !longitude || !tags || !isActive || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const newSpot = {
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      name,
      latitude,
      longitude,
      tags,
      isActive,
      description
    }
    try {
      const docRef = await db.collection('spots').add(newSpot);
      res.status(201).json({
        id: docRef.id,
        ...newSpot
      });
    } catch (error) {
      res.status(500).json({ error: 'Error adding spot: ' + error.message });
    }
});

app.get("/spots", async (req,res) => {
  try {
    const snapshot = await db.collection('spots').get();

    const spots = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(spots);
  }catch(error){
    res.status(500).json({error: 'Error fetching spots: ' + error.message});
  }
});

// サーバーを起動
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
