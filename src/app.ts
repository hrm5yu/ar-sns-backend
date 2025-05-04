import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import postRoutes from './routes/posts';
import profileRoutes from './routes/profile';
import imageRoutes from './routes/postsImage';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// ─── ミドルウェア ────────────────────────────
app.use(cors());                                 // CORS対応
app.use(bodyParser.json());                      // JSONボディのパース
app.use(bodyParser.urlencoded({ extended: true })); // URLエンコードされたボディのパース

// ─── ルーティング ────────────────────────────
// 投稿関連（テキスト投稿）
app.use('/posts', postRoutes);

// プロフィール取得
app.use('/profile', profileRoutes);

// 画像付き投稿
app.use('/posts-image', imageRoutes);

// ─── エラーハンドリング ───────────────────────
app.use(errorHandler);

export default app;
