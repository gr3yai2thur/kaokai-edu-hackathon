// Script to set a user as admin in Firestore
// Usage: node scripts/set-admin.js <uid>
//
// To get UID: Firebase Console → Authentication → Users → copy UID

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDZy3Wv56hctnWuKxnA9idzs2bHaKRKxsE",
  authDomain: "kaokai-edu-hackathon.firebaseapp.com",
  projectId: "kaokai-edu-hackathon",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const uid = process.argv[2];
if (!uid) { console.error('Usage: node scripts/set-admin.js <uid>'); process.exit(1); }

await setDoc(doc(db, 'users', uid), { role: 'admin' }, { merge: true });
console.log(`✓ Set ${uid} as admin`);
process.exit(0);
