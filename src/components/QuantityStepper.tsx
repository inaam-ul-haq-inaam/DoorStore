import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface Props {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export const QuantityStepper: React.FC<Props> = ({
  quantity,
  onIncrease,
  onDecrease,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onDecrease}
        activeOpacity={0.6}
      >
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>

      <Text style={styles.quantityText}>{quantity}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={onIncrease}
        activeOpacity={0.6}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusLarge,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: colors.primaryDark,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textMain,
    marginHorizontal: spacing.m,
  },
});
