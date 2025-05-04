import { Request, Response } from 'express';
import { admin } from '../utils/firebase';

const db = admin.firestore();

export const createSpot = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { name, latitude, longitude, tags, isActive, description } = req.body;

    if (!name || latitude == null || longitude == null || !tags || isActive == null || !description) {
    res.status(400).json({ error: '全ての項目を入力してください' });
    return;
    }
    const newSpot = {
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    name,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    tags,
    isActive,
    description,
    };
    const docRef = await db.collection('spots').add(newSpot);
    res.status(201).json({ id: docRef.id, ...newSpot });
};

export const getAllSpots = async(req: Request, res: Response) => {
    const snapshot = await db.collection('spots').get();
    const spots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(spots);
};
  