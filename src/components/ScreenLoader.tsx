import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface ScreenLoaderProps {
  color?: string;
}

export const ScreenLoader: React.FC<ScreenLoaderProps> = ({ color }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={color || colors.primaryDark} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
