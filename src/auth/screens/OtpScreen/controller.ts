import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { AuthStackParamList } from '../../../navigation/types';

type OtpRouteProp = RouteProp<AuthStackParamList, 'Otp'>;
type OtpNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Otp'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

/** Firebase phone-auth errors (send/resend stage) → friendly UI messages. */
const sendErrorMessage = (e: any): string => {
  switch (e?.code) {
    case 'auth/invalid-phone-number':
    case 'auth/missing-phone-number':
      return 'Please enter a valid phone number.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a while and try again.';
    case 'auth/quota-exceeded':
      return 'Daily SMS limit reached. Please try again later.';
    case 'auth/captcha-check-failed':
      return 'Verification failed. Please try again.';
    case 'auth/operation-not-allowed':
      return 'Phone login is not enabled yet. Please contact support.';
    case 'auth/network-request-failed':
      return 'No internet connection. Please check your network.';
    default:
      // Google Cloud billing disabled ho to SDK message me "billing" aata hai
      // (REST par BILLING_NOT_ENABLED) — user ko password login ka rasta dikhayein.
      if (String(e?.message || '').toLowerCase().includes('billing')) {
        return 'SMS login is temporarily unavailable. Please login with your password.';
      }
      return 'Could not send the code. Please try again.';
  }
};

/** Firebase phone-auth errors (confirm stage) → friendly UI messages. */
const verifyErrorMessage = (e: any): string => {
  switch (e?.code) {
    case 'auth/invalid-verification-code':
    case 'auth/missing-verification-code':
      return 'Invalid OTP. Please check the code and try again.';
    case 'auth/code-expired':
    case 'auth/session-expired':
      return 'This OTP has expired. Please resend the code.';
    case 'auth/invalid-verification-id':
    case 'auth/missing-verification-id':
      return 'Verification session expired. Please resend the code.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a while and try again.';
    case 'auth/network-request-failed':
      return 'No internet connection. Please check your network.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    default:
      if (String(e?.message || '').toLowerCase().includes('billing')) {
        return 'SMS login is temporarily unavailable. Please login with your password.';
      }
      return 'Verification failed. Please try again.';
  }
};

/**
 * OTP Verification Screen (auto-login).
 *
 * - 6th digit lagte hi `confirmation.confirm(code)` khud chalta hai — koi
 *   Verify button nahi (spec).
 * - Success par yahan se koi manual navigate NAHI karta: AuthContext ka
 *   onAuthStateChanged profile load karta hai aur AppNavigator khud
 *   Main App / AdminApp (ya naye user ke liye CompleteProfile) par switch
 *   kar deta hai.
 * - Android auto-read: agar Play Services SMS khud read kar ke background
 *   me sign-in kar le, to wahi AuthContext navigation OTP screen ko unmount
 *   kar ke app khol deti hai — confirm() dobara call karna zaroori nahi.
 * - Resend Code button 60s timer ke saath.
 */

export const useOtpController = () => {
  const navigation = useNavigation<OtpNavigationProp>();
  const route = useRoute<OtpRouteProp>();
  const { phone } = route.params;

  // Login screen se aaya hua confirmation object; resend par replace hota hai.
  const [confirmation, setConfirmation] = useState<FirebaseAuthTypes.ConfirmationResult>(
    route.params.confirmation,
  );
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');
  const [error, setError] = useState('');
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const verifyingRef = useRef(false);

  // Resend countdown — har second ek tick
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const verifyCode = useCallback(
    async (entered: string) => {
      if (verifyingRef.current) return;
      verifyingRef.current = true;
      setStatus('verifying');
      setError('');
      try {
        await confirmation.confirm(entered);
        // Success → AuthContext/AppNavigator khud Main App par le jayega.
        setStatus('verified');
      } catch (e: any) {
        console.log('OTP VERIFY ERROR:', e?.code, e?.message);
        setError(verifyErrorMessage(e));
        setCode('');
        setStatus('idle');
        verifyingRef.current = false;
      }
    },
    [confirmation],
  );

  const handleCodeChange = useCallback(
    (text: string) => {
      if (status === 'verifying' || status === 'verified') return;
      const digits = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
      setCode(digits);
      if (error) setError('');

      // Auto-login: 6th digit lagte hi turant verify (button ki zaroorat nahi).
      if (digits.length === OTP_LENGTH) {
        verifyCode(digits);
      }
    },
    [verifyCode, error, status],
  );

  const handleResend = useCallback(async () => {
    if (resendIn > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      const next = await auth().signInWithPhoneNumber(phone);
      setConfirmation(next);
      setCode('');
      setStatus('idle');
      verifyingRef.current = false;
      setResendIn(RESEND_SECONDS);
    } catch (e: any) {
      console.log('RESEND OTP ERROR:', e?.code, e?.message);
      setError(sendErrorMessage(e));
    } finally {
      setResending(false);
    }
  }, [phone, resendIn, resending]);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  return {
    phone,
    code,
    handleCodeChange,
    error,
    status,
    verifying: status === 'verifying',
    verified: status === 'verified',
    resendIn,
    resending,
    handleResend,
    handleBack,
  };
};
