import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY as string);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


export { admin };

export const db = admin.firestore();
