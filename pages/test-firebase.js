// Test Firebase connection
import { db } from './lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function TestFirebase() {
  const testConnection = async () => {
    try {
      console.log('Testing Firebase connection...');
      const querySnapshot = await getDocs(collection(db, 'polls'));
      console.log('✅ Firebase connected successfully!');
      console.log('Number of polls:', querySnapshot.size);
      querySnapshot.forEach((doc) => {
        console.log(doc.id, ' => ', doc.data());
      });
    } catch (error) {
      console.error('❌ Firebase connection error:', error.code, error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl mb-4">Firebase Connection Test</h1>
        <button
          onClick={testConnection}
          className="px-6 py-3 bg-blue-600 rounded-lg"
        >
          Test Connection
        </button>
        <p className="mt-4 text-gray-400">Check browser console (F12) for results</p>
      </div>
    </div>
  );
}
