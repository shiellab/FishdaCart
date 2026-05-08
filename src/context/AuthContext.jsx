import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, firestore } from '../services/firebaseConfig';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { syncUserToBackend } from '../services/firestoreService';
import { GOOGLE_WEB_CLIENT_ID } from '../config/appConfig';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

export const AuthContext = createContext({
  user: null,
  login: () => {},
  googleLogin: () => {},
  register: () => {},
  logout: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const buildUserState = (firebaseUser, extra = {}) => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    phoneNumber: firebaseUser.phoneNumber,
    metadata: firebaseUser.metadata,
    ...extra,
  });

  // Keep Firebase Auth and the Firestore profile in sync in real time.
  useEffect(() => {
    let unsubscribeProfile = null;

    const stopProfileListener = () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }
    };

    const syncBackendProfile = async (firebaseUser, profile = {}) => {
      try {
        return await syncUserToBackend({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: profile?.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          role: profile?.role || 'Customer'
        });
      } catch (syncError) {
        console.warn('Backend user sync warning:', syncError?.message || syncError);
      }
    };

    const unsubscribeAuth = auth().onAuthStateChanged(async (firebaseUser) => {
      stopProfileListener();

      if (firebaseUser) {
        setUser(buildUserState(firebaseUser, { role: 'Customer' }));
        const initialSync = await syncBackendProfile(firebaseUser, { role: 'Customer' });
        if (initialSync?.user?.role) {
          setUser(buildUserState(firebaseUser, { role: initialSync.user.role }));
        }

        unsubscribeProfile = firestore()
          .collection('users')
          .doc(firebaseUser.uid)
          .onSnapshot(
            async (userDoc) => {
              const profile = userDoc.exists ? userDoc.data() : { role: 'Customer' };
              const syncedProfile = await syncBackendProfile(firebaseUser, profile);
              const backendRole = syncedProfile?.user?.role;
              setUser(buildUserState(firebaseUser, {
                ...profile,
                role: backendRole || profile?.role || 'Customer',
              }));
            },
            (error) => {
              console.error("Error listening to user profile:", error);
              setUser(buildUserState(firebaseUser, { role: 'Customer' }));
            },
          );
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      stopProfileListener();
      unsubscribeAuth();
    };
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
       console.error(error);
       setIsLoading(false);
       throw error;
    }
  };

  const googleLogin = async () => {
    setIsLoading(true);
    try {
      if (!GOOGLE_WEB_CLIENT_ID || GOOGLE_WEB_CLIENT_ID.includes('YOUR_WEB_CLIENT_ID')) {
        throw new Error('Google Sign-In is not configured yet. Add your real Web Client ID in AuthContext.');
      }
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const { user: firebaseUser } = userCredential;
      
      // Sync user to Laravel backend
      try {
        await syncUserToBackend({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          role: 'Customer'
        });
      } catch (syncError) {
        console.warn('Backend sync warning:', syncError?.message || syncError);
      }
      
      return userCredential;
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (email, password, role = 'Customer') => {
    setIsLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const { user: firebaseUser } = userCredential;
      
      // Create Firestore document with role
      await firestore().collection('users').doc(firebaseUser.uid).set({
        email,
        role,
        createdAt: firestore.FieldValue.serverTimestamp()
      });
      
      // Sync user to Laravel backend
      try {
        await syncUserToBackend({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || email.split('@')[0],
          role: role
        });
      } catch (syncError) {
        console.warn('Backend sync warning:', syncError?.message || syncError);
        // Don't throw - registration succeeded even if sync fails
      }
    } catch (error) {
       console.error(error);
       setIsLoading(false);
       throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await auth().signOut();
      }
      // Navigate to login regardless
      navigation.navigate('Login');
    } catch(error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
