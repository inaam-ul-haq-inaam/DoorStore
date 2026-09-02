import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingTop: 60,
    paddingBottom: spacing.m,
    backgroundColor: colors.primaryDark,
    borderBottomLeftRadius: spacing.radiusLarge,
    borderBottomRightRadius: spacing.radiusLarge,
  },
  headerTitle: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    padding: spacing.l,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: spacing.m,
    marginBottom: spacing.m,
  },
  inputContainer: {
    marginBottom: spacing.m,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radiusMedium,
    paddingHorizontal: spacing.m,
    height: 50,
    fontSize: 15,
    color: colors.textMain,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  paymentCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: spacing.radiusMedium,
    padding: spacing.m,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  paymentCardSelected: {
    borderColor: colors.primaryButton,
    backgroundColor: '#F0FDF4', 
  },
  paymentIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: 30,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
});
