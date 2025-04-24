import express, { Request, Response, NextFunction } from 'express';
import { db, admin } from './firebase';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// MulterRequest 型定義
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const app = express();
app.use(bodyParser.json());

// アップロード保存先ディレクトリ
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multerの設定
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (err: Error | null, dest: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (err: Error | null, name: string) => void) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// エラーハンドリング用ミドルウェア
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// 画像投稿用エンドポイント
app.post(
  '/posts-image',
  upload.single('image'),
  asyncHandler(async (req: MulterRequest, res: Response) => {
    const file = req.file;
    if (!file) {
      res.status(400).send('No file uploaded.');
      return;
    }
    const imageUrl = `/uploads/${file.filename}`;

    const { latitude, longitude, text, userId } = req.body;
    if (!latitude || !longitude || !text || !userId) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const newPost = {
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      text,
      userId,
      imageUrl,
    };

    const docRef = await db.collection('posts').add(newPost);
    res.status(201).json({ id: docRef.id, ...newPost });
  })
);

// 静的ファイル提供（画像を参照できるように）
app.use('/uploads', express.static(uploadDir));

// テキスト投稿エンドポイント
app.post(
  '/posts',
  asyncHandler(async (req: Request, res: Response) => {
    const { latitude, longitude, text, userId } = req.body;

    if (!latitude || !longitude || !text || !userId) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const newPost = {
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      text,
      userId,
    };

    const docRef = await db.collection('posts').add(newPost);
    res.status(201).json({ id: docRef.id, ...newPost });
  })
);

// スポット作成エンドポイント
app.post(
  '/spots',
  asyncHandler(async (req: Request, res: Response) => {
    const { name, latitude, longitude, tags, isActive, description } = req.body;

    if (!name || latitude == null || longitude == null || !tags || isActive == null || !description) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const newSpot = {
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      tags,
      isActive,
      description,
    };

    const docRef = await db.collection('spots').add(newSpot);
    res.status(201).json({ id: docRef.id, ...newSpot });
  })
);

// スポット一覧取得エンドポイント
app.get(
  '/spots',
  asyncHandler(async (_req: Request, res: Response) => {
    const snapshot = await db.collection('spots').get();
    const spots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(spots);
  })
);

// エラー処理ミドルウェア
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// サーバー起動
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
