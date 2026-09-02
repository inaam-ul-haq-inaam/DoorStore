import { useState } from 'react';
import auth from '@react-native-firebase/auth';
import { firebaseDb } from '../../../services/firebase';
import firestore from '@react-native-firebase/firestore';

export const useRegisterController = () => {
  const [fullName, setFullName] = useState('');
  const [phonePart1, setPhonePart1] = useState('');
  const [phonePart2, setPhonePart2] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePart1Change = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 3);
    setPhonePart1(cleaned);
  };

  const handlePart2Change = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 7);
    setPhonePart2(cleaned);
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

      // Firebase will automatically sign in the user after registration
      // AuthContext onAuthStateChanged will pick up the new user
    } catch (e: any) {
      console.log('REGISTER ERROR:', e.code, e.message);

      if (e.code === 'auth/email-already-in-use') {
        setError('An account with this phone number already exists. Please login.');
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
    isFormValid, handleRegister,
  };
};
