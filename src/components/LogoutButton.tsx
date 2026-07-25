import React from 'react';
import { TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { firebaseAuth } from '../services/firebase';
import { colors } from '../theme/colors';

interface LogoutButtonProps {
  variant?: 'icon' | 'fullWidth';
}

const handleLogout = () => {
  Alert.alert('Log Out', 'Are you sure you want to log out?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Log Out',
      style: 'destructive',
      onPress: async () => {
        try {
          await firebaseAuth.signOut();
        } catch (error) {
          console.error('Error signing out:', error);
        }
      },
    },
  ]);
};

export const LogoutButton: React.FC<LogoutButtonProps> = ({ variant = 'icon' }) => {
  if (variant === 'fullWidth') {
    return (
      <TouchableOpacity style={styles.fullWidthBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Icon name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.fullWidthText}>Log Out</Text>
      </TouchableOpacity>
    );
  }

  // Icon variant (for headers)
  return (
    <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
      <Icon name="log-out-outline" size={24} color={colors.surface} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconBtn: {
    padding: 4,
  },
  fullWidthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    elevation: 1,
  },
  fullWidthText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
