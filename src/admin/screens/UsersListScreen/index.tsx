import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useUsersListController, UserItem } from './controller';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { Avatar } from '../../../components/Avatar';
import { ScreenLoader } from '../../../components/ScreenLoader';
import { EmptyState } from '../../../components/EmptyState';
import { normalizePhone } from '../../../utils/phoneUtils';
import { useAuth } from '../../../context/AuthContext';

const ROLE_LABEL: Record<string, string> = {
  buyer: 'Customer',
  admin: 'Admin',
  shopkeeper: 'Shopkeeper',
};

export const UsersListScreen = () => {
  const { users, loading, openUserDetails, handleToggleAdmin } = useUsersListController();
  const { userProfile } = useAuth();
  // Role badalne ka sirf admin ke paas hi option dikhega.
  const canManageRoles = userProfile?.role === 'admin';

  const renderItem = ({ item }: { item: UserItem }) => {
    const name = item.full_name || 'Unknown';
    const role = ROLE_LABEL[item.role || 'buyer'] || item.role || 'User';
    const phone = normalizePhone(item.phone) || item.email || '';

    return (
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => openUserDetails(item.id)}
        activeOpacity={0.7}
      >
        <View style={{ marginRight: 14 }}>
          <Avatar name={name} size="medium" />
        </View>
        <View style={styles.info}>
          <Text style={styles.userName} numberOfLines={1}>{name}</Text>
          <Text style={styles.userPhone} numberOfLines={1}>
            <Icon name="call-outline" size={13} color={colors.textMuted} /> {phone || 'No phone'}
          </Text>
        </View>
        <View style={[styles.roleBadge, item.role === 'admin' || item.role === 'shopkeeper' ? styles.roleBadgeAdmin : styles.roleBadgeCustomer]}>
          <Text style={styles.roleText}>{role}</Text>
        </View>

        {canManageRoles && item.role !== 'shopkeeper' && (
          <TouchableOpacity
            style={styles.roleActionBtn}
            onPress={() => handleToggleAdmin(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={item.role === 'admin' ? `Remove admin access from ${name}` : `Make ${name} an admin`}
          >
            <Icon
              name={item.role === 'admin' ? 'shield-checkmark' : 'shield-outline'}
              size={20}
              color={item.role === 'admin' ? '#B45309' : colors.primaryDark}
            />
          </TouchableOpacity>
        )}

        <Icon name="chevron-forward" size={18} color={colors.textMuted} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Customers</Text>
          <Text style={styles.headerSubtitle}>{users.length} registered user{users.length === 1 ? '' : 's'}</Text>
        </View>
        <Icon name="people-outline" size={26} color={colors.surface} />
      </View>

      {loading ? (
        <ScreenLoader />
      ) : users.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No Users Yet"
          subtitle="Registered users will appear here."
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primaryDark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 52,
    elevation: 4,
  },
  headerTitle: { color: colors.surface, fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: '#a0aab5', fontSize: 13, marginTop: 3 },
  list: { paddingVertical: 8, paddingBottom: 100 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
  },
  info: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: colors.textMain },
  userPhone: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeAdmin: {
    backgroundColor: '#FEF3C7',
  },
  roleBadgeCustomer: {
    backgroundColor: '#EBF4F0',
  },
  roleActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    marginRight: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 82 },
});