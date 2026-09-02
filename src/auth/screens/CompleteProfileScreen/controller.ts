import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { firebaseDb } from '../../../services/firebase';
import firestore from '@react-native-firebase/firestore';

export const useCompleteProfileController = () => {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, refreshProfile } = useAuth();

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      setError('Full Name is required');
      return;
    }
    if (!user) return;

    setLoading(true);
    setError('');
    try {
      await firebaseDb.collection('users').doc(user.uid).set({
        full_name: fullName,
        phone: user.phoneNumber,
        role: 'buyer',
        created_at: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      await refreshProfile();
    } catch (e: any) {
      setError(e.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return {
    fullName,
    setFullName,
    loading,
    error,
    handleSaveProfile,
  };
};
