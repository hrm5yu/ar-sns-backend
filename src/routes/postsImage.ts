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
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err: any = new Error('Only image files are allowed');
      err.status = 400;
      cb(err);  
    }
  },
});

router.post('/', authenticate, upload.single('file'), asyncHandler(uploadPostImage));

export default router;
