import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingHorizontal: spacing.l,
    paddingTop: 60, // Safe area
    paddingBottom: 40, // Increased to make room for overlapping tabs
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 8,
    marginHorizontal: spacing.m,
    marginTop: -20, // Overlap the header slightly
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryDark,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: '#FFF',
  },
  listContainer: {
    padding: spacing.m,
    paddingBottom: 100, // For bottom tab bar
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  itemsText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textMain,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
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
  }
});
