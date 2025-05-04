import express from 'express';
import multer from 'multer';
import { uploadPostImage } from '../controllers/postImageController';
import { authenticate } from '../middlewares/authenticate';
import { asyncHandler } from '../middlewares/asyncHandlers';

const router = express.Router();

// Multer のメモリストレージ＆サイズ制限
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post('/', authenticate, upload.single('image'), asyncHandler(uploadPostImage));

export default router;
