import express, { Request, Response, NextFunction } from 'express';
import { db, admin } from './firebase';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

// エラーハンドリング用ミドルウェア
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// 投稿を作成するエンドポイント
app.post('/posts', asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude, text, userId } = req.body;

  if (!latitude || !longitude || !text || !userId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newPost = {
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    latitude,
    longitude,
    text,
    userId
  };

  const docRef = await db.collection('posts').add(newPost);
  res.status(201).json({ id: docRef.id, ...newPost });
}));

// スポットを作成するエンドポイント
app.post('/spots', asyncHandler(async (req: Request, res: Response) => {
  const { name, latitude, longitude, tags, isActive, description } = req.body;

  if (!name || !latitude || !longitude || !tags || !isActive || !description) {
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
  };

  const docRef = await db.collection('spots').add(newSpot);
  res.status(201).json({ id: docRef.id, ...newSpot });
}));

// スポット一覧取得
app.get('/spots', asyncHandler(async (_req: Request, res: Response) => {
  const snapshot = await db.collection('spots').get();
  const spots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.status(200).json(spots);
}));

// エラー処理ミドルウェア（最後に配置）
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// サーバー起動
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
