import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface Props {
  name: string;
  deliveryTime: string;
  price: number;
  logo: string;
  statusMsg?: string;
  isWarning?: boolean;
  isSelected?: boolean;
  onPress: () => void;
}

export const StoreCard: React.FC<Props> = ({
  name,
  deliveryTime,
  price,
  logo,
  statusMsg,
  isWarning,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.logoContainer}>
        <Image source={{ uri: logo }} style={styles.logo} />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.deliveryTime}>⚡ {deliveryTime}</Text>

        {statusMsg && (
          <Text style={[styles.statusMsg, isWarning && styles.warningText]}>
            {statusMsg}
          </Text>
        )}

        <Text style={styles.price}>{price.toFixed(2)}$</Text>
      </View>

      <View style={styles.arrowContainer}>
        <Text style={styles.arrowIcon}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusMedium,
    padding: spacing.m,
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    alignItems: 'center',

    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,

    borderWidth: 1,
    borderColor: colors.surface,
  },
  containerSelected: {
    borderColor: colors.primaryLight,
    backgroundColor: '#F0FDF4',
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  deliveryTime: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  statusMsg: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    color: colors.danger,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: 4,
  },
  arrowContainer: {
    paddingLeft: spacing.s,
  },
  arrowIcon: {
    fontSize: 24,
    color: colors.textMuted,
    lineHeight: 24,
  },
});
