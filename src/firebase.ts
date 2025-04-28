import * as admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY as string);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
