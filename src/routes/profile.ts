import express from 'express';
import { getProfile } from '../controllers/profileController';
import { authenticate } from '../middlewares/authenticate';
import { asyncHandler } from '../middlewares/asyncHandlers';

const router = express.Router();

// プロフィール情報取得（要認証）
router.get('/', authenticate, asyncHandler(getProfile));

export default router;