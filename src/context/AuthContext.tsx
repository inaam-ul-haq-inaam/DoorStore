import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { firebaseAuth, firebaseDb } from '../services/firebase';

interface UserProfile {
  full_name?: string;
  phone?: string;
  role?: string;
}

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userProfile: null, 
  loading: true, 
  refreshProfile: async () => {} 
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const doc = await firebaseDb.collection('users').doc(uid).get();
      if (doc.exists()) {
        setUserProfile(doc.data() as UserProfile);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUserProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
