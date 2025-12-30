// Quick script to check if polls have the required fields
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkPolls() {
  const snapshot = await db.collection('polls').get();
  console.log('Total polls:', snapshot.size);
  
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`\nPoll: ${data.question}`);
    console.log('- Type:', data.type);
    console.log('- Duration:', data.duration);
    console.log('- StartTime:', data.startTime);
    console.log('- IsActive:', data.isActive);
  });
}

checkPolls().then(() => process.exit(0));
