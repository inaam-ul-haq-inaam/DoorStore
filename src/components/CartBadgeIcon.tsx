import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  itemCount: number;
  onPress: () => void;
}

export const CartBadgeIcon: React.FC<Props> = ({ itemCount, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Background Circle for Icon */}
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>🛒</Text>
      </View>

      {/* Red Badge (Only shows if itemCount > 0) */}
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    fontSize: 18,
    color: colors.primaryDark,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.danger, // Red color from theme
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primaryDark, // Dark border taa ke header se mix na ho
  },
  badgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
