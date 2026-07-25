import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface Props {
  title: string;
  actionTitle?: string;
  onActionPress?: () => void;
}

export const SectionHeader: React.FC<Props> = ({
  title,
  actionTitle,
  onActionPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {/* Agar actionTitle pass kiya gaya hai, tabhi yeh button show hoga */}
      {actionTitle && (
        <TouchableOpacity activeOpacity={0.7} onPress={onActionPress}>
          <Text style={styles.actionText}>{actionTitle}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.m, // Container ki side padding
    marginTop: spacing.xl,
    marginBottom: spacing.s,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B45309',
  },
});
