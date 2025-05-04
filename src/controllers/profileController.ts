import { Request, Response } from 'express';
import { admin } from '../utils/firebase';

export const getProfile = async (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const userRecord = await admin.auth().getUser(user.uid);
    res.status(200).json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    });
  } catch (error) {
    res.status(500).json({ error: 'プロフィール取得に失敗しました', detail: error });
  }
};
