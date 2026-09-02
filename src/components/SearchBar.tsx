import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface Props {
  placeholder?: string;
  onSearch: (text: string) => void;
}

export const SearchBar: React.FC<Props> = ({
  placeholder = 'Search...',
  onSearch,
}) => {
  return (
    <View style={styles.container}>

      <View style={styles.iconContainer}>
        <TextInput editable={false} style={styles.icon}>
          🔍
        </TextInput>
      </View>

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onChangeText={onSearch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: spacing.radiusMedium,
    paddingHorizontal: spacing.m,
    height: 50,
    marginVertical: spacing.m,


    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: spacing.s,
  },
  icon: {
    fontSize: 18,
    color: colors.textMuted,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textMain,
    fontWeight: '500',
  },
});
