import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useCompleteProfileController } from './controller';

export const CompleteProfileScreen = () => {
  const { fullName, setFullName, loading, error, handleSaveProfile } = useCompleteProfileController();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Almost Done!</Text>
        <Text style={styles.headerSubtitle}>Let us know what to call you</Text>
      </View>

      <View style={styles.formContainer}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputWrapper}>
          <Icon name="person-outline" size={20} color={colors.textMuted} style={styles.icon} />
          <TextInput 
            style={styles.input} 
            placeholder="Full Name" 
            placeholderTextColor={colors.textMuted}
            value={fullName} 
            onChangeText={setFullName} 
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSaveProfile} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Complete Profile</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: colors.primaryDark,
    height: 250,
    paddingTop: 80,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTitle: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  headerSubtitle: { color: '#E0E0E0', fontSize: 16, marginTop: 8 },
  formContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: spacing.l,
    marginTop: -50, 
    padding: spacing.xl,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginBottom: spacing.l,
    paddingHorizontal: spacing.m,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 55, color: '#333', fontSize: 16 },
  primaryButton: {
    backgroundColor: colors.primaryDark,
    height: 55,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  errorText: { color: '#EF4444', marginBottom: 10, textAlign: 'center' },
});
