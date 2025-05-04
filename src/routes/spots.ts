import express from 'express';
import { createSpot, getAllSpots } from '../controllers/spotController'
import { authenticate } from '../middlewares/authenticate';

const router = express.Router();

// 投稿一覧取得
router.get('/', getAllSpots)

// スポット作成（要認証）
router.post('/', authenticate, createSpot);

export default router;