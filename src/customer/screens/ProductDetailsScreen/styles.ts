import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  headerBackground: {
    backgroundColor: colors.primaryDark,
    height: 140,
    borderBottomLeftRadius: spacing.radiusLarge * 2,
    borderBottomRightRadius: spacing.radiusLarge * 2,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingTop: 60, 
    zIndex: 10,
  },
  headerTitle: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.l,
    zIndex: 5,
  },
  productImage: {
    width: width * 0.7,
    height: width * 0.6,
    resizeMode: 'contain',
  },
  detailsContainer: {
    paddingHorizontal: spacing.l,
    marginTop: spacing.l,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryDark,
    paddingRight: spacing.m,
  },
  weight: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.m,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  price: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  fastDeliveryText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.m,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  readMore: {
    color: colors.primaryDark,
    fontWeight: 'bold',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  stepperContainer: {
    marginRight: spacing.m,
  },
  buttonContainer: {
    flex: 1,
  },
});
