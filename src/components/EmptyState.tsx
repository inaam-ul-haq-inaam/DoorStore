import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  iconSize?: number;
  iconColor?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  iconSize = 64,
  iconColor = colors.textMuted,
}) => (
  <View style={styles.container}>
    <Icon name={icon} size={iconSize} color={iconColor} />
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textMain,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
