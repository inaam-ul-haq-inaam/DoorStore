import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.l,
    paddingTop: 60, 
    paddingBottom: spacing.m,
    backgroundColor: colors.primaryDark,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: colors.surface,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listContainer: {
    padding: spacing.m,
    paddingBottom: 40,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: spacing.radiusMedium,
    marginBottom: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FBBF24',
    marginLeft: 6,
  },
  reviewText: {
    fontSize: 14,
    color: colors.textMain,
    lineHeight: 20,
    marginTop: 4,
    fontStyle: 'italic',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
  },
  orderIdText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 30,
  }
});
