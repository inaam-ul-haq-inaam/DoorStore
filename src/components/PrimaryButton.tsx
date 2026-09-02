import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface Props {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: string;
}

export const PrimaryButton: React.FC<Props> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  style,
  icon,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        (disabled || isLoading) && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.primaryDark} size="small" />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.title}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primaryDark,
    paddingVertical: 16,
    borderRadius: spacing.radiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',


    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: spacing.s,
    color: colors.surface,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.surface,
    letterSpacing: 0.5,
  },
});
