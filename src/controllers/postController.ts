import { Request, Response } from 'express';
import { admin } from '../utils/firebase';

const db = admin.firestore();

export const createPost = async (req: Request, res: Response) => {
  if (!req.user || !req.user.uid) {
    return res.status(400).json({ error: 'Unauthorized' });
  }
  const user = (req as any).user;
  const { latitude, longitude, text } = req.body;
  const isValidLatitude = typeof latitude === 'number' && latitude >= -90 && latitude <= 90;
  const isValidLongitude = typeof longitude === 'number' && longitude >= -180 && longitude <= 180;
  const isValidText = typeof text === 'string' && text.length > 0 && text.length <= 200;

  if (!isValidLatitude || !isValidLongitude || !isValidText) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  const newPost = {
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    latitude,
    longitude,
    text,
    userId: user.uid,
  };
  const docRef = await db.collection('posts').add(newPost);
  res.status(201).json({ id: docRef.id, ...newPost });
};
