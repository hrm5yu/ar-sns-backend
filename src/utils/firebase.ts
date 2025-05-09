import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
  const serviceAccount = process.env.SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.SERVICE_ACCOUNT_KEY as string)
    : null;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'arsns-dcb2c.firebasestorage.app',
    });
  }
}

const bucket = admin.storage().bucket();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

export { admin, bucket, db, FieldValue };