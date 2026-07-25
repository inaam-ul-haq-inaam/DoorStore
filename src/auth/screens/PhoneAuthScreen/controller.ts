import { useState, useRef, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { TextInput } from 'react-native';

export const usePhoneAuthController = () => {
  // Phone input split: [3-digit] [7-digit]
  const [phonePart1, setPhonePart1] = useState(''); // e.g. 300
  const [phonePart2, setPhonePart2] = useState(''); // e.g. 1234567

  // OTP input: 6 individual boxes
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const [confirmResult, setConfirmResult] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs for OTP boxes to move focus automatically
  const otpRefs = useRef<(TextInput | null)[]>([]);
  // Ref for part2 of phone
  const part2Ref = useRef<TextInput | null>(null);

  // Disable app verification (reCAPTCHA) during development/testing
  // This prevents the silent hang/timeout when SHA-1 keys are missing or testing on an emulator
  useEffect(() => {
    if (__DEV__) {
      auth().settings.appVerificationDisabledForTesting = true;
    }
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    // Auto-move focus forward
    if (cleaned && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePart1Change = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 3);
    setPhonePart1(cleaned);
    if (cleaned.length === 3) {
      part2Ref.current?.focus();
    }
  };

  const handleSendOTP = async () => {
    if (phonePart1.length < 3 || phonePart2.length < 7) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fullNumber = `+92${phonePart1}${phonePart2}`;
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 20000)
      );

      const confirmation = await Promise.race([
        auth().signInWithPhoneNumber(fullNumber),
        timeoutPromise
      ]);
      
      setConfirmResult(confirmation as FirebaseAuthTypes.ConfirmationResult);
    } catch (e: any) {
      if (e.message === 'timeout' || e.code === 'auth/network-request-failed') {
        setError('No internet connection. Please check your network and try again.');
      } else {
        setError('Failed to send OTP. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6 || !confirmResult) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 20000)
      );

      await Promise.race([
        confirmResult.confirm(otpCode),
        timeoutPromise
      ]);
    } catch (e: any) {
      if (e.message === 'timeout' || e.code === 'auth/network-request-failed') {
        setError('No internet connection. Please check your network.');
      } else {
        setError('Invalid code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    phonePart1, handlePart1Change,
    phonePart2, setPhonePart2, part2Ref,
    otp, handleOtpChange, handleOtpKeyPress, otpRefs,
    confirmResult,
    loading,
    error,
    handleSendOTP,
    handleVerifyOTP,
  };
};
