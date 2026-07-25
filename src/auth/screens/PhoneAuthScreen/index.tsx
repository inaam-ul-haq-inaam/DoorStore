import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { usePhoneAuthController } from './controller';

export const PhoneAuthScreen = () => {
  const {
    phonePart1, handlePart1Change,
    phonePart2, setPhonePart2, part2Ref,
    otp, handleOtpChange, handleOtpKeyPress, otpRefs,
    confirmResult,
    loading, error,
    handleSendOTP, handleVerifyOTP,
  } = usePhoneAuthController();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Top Curved Header */}
      <View style={styles.header}>
        {/* Decorative Background Elements */}
        <Icon name="basket" size={150} color="rgba(255,255,255,0.05)" style={styles.bgIconLeft} />
        <Icon name="leaf" size={120} color="rgba(255,255,255,0.05)" style={styles.bgIconRight} />

        {/* Branding */}
        <View style={styles.brandRow}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={{ width: 45, height: 45, resizeMode: 'contain', borderRadius: 8, marginRight: 10 }} 
          />
          <Text style={styles.brandName}>DoorStore</Text>
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{confirmResult ? 'Verify OTP' : 'Welcome to DoorStore'}</Text>
          <Text style={styles.headerSubtitle}>
            {confirmResult
              ? 'Enter the 6-digit verification code sent to your phone number'
              : 'Fresh groceries delivered right to your doorstep. Login to start shopping!'}
          </Text>
        </View>
      </View>

      {/* Floating Form Area */}
      <View style={styles.formContainer}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!confirmResult ? (
          /* ─── Phone Number Input ─── */
          <>
            <View style={styles.inputHeaderRow}>
              <View style={styles.iconCircle}>
                <Icon name="call" size={20} color={colors.primaryDark} />
              </View>
              <Text style={styles.label}>Phone Number</Text>
            </View>

            <View style={styles.phoneRow}>
              {/* +92 prefix (static) */}
              <View style={styles.prefixBox}>
                <Text style={styles.prefixText}>🇵🇰 +92</Text>
              </View>

              {/* 3-digit box (e.g. 300) */}
              <TextInput
                style={styles.phoneSegment3}
                value={phonePart1}
                onChangeText={handlePart1Change}
                keyboardType="number-pad"
                maxLength={3}
                placeholder="3 0 0"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.phoneDash}>-</Text>

              {/* 7-digit box (e.g. 1234567) */}
              <TextInput
                ref={part2Ref}
                style={styles.phoneSegment7}
                value={phonePart2}
                onChangeText={(t) => setPhonePart2(t.replace(/[^0-9]/g, '').slice(0, 7))}
                keyboardType="number-pad"
                maxLength={7}
                placeholder="1234567"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleSendOTP} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Send OTP</Text>}
            </TouchableOpacity>
          </>
        ) : (
          /* ─── OTP Input ─── */
          <>
            <View style={styles.inputHeaderRow}>
              <View style={styles.iconCircle}>
                <Icon name="keypad" size={20} color={colors.primaryDark} />
              </View>
              <Text style={styles.label}>Enter OTP Code</Text>
            </View>

            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { otpRefs.current[index] = ref; }}
                  style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  autoFocus={index === 0}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOTP} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Verify & Continue</Text>}
            </TouchableOpacity>
            
            <View style={styles.resendContainer}>
              <Icon name="chatbubble-ellipses-outline" size={16} color={colors.textMuted} />
              <Text style={styles.resendText}>Didn't receive code? <Text style={styles.resendLink}>Resend</Text></Text>
            </View>
          </>
        )}
      </View>

      <View style={{ flex: 1 }} />

      {/* Footer Terms */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our{'\n'}
          <Text style={styles.footerLink}>Terms of Service</Text> & <Text style={styles.footerLink}>Privacy Policy</Text>
        </Text>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: colors.primaryDark,
    height: 380,
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  bgIconLeft: {
    position: 'absolute',
    left: -30,
    top: 40,
    transform: [{ rotate: '-15deg' }]
  },
  bgIconRight: {
    position: 'absolute',
    right: -20,
    bottom: 80,
    transform: [{ rotate: '20deg' }]
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 35,
    alignSelf: 'center',
  },
  logoContainer: {
    backgroundColor: '#FFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  brandName: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    marginLeft: 12,
    letterSpacing: 1,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: { color: '#FFF', fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
  headerSubtitle: { color: '#E0E0E0', fontSize: 15, marginTop: 12, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  formContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: spacing.l,
    marginTop: -40,
    padding: spacing.xl,
    paddingVertical: 35,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  inputHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  errorText: { color: '#EF4444', marginBottom: 12, textAlign: 'center', fontSize: 13 },

  /* ── Phone Input ── */
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  prefixBox: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  prefixText: { fontSize: 16, fontWeight: 'bold', color: colors.primaryDark },
  phoneSegment3: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textMain,
    width: 65,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  phoneDash: { fontSize: 18, fontWeight: 'bold', color: colors.textMuted, marginHorizontal: 6 },
  phoneSegment7: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textMain,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    letterSpacing: 2,
  },

  /* ── OTP Input ── */
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    width: 42,
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textMain,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  otpBoxFilled: {
    borderColor: colors.primaryDark,
    backgroundColor: '#EBF4F0',
  },

  primaryButton: {
    backgroundColor: colors.primaryDark,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.textMuted,
  },
  resendLink: {
    color: colors.primaryDark,
    fontWeight: 'bold',
  },

  /* ── Footer ── */
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  footerLink: {
    color: colors.primaryDark,
    fontWeight: '600',
  }
});
