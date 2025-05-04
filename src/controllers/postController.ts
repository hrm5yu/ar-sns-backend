import { Request, Response } from 'express';
import { admin } from '../utils/firebase';

const db = admin.firestore();

export const createPost = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { latitude, longitude, text } = req.body;

  if (!latitude || !longitude || !text) {
    res.status(400).json({ error: '全ての項目を入力してください' });
    return;
  }
  const newPost = {
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    text,
    userId: user.uid,
  };
  const docRef = await db.collection('posts').add(newPost);
  res.status(201).json({ id: docRef.id, ...newPost });
};
