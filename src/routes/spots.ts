import express from 'express';
import { createSpot, getAllSpots } from '../controllers/spotController'
import { authenticate } from '../middlewares/authenticate';
import { asyncHandler } from '../middlewares/asyncHandlers';

const router = express.Router();

// 投稿一覧取得
router.get('/', getAllSpots)

// スポット作成（要認証）
router.post('/', authenticate, asyncHandler(createSpot));

export default router;