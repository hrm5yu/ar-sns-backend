import { Request, Response } from 'express';
import { bucket, admin, FieldValue } from '../utils/firebase';

const db = admin.firestore();

export const uploadPostImage = async (req: Request, res: Response): Promise<any> => {
  const file = (req as any).file as Express.Multer.File | undefined;

  if (!req.user || !req.user.uid) {
    return res.status(400).json({ error: 'Unauthorized' });
  }
  const user = (req as any).user;
  const latitude = parseFloat(req.body.latitude);
  const longitude = parseFloat(req.body.longitude);
  const text = req.body.text;

  const isValidLatitude = !isNaN(latitude) && latitude >= -90 && latitude <= 90;
  const isValidLongitude = !isNaN(longitude) && longitude >= -180 && longitude <= 180;
  const isValidText = typeof text === 'string' && text.length > 0 && text.length <= 200;
  if (!isValidLatitude || !isValidLongitude || !isValidText) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const newPost: any = {
    userId: user.uid,
    latitude,
    longitude,
    text,
    createdAt: FieldValue.serverTimestamp(),
  };

  if (file) {
    const fileName = `${Date.now()}_${file.originalname}`;
    const fileObj = bucket.file(fileName);

    try {
      // Firebase Storageにファイルを保存
      await fileObj.save(file.buffer, {
        metadata: { contentType: file.mimetype },
      });

      // 画像のパブリックURLを直接構築
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      newPost.imageUrl = imageUrl;

      const docRef = await db.collection('posts').add(newPost);
      return res.status(201).json({ ...newPost });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: '画像アップロード失敗' });
    }
  } else {
    const docRef = await db.collection('posts').add(newPost);
    return res.status(201).json({ ...newPost });
  }
};
