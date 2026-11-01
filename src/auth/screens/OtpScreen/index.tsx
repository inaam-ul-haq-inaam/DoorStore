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
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { useOtpController } from './controller';

export const OtpScreen = () => {
  const {
    phone,
    code,
    handleCodeChange,
    error,
    verifying,
    verified,
    resendIn,
    resending,
    handleResend,
    handleBack,
  } = useOtpController();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Icon
            name="shield-checkmark"
            size={130}
            color="rgba(255,255,255,0.06)"
            style={styles.bgIcon}
          />

          <TouchableOpacity style={styles.backRow} onPress={handleBack}>
            <Icon name="chevron-back" size={22} color="#FFF" />
            <Text style={styles.backText}>Change number</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Verify OTP</Text>
          <Text style={styles.headerSubtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.phoneText}>{phone}</Text>
          </Text>
        </View>

        <View style={styles.card}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Enter Code</Text>
          <TextInput
            style={styles.otpInput}
            value={code}
            onChangeText={handleCodeChange}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            placeholder="••••••"
            placeholderTextColor={colors.textMuted}
            // Android: SMS autofill/auto-read suggestions; iOS: QuickType one-time-code
            autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
            textContentType="oneTimeCode"
            importantForAutofill="yes"
          />

          <Text style={styles.hint}>
            If your SMS code auto-fills, just tap it — verification happens automatically as
            soon as the 6th digit is entered.
          </Text>

          {verifying && (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color={colors.primaryDark} />
              <Text style={styles.statusText}>Verifying…</Text>
            </View>
          )}

          {verified && (
            <View style={[styles.statusRow, styles.statusSuccess]}>
              <Icon name="checkmark-circle" size={20} color="#047857" />
              <Text style={styles.statusSuccessText}>Verified! Opening the app…</Text>
            </View>
          )}

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't get the code?</Text>
            {resendIn > 0 ? (
              <Text style={styles.resendTimer}>
                Resend in 0:{String(Math.max(resendIn, 0)).padStart(2, '0')}
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                style={styles.resendButton}
              >
                {resending ? (
                  <ActivityIndicator size="small" color={colors.primaryDark} />
                ) : (
                  <Text style={styles.resendButtonText}>Resend Code</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            OTP verify hote hi app khud open ho jayega — no need to press anything.
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
    paddingTop: 60,
    paddingBottom: 46,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  bgIcon: {
    position: 'absolute',
    right: -20,
    top: 30,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#E0E0E0',
    fontSize: 15,
    marginTop: 10,
    lineHeight: 24,
  },
  phoneText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 24,
    marginTop: -26,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 14,
    textAlign: 'center',
    fontSize: 13,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 12,
  },
  otpInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 12,
    color: colors.textMain,
  },
  hint: {
    fontSize: 12.5,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 12,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  statusSuccess: {
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    paddingVertical: 10,
  },
  statusSuccessText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  resendLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginRight: 8,
  },
  resendTimer: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  resendButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
    textDecorationLine: 'underline',
  },
  footer: {
    paddingVertical: 26,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12.5,
    lineHeight: 18,
  },
});
