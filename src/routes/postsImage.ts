import express from 'express';
import multer from 'multer';
import { uploadPostImage } from '../controllers/postImageController';
import { authenticate } from '../middlewares/authenticate';

const router = express.Router();

// Multer のメモリストレージ＆サイズ制限
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post(
  '/', 
  authenticate,            // 認証
  upload.single('image'),  // 画像ファイルだけ受け取る
  uploadPostImage          // コントローラに委譲
);

export default router;
