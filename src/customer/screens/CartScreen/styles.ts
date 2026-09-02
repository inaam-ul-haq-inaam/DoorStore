import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingTop: 60, 
    paddingBottom: spacing.m,
    backgroundColor: colors.primaryDark,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  listContainer: {
    padding: spacing.m,
    paddingBottom: 250,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
  },
  shopButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.m,
    marginBottom: spacing.m,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  itemImage: {
    width: 65,
    height: 65,
    resizeMode: 'contain',
    marginRight: spacing.m,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 4,
  },
  itemWeight: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },

  receiptCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed', 
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textMain,
    marginBottom: 16,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  receiptLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  receiptValue: {
    fontSize: 15,
    color: colors.textMain,
    fontWeight: '600',
  },
  freeText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 20,
    color: colors.primaryDark,
    fontWeight: '900',
  },

  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 15,
  },
  checkoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomTotalLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  bottomTotalValue: {
    fontSize: 22,
    color: colors.primaryDark,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  checkoutBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  }
});
