import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/colors';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { CustomerStackNavigationProp } from '../../../navigation/types';
import { Avatar } from '../../../components/Avatar';
import { LogoutButton } from '../../../components/LogoutButton';
import { useCustomerProfileCache } from '../../../hooks/useCustomerProfileCache';

export const ProfileScreen = () => {
  const { user, userProfile } = useAuth();
  const navigation = useNavigation<CustomerStackNavigationProp>();
  const [location, setLocation] = useState('Not set');
  const [isLocationModalVisible, setLocationModalVisible] = useState(false);
  const [tempLocation, setTempLocation] = useState('');

  const { profile, updateProfile } = useCustomerProfileCache();

  // Load saved location
  useEffect(() => {
    if (profile.address) {
      setLocation(profile.address);
    }
  }, [profile]);

  const handleSaveLocation = async () => {
    if (!tempLocation.trim()) return;
    await updateProfile({ address: tempLocation.trim() });
    setLocationModalVisible(false);
  };

  // Generate avatar initials from name
  const name = userProfile?.full_name || 'Guest User';
  const phone = user?.phoneNumber || userProfile?.phone || 'N/A';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Avatar name={name} size="large" />
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.phone}>{phone}</Text>
        </View>

        {/* ── Section: My Info ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>My Information</Text>

          <MenuItem
            icon="person-outline"
            label="Full Name"
            value={name}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="call-outline"
            label="Phone Number"
            value={phone}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="location-outline"
            label="Delivery Address"
            value={location}
            onPress={() => {
              setTempLocation(location === 'Not set' ? '' : location);
              setLocationModalVisible(true);
            }}
            actionIcon="chevron-forward-outline"
          />
        </View>

        {/* ── Section: Quick Actions ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Quick Actions</Text>

          <MenuItem
            icon="chatbubble-ellipses-outline"
            label="Chat with Shop"
            onPress={() => navigation.navigate('CustomerChat')}
            actionIcon="chevron-forward-outline"
          />
          <View style={styles.divider} />
          <MenuItem
            icon="cart-outline"
            label="Go to Cart"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
            actionIcon="chevron-forward-outline"
          />
        </View>

        {/* ── Section: App Info ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>About</Text>
          <MenuItem
            icon="storefront-outline"
            label="App"
            value="DoorStore v1.0"
          />
          <View style={styles.divider} />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Privacy & Terms"
            value="View Policy"
            actionIcon="chevron-forward-outline"
            onPress={() => navigation.navigate('Policy')}
          />
        </View>

        {/* ── Logout ── */}
        <LogoutButton variant="fullWidth" />
      </ScrollView>

      {/* ── Location Edit Modal ── */}
      <Modal visible={isLocationModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Delivery Address</Text>
            <Text style={styles.modalSub}>This address is auto-filled at checkout.</Text>
            <TextInput
              style={styles.modalInput}
              value={tempLocation}
              onChangeText={setTempLocation}
              placeholder="House 12, Street 4, Islamabad"
              placeholderTextColor={colors.textMuted}
              multiline
              autoFocus
            />
            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveLocation}>
              <Text style={styles.modalSaveBtnText}>Save Address</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setLocationModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Reusable Menu Item Component ───
const MenuItem = ({
  icon,
  label,
  value,
  onPress,
  actionIcon,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  actionIcon?: string;
}) => {
  const content = (
    <View style={menuStyles.row}>
      <View style={menuStyles.iconBox}>
        <Icon name={icon} size={20} color={colors.primaryDark} />
      </View>
      <View style={menuStyles.textGroup}>
        <Text style={menuStyles.label}>{label}</Text>
        {value ? <Text style={menuStyles.value} numberOfLines={1}>{value}</Text> : null}
      </View>
      {actionIcon && <Icon name={actionIcon} size={18} color={colors.textMuted} />}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

const menuStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EBF4F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textGroup: { flex: 1 },
  label: { fontSize: 14, color: colors.textMuted, marginBottom: 2 },
  value: { fontSize: 15, fontWeight: '600', color: colors.textMain },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primaryDark },
  container: { flex: 1, backgroundColor: '#F0F4F8' },

  /* Header */
  header: {
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  /* Avatar - REMOVED (now in Avatar component) */
  name: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  phone: { color: 'rgba(255,255,255,0.7)', fontSize: 15 },

  /* Cards */
  sectionCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },

  /* Logout - REMOVED (now in LogoutButton component) */

  /* Location Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: colors.textMain,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalSaveBtn: {
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
  },
  modalSaveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalCancelText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
});
