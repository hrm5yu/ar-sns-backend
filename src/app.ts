import express, { Request, Response, NextFunction } from 'express';
import { db, admin, bucket } from './firebase';
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
const upload = multer({ storage: multer.memoryStorage() });

// エラーハンドリング用ミドルウェア
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// 認証トークンを検証するミドルウェア
const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: '認証トークンがありません' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // トークンが有効な場合、ユーザー情報をリクエストに追加
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ message: 'トークンの検証に失敗しました', error });
    return;
  }
};

// 認証が必要なAPI
app.get('/profile', authenticate, (req, res) => {
  const user = (req as any).user;
  res.json({ message: '認証成功', uid: user.uid, email: user.email });
});


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
    // ファイルパスを作成
    const fileName = `${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    // Firebase Storageにアップロード
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    
    stream.on('error', (err) => {
      console.error(err);
      res.status(500).json({ error: 'Error uploading file to storage' });
    });

    stream.on('finish', async () => {
      // アップロードが完了したら公開URLを生成
      try {
        await fileUpload.makePublic(); // アクセスを公開する（セキュリティポリシーに注意）
      } catch (error) {
        console.error('Failed to make file public:', error);
        res.status(500).json({ error: 'Failed to make file public' });
        return;
      } 
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      console.log("Using bucket:", bucket.name);

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
      imageUrl: publicUrl,
    };

    const docRef = await db.collection('posts').add(newPost);
    res.status(201).json({ id: docRef.id, ...newPost });
  })
  stream.end(file.buffer);
})
);

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
