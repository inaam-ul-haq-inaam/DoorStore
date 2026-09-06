import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useUserDetailsController } from './controller';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { Avatar } from '../../../components/Avatar';
import { ScreenLoader } from '../../../components/ScreenLoader';
import { normalizePhone } from '../../../utils/phoneUtils';

const ROLE_LABEL: Record<string, string> = {
  buyer: 'Customer',
  admin: 'Admin',
  shopkeeper: 'Shopkeeper',
};

const formatDate = (ts: any): string => {
  if (!ts) return 'N/A';
  try {
    if (ts?.toDate && typeof ts.toDate === 'function') {
      const d = ts.toDate();
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    if (typeof ts === 'number') {
      return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    if (typeof ts === 'string') {
      return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
  } catch (e) {
    return 'N/A';
  }
  return 'N/A';
};

export const UserDetailsScreen = () => {
  const { user, orderCount, totalSpent, loading, handleGoBack } = useUserDetailsController();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ScreenLoader />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.notFound}>User not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={handleGoBack}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const name = user.full_name || 'Unknown';
  const role = ROLE_LABEL[user.role || 'buyer'] || user.role || 'User';
  const phone = normalizePhone(user.phone);
  const joinedDate = formatDate(user.created_at);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon name="chevron-back" size={24} color={colors.surface} />
        </TouchableOpacity>
        <Avatar name={name} size="large" />
        <Text style={styles.name}>{name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{role}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statCount}>{orderCount}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statCount}>Rs. {totalSpent.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statCount}>{joinedDate}</Text>
          <Text style={styles.statLabel}>Joined</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>User Information</Text>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Icon name="person-outline" size={18} color={colors.primaryDark} />
          </View>
          <View style={styles.detailTextGroup}>
            <Text style={styles.detailLabel}>Full Name</Text>
            <Text style={styles.detailValue}>{name}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Icon name="call-outline" size={18} color={colors.primaryDark} />
          </View>
          <View style={styles.detailTextGroup}>
            <Text style={styles.detailLabel}>Phone Number</Text>
            <Text style={styles.detailValue}>{phone || 'Not provided'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Icon name="mail-outline" size={18} color={colors.primaryDark} />
          </View>
          <View style={styles.detailTextGroup}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{user.email || 'Not provided'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Icon name="shield-checkmark-outline" size={18} color={colors.primaryDark} />
          </View>
          <View style={styles.detailTextGroup}>
            <Text style={styles.detailLabel}>Role</Text>
            <Text style={styles.detailValue}>{role}</Text>
          </View>
        </View>

        {user.address ? (
          <>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="location-outline" size={18} color={colors.primaryDark} />
              </View>
              <View style={styles.detailTextGroup}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{user.address}</Text>
              </View>
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textMain,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: colors.primaryDark,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backButton: {
    position: 'absolute',
    left: 12,
    top: 48,
    padding: 8,
    zIndex: 10,
  },
  name: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 8,
  },
  roleText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    padding: spacing.m,
    justifyContent: 'space-between',
    marginTop: -24,
  },
  statBox: {
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: spacing.radiusMedium,
    width: '31%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statCount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.m,
    marginTop: spacing.m,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingTop: 14,
    paddingBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EBF4F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  detailTextGroup: { flex: 1 },
  detailLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
});