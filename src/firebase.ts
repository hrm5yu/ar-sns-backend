import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY as string);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'arsns-dcb2c.firebasestorage.app',    
});


const bucket = admin.storage().bucket();



export { admin, bucket };

export const db = admin.firestore();
