import { Request, Response } from 'express';
import { bucket, admin } from '../utils/firebase';

const db = admin.firestore();

export const uploadPostImage = async (req: Request, res: Response): Promise<any> => {
  const file = (req as any).file as Express.Multer.File;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const user = (req as any).user;    // authenticate でセット済み
  if (!req.user || !req.user.uid) {
    return res.status(400).json({ error: 'Unauthorized' });
  }
  const { latitude, longitude, text } = req.body;
  const isValidLatitude = typeof latitude === 'number' && latitude >= -90 && latitude <= 90;
  const isValidLongitude = typeof longitude === 'number' && longitude >= -180 && longitude <= 180;
  const isValidText = typeof text === 'string' && text.length > 0 && text.length <= 200;
  
  if (!isValidLatitude || !isValidLongitude || !isValidText) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  // 1) Firebase Storage にアップロード
  const fileName = `${Date.now()}_${file.originalname}`;
  const fileObj = bucket.file(fileName);
  const stream = fileObj.createWriteStream({
    metadata: { contentType: file.mimetype }
    });
  stream.end(file.buffer);
  stream.on('error', (err) => {
    console.error(err);
    return res.status(500).json({ error: '画像アップロード失敗' });
  });
  stream.on('finish', async () => {
    try {
      await fileObj.makePublic();
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      // 2) Firestore に投稿ドキュメントを作成
      const newPost = {
        userId: user.uid,
        latitude,
        longitude,
        text,
        imageUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      const docRef = await db.collection('posts').add(newPost);
      return res.status(201).json({ id: docRef.id, ...newPost });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: '投稿作成失敗' });
    }
  });
};
