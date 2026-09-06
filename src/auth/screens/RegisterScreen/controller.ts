import { useState } from 'react';
import auth from '@react-native-firebase/auth';
import { firebaseDb } from '../../../services/firebase';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../../context/AuthContext';

export type PhoneStatus = 'idle' | 'checking' | 'registered' | 'available';

export const useRegisterController = () => {
  const { refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phonePart1, setPhonePart1] = useState('');
  const [phonePart2, setPhonePart2] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneStatus, setPhoneStatus] = useState<PhoneStatus>('idle');

  const checkPhoneRegistered = async (fullNumber: string) => {
    try {
      const snapshot = await firebaseDb
        .collection('users')
        .where('phone', '==', fullNumber)
        .limit(1)
        .get();
      setPhoneStatus(snapshot.empty ? 'available' : 'registered');
    } catch (e) {
      console.log('Phone check error:', e);
      setPhoneStatus('idle');
    }
  };

  const handlePart1Change = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 3);
    setPhonePart1(cleaned);
    setPhoneStatus('idle');
  };

  const handlePart2Change = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 7);
    setPhonePart2(cleaned);

    if (cleaned.length === 7 && phonePart1.length === 3) {
      const fullNumber = `+92${phonePart1}${cleaned}`;
      setPhoneStatus('checking');
      checkPhoneRegistered(fullNumber);
    } else {
      setPhoneStatus('idle');
    }
  };

  const isFormValid =
    fullName.trim().length > 0 &&
    phonePart1.length === 3 &&
    phonePart2.length === 7 &&
    password.length >= 6 &&
    confirmPassword.length >= 6;

  const handleRegister = async () => {
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (phonePart1.length < 3 || phonePart2.length < 7) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullNumber = `+92${phonePart1}${phonePart2}`;
      const email = `${fullNumber}@doorstore-app.com`;

      // Create Firebase Auth user
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);

      // Save profile to Firestore
      await firebaseDb.collection('users').doc(userCredential.user.uid).set({
        full_name: fullName.trim(),
        phone: fullNumber,
        role: 'buyer',
        created_at: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      // Firebase auto-logs-in the new user; refresh profile so the
      // app lands straight on Home instead of the CompleteProfile/Login screen
      await refreshProfile();
    } catch (e: any) {
      console.log('REGISTER ERROR:', e.code, e.message);

      if (e.code === 'auth/email-already-in-use') {
        setError('This phone number is already registered. Please login instead.');
      } else if (e.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (e.code === 'auth/invalid-email') {
        setError('Invalid phone number format.');
      } else if (e.code === 'auth/network-request-failed') {
        setError('No internet connection. Please check your network.');
      } else {
        setError(e.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    fullName, setFullName,
    phonePart1, handlePart1Change,
    phonePart2, handlePart2Change,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    loading, error,
    phoneStatus,
    isFormValid, handleRegister,
  };
};
