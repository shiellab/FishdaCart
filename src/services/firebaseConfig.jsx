import app from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Note: React Native Firebase automatically picks up settings 
// from GoogleService-Info.plist and google-services.json.
// Ensure those exist in their respective ios/ and android/app/ folders.

export { auth, firestore };
export default app;
