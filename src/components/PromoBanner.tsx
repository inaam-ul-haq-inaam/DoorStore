import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface Props {
  title: string;
  subtitle: string;
  bottomText: string;
  image: string;
  backgroundColor: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const PromoBanner: React.FC<Props> = ({
  title,
  subtitle,
  bottomText,
  image,
  backgroundColor,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.bottomText}>{bottomText}</Text>
      </View>

      <Image source={{ uri: image }} style={styles.image} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: spacing.radiusMedium,
    padding: spacing.m,
    height: 100,
    overflow: 'hidden',
    flex: 1,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B45309',
    marginBottom: 8,
  },
  bottomText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  image: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    position: 'absolute',
    right: -10,
    bottom: 0,
  },
});
