import express from 'express';
import { getProfile } from '../controllers/profileController';
import { authenticate } from '../middlewares/authenticate';

const router = express.Router();

// プロフィール情報取得（要認証）
router.get('/', authenticate, getProfile);

export default router;