import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useShopLocationController } from './controller';
import Icon from 'react-native-vector-icons/Ionicons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave?: (address: string) => void;
}

export const ShopLocationModal = ({ visible, onClose, onSave }: Props) => {
  const { address, setAddress, loading, handleSaveLocation, fetchingGpsLocation, handleUseGpsLocation } = useShopLocationController(visible, onClose, onSave);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Set Shop Location</Text>
          <Text style={styles.subtitle}>Type manually or use GPS to auto-detect your location.</Text>

          <TouchableOpacity
            style={styles.gpsButton}
            onPress={handleUseGpsLocation}
            disabled={fetchingGpsLocation}
          >
            {fetchingGpsLocation ? (
              <><Icon name="sync-outline" size={18} color={colors.primaryDark} /><Text style={styles.gpsButtonText}>  Fetching location...</Text></>
            ) : (
              <><Icon name="locate-outline" size={18} color={colors.primaryDark} /><Text style={styles.gpsButtonText}>  Use Current Location</Text></>
            )}
          </TouchableOpacity>

          <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: 8 }]}>— OR type manually —</Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Shop #12, Main Market"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor={colors.textMuted}
          />

          {loading ? (
            <ActivityIndicator size="large" color={colors.primaryDark} style={{ marginVertical: spacing.m }} />
          ) : (
            <>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveLocation}>
                <Text style={styles.saveButtonText}>Save Location</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusLarge,
    padding: spacing.xl,
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.l,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: spacing.radiusMedium,
    padding: spacing.m,
    fontSize: 16,
    color: colors.textMain,
    marginBottom: spacing.l,
    backgroundColor: '#F9FAFB',
  },
  saveButton: {
    backgroundColor: colors.primaryDark,
    padding: spacing.m,
    borderRadius: spacing.radiusMedium,
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  saveButtonText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    padding: spacing.m,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF4F0',
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
    borderRadius: spacing.radiusMedium,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    width: '100%',
  },
  gpsButtonText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 14,
  },
});
