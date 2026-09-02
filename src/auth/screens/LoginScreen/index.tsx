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
    height: 360,
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
    transform: [{ rotate: '-15deg' }],
  },
  bgIconRight: {
    position: 'absolute',
    right: -20,
    bottom: 80,
    transform: [{ rotate: '20deg' }],
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 35,
    alignSelf: 'center',
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
    marginBottom: 12,
    marginTop: 4,
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
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
