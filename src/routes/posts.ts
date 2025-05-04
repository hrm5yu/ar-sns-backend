import express from 'express';
import { createPost } from '../controllers/postController';
import { authenticate } from '../middlewares/authenticate';
import { asyncHandler } from '../middlewares/asyncHandlers';

const router = express.Router();

// 投稿作成（要認証）
router.post('/', authenticate, asyncHandler(createPost));

export default router;