import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface Props {
  title: string;
  image: string;
  isSelected?: boolean;
  onPress: () => void;
}

export const CategoryPill: React.FC<Props> = ({
  title,
  image,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.circle,
          isSelected && styles.circleSelected, // Agar select ho toh color change
        ]}
      >
        <Image source={{ uri: image }} style={styles.image} />
      </View>
      <Text style={[styles.title, isSelected && styles.titleSelected]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: spacing.m,
  },
  circle: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#FEF08A', // Light yellow background (reference image se)
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  circleSelected: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  image: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 13,
    color: colors.textMain,
    fontWeight: '600',
  },
  titleSelected: {
    color: colors.primaryDark,
    fontWeight: 'bold',
  },
});
