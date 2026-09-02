import { useState } from 'react';
import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';

export const useLoginController = () => {
  const [phonePart1, setPhonePart1] = useState('');
  const [phonePart2, setPhonePart2] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const isFormValid = phonePart1.length === 3 && phonePart2.length === 7 && password.length >= 6;

  const handleLogin = async () => {
    if (phonePart1.length < 3 || phonePart2.length < 7) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullNumber = `+92${phonePart1}${phonePart2}`;
      const email = `${fullNumber}@doorstore-app.com`;

      await auth().signInWithEmailAndPassword(email, password);
    } catch (e: any) {
      console.log('LOGIN ERROR:', e.code, e.message);

      if (e.code === 'auth/user-not-found') {
        setError('No account found with this phone number. Please register first.');
      } else if (e.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (e.code === 'auth/invalid-email') {
        setError('Invalid phone number format.');
      } else if (e.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (e.code === 'auth/network-request-failed') {
        setError('No internet connection. Please check your network.');
      } else {
        setError(e.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    phonePart1,
    handlePart1Change,
    phonePart2,
    handlePart2Change,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    error,
    isFormValid,
    handleLogin,
  };
};
