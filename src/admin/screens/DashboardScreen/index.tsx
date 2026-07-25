import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAdminDashboardController } from './controller';
import { ShopLocationModal } from '../../components/ShopLocationModal';
import { LogoutButton } from '../../../components/LogoutButton';

export const AdminDashboardScreen = () => {
  const { 
    stats, 
    isStoreOpen, 
    isLocationModalVisible,
    setLocationModalVisible,
    shopAddress,
    unreadChats,
    handleToggleStore, 
    handleStatPress, 
    handleAddProduct, 
    handleManageInventory,
    handleMessages,
    handleDeliverySettings,
    handleSetLocation,
    handleLocationSaved,
    shopRating,
    totalReviews,
    handleReviews
  } = useAdminDashboardController();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.locationBadge} onPress={handleSetLocation}>
            <Icon name="location-outline" size={16} color={colors.surface} />
            <Text style={styles.locationText} numberOfLines={1}>{shopAddress}</Text>
          </TouchableOpacity>
          
          <LogoutButton variant="icon" />
        </View>
        <Text style={styles.headerTitle}>Shopkeeper Portal</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsRow}>
        <StatItem title="Incoming" count={stats.incoming} color="#3B82F6" onPress={() => handleStatPress('incoming')} />
        <StatItem title="Pending" count={stats.pending} color="#F59E0B" onPress={() => handleStatPress('pending')} />
        <StatItem title="Completed" count={stats.completed} color="#10B981" onPress={() => handleStatPress('completed')} />
      </View>

      {/* Store Status Toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleText}>Store Status: {isStoreOpen ? 'Open' : 'Closed'}</Text>
        <Switch
          value={isStoreOpen}
          onValueChange={handleToggleStore}
          trackColor={{ false: '#767577', true: colors.primaryLight }}
          thumbColor={isStoreOpen ? colors.primaryDark : '#f4f3f4'}
        />
      </View>

      {/* Ratings Summary Card */}
      <TouchableOpacity style={styles.ratingCard} onPress={handleReviews} activeOpacity={0.8}>
        <View style={styles.ratingLeft}>
          <Icon name="star" size={32} color="#FBBF24" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.ratingMainText}>{shopRating} <Text style={{ fontSize: 14, color: colors.textMuted }}>/ 5.0</Text></Text>
            <Text style={styles.ratingSubText}>Based on {totalReviews} reviews</Text>
          </View>
        </View>
        <Icon name="chevron-forward" size={24} color={colors.textMuted} />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Shop Settings & Actions</Text>

      {/* Action Grid */}
      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.actionButton} onPress={handleAddProduct}>
          <Icon name="add-circle-outline" size={24} color={colors.surface} />
          <Text style={[styles.actionButtonText, { marginTop: 8 }]}>Add Product</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleManageInventory}>
          <Icon name="cube-outline" size={24} color={colors.surface} />
          <Text style={[styles.actionButtonText, { marginTop: 8 }]}>Inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleDeliverySettings}>
          <Icon name="bicycle-outline" size={24} color={colors.surface} />
          <Text style={[styles.actionButtonText, { marginTop: 8 }]}>Delivery Fee</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { width: '100%', marginTop: spacing.m, flexDirection: 'row', justifyContent: 'center', gap: 10 }]} onPress={handleMessages}>
          <View>
            <Icon name="chatbubbles-outline" size={24} color={colors.surface} />
            {unreadChats > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{unreadChats > 9 ? '9+' : unreadChats}</Text>
              </View>
            )}
          </View>
          <Text style={styles.actionButtonText}>Messages / Inbox</Text>
        </TouchableOpacity>
      </View>

      <ShopLocationModal 
        visible={isLocationModalVisible} 
        onClose={() => setLocationModalVisible(false)} 
        onSave={handleLocationSaved}
      />
    </View>
  );
};

// Helper Component for Stats
const StatItem = ({
  title,
  count,
  color,
  onPress,
}: {
  title: string;
  count: number;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={[styles.statBox, { borderTopColor: color }]} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.statCount}>{count}</Text>
    <Text style={styles.statLabel}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    padding: spacing.xl,
    backgroundColor: colors.primaryDark,
    paddingTop: 60,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  logoutButton: {
    padding: 4,
  },
  headerTitle: { color: colors.surface, fontSize: 22, fontWeight: 'bold' },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: 150,
  },
  locationText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    padding: spacing.m,
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: spacing.radiusMedium,
    width: '30%',
    alignItems: 'center',
    borderTopWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  statCount: { fontSize: 20, fontWeight: '800', color: colors.primaryDark },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.m,
    padding: spacing.m,
    borderRadius: spacing.radiusMedium,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: spacing.m,
  },
  toggleText: { fontSize: 16, fontWeight: '600', color: colors.textMain },
  ratingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.m,
    padding: spacing.m,
    borderRadius: spacing.radiusMedium,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingMainText: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  ratingSubText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    margin: spacing.m,
    color: colors.primaryDark,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.m,
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: spacing.xl,
  },
  actionButton: {
    backgroundColor: colors.primaryDark,
    padding: spacing.m,
    marginBottom: spacing.m, // Added to prevent overlap when wrapped
    borderRadius: spacing.radiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  actionButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  }
});
