import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    padding: spacing.l,
    backgroundColor: colors.primaryDark,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.m,
  },
  headerTitle: { color: colors.surface, fontSize: 20, fontWeight: 'bold' },
  form: {
    padding: spacing.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: spacing.s,
    marginTop: spacing.m,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: spacing.radiusMedium,
    padding: spacing.m,
    fontSize: 16,
    color: colors.textMain,
    backgroundColor: colors.surface,
  },
  infoText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: colors.primaryDark,
    padding: spacing.m,
    borderRadius: spacing.radiusMedium,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
