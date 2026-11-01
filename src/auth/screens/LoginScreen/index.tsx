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
import { useLoginController } from './controller';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types';
import { useNavigation } from '@react-navigation/native';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const {
    phonePart1, handlePart1Change,
    phonePart2, handlePart2Change,
    password, setPassword,
    showPassword, setShowPassword,
    loading, error,
    phoneStatus,
    isFormValid, handleLogin,
  } = useLoginController();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Icon name="basket" size={150} color="rgba(255,255,255,0.05)" style={styles.bgIconLeft} />
          <Icon name="leaf" size={120} color="rgba(255,255,255,0.05)" style={styles.bgIconRight} />

          <View style={styles.brandRow}>
            <Image
              source={require('../../../assets/logo.png')}
              style={{ width: 45, height: 45, resizeMode: 'contain', borderRadius: 8, marginRight: 10 }}
            />
            <Text style={styles.brandName}>DoorStore</Text>
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Welcome Back!</Text>
            <Text style={styles.headerSubtitle}>
              Sign in to continue shopping. Fresh groceries delivered right to your doorstep.
            </Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Phone Number */}
          <View style={styles.inputHeaderRow}>
            <View style={styles.iconCircle}>
              <Icon name="call" size={20} color={colors.primaryDark} />
            </View>
            <Text style={styles.label}>Phone Number</Text>
          </View>

          <View style={styles.phoneRow}>
            <View style={styles.prefixBox}>
              <Text style={styles.prefixText}>🇵🇰 +92</Text>
            </View>

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

            <TextInput
              style={styles.phoneSegment7}
              value={phonePart2}
              onChangeText={handlePart2Change}
              keyboardType="number-pad"
              maxLength={7}
              placeholder="1234567"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Phone status message */}
          {phoneStatus === 'checking' && (
            <View style={[styles.statusBox, styles.statusInfo]}>
              <ActivityIndicator size="small" color={colors.primaryDark} style={{ marginRight: 8 }} />
              <Text style={styles.statusInfoText}>Checking number...</Text>
            </View>
          )}

          {phoneStatus === 'not_found' && (
            <View style={[styles.statusBox, styles.statusWarning]}>
              <Icon name="alert-circle" size={18} color="#B45309" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.statusWarningText}>
                  This phone number is not registered yet.
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.statusWarningLink}>Create an account now →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {phoneStatus === 'registered' && (
            <View style={[styles.statusBox, styles.statusSuccess]}>
              <Icon name="checkmark-circle" size={18} color="#047857" style={{ marginRight: 8 }} />
              <Text style={styles.statusSuccessText}>
                Number found! Enter your password to continue.
              </Text>
            </View>
          )}

          {/* Password */}
          <View style={styles.inputHeaderRow}>
            <View style={styles.iconCircle}>
              <Icon name="lock-closed" size={20} color={colors.primaryDark} />
            </View>
            <Text style={styles.label}>Password</Text>
          </View>

          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={22}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.primaryButton, !isFormValid && styles.primaryButtonDisabled]}
            onPress={handleLogin}
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: colors.primaryDark,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: spacing.l,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    position: 'relative',
    overflow: 'hidden',
  },
  bgIconLeft: {
    position: 'absolute',
    top: -20,
    left: -30,
  },
  bgIconRight: {
    position: 'absolute',
    bottom: -30,
    right: -20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  headerTextContainer: {
    marginTop: spacing.xs,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  formContainer: {
    paddingHorizontal: spacing.l,
    marginTop: -20,
    backgroundColor: '#FFF',
    marginHorizontal: spacing.m,
    borderRadius: 24,
    paddingVertical: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  errorText: {
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  inputHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  prefixBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginRight: 8,
  },
  prefixText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
  },
  phoneSegment3: {
    flex: 1.2,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    textAlign: 'center',
  },
  phoneDash: {
    fontSize: 18,
    color: colors.textMuted,
    marginHorizontal: 4,
    fontWeight: 'bold',
  },
  phoneSegment7: {
    flex: 2.2,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMain,
    letterSpacing: 1.5,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  statusInfo: {
    backgroundColor: '#F0FDF4',
  },
  statusInfoText: {
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: '500',
  },
  statusWarning: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusWarningText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
  },
  statusWarningLink: {
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: 4,
  },
  statusSuccess: {
    backgroundColor: '#ECFDF5',
  },
  statusSuccessText: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '600',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.textMain,
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 14,
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
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  registerLink: {
    color: colors.primaryDark,
    fontWeight: 'bold',
    fontSize: 14,
  },
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
  },
});
