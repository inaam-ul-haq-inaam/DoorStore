import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { useOnboardingController } from './controller';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

export const OnboardingScreen = () => {
  const { handleGetStarted } = useOnboardingController();

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>Door Store</Text>
        <Text style={styles.tagline}>Fresh groceries, right at your door</Text>
      </View>
      
      <View style={styles.bottomContent}>
        <Text style={styles.subtitle}>Get fresh vegetables, meats at your doorstep</Text>
        <PrimaryButton title="Get Started" onPress={handleGetStarted} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.primaryDark,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
  },
  bottomContent: {
    paddingBottom: spacing.xxl,
    width: '100%',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.l,
    textAlign: 'center',
    fontWeight: '400',
    paddingHorizontal: spacing.l,
  },
});
