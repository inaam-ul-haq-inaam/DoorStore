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
      // Build data without any undefined values — Firestore rejects
      // `undefined` with "Unsupported field value: undefined".
      // user.phoneNumber is null with email/password auth, so omit the
      // phone key entirely to avoid overwriting the phone saved at registration.
      const profileData: Record<string, unknown> = {
        full_name: fullName.trim(),
        role: 'buyer',
        created_at: firestore.FieldValue.serverTimestamp(),
      };
      if (user.phoneNumber) {
        profileData.phone = user.phoneNumber;
      }

      await firebaseDb.collection('users').doc(user.uid).set(profileData, { merge: true });

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
