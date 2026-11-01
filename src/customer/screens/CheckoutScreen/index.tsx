import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useCheckoutController } from './controller';
import { styles } from './styles';
import { colors } from '../../../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocationAutocomplete } from '../../../components/LocationAutocomplete';
import { LocationPickerMapModal } from '../../../components/LocationPickerMapModal';

import { IconButton } from '../../../components/IconButton';
import { PrimaryButton } from '../../../components/PrimaryButton';

export const CheckoutScreen = () => {
  const insets = useSafeAreaInsets();
  const {
    fullName,
    setFullName,
    address,
    setAddress,
    handleAddressTextChange,
    isSubmitting,
    isBillModalVisible,
    setBillModalVisible,
    subTotal,
    deliveryFee,
    deliveryFeePending,
    recalculating,
    calculationError,
    retryRecalculate,
    deliveryLat,
    deliveryLng,
    grandTotal,
    cartItems,
    handlePlaceOrderClick,
    handleLocationSelect,
    confirmOrder,
    handleGoBack,
    fetchingGps,
    handleUseCurrentLocation,
    isMapModalVisible,
    setMapModalVisible,
    handleMapLocationConfirm,
  } = useCheckoutController();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <IconButton icon="‹" onPress={handleGoBack} />
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Delivery Details</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor={colors.textMuted}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={[styles.inputContainer, { zIndex: 999 }]}>
          <Text style={styles.label}>Delivery Address</Text>
          <LocationAutocomplete
            value={address}
            onLocationSelect={handleLocationSelect}
            onChangeText={handleAddressTextChange}
            placeholder="Search delivery address..."
          />

          {/* Quick Location Action Buttons */}
          <View style={localStyles.locationActionsRow}>
            <TouchableOpacity
              style={localStyles.actionBtn}
              onPress={handleUseCurrentLocation}
              disabled={fetchingGps}
            >
              {fetchingGps ? (
                <>
                  <ActivityIndicator size="small" color={colors.primaryDark} style={{ marginRight: 6 }} />
                  <Text style={localStyles.actionBtnText}>Detecting GPS...</Text>
                </>
              ) : (
                <>
                  <Icon name="locate" size={17} color={colors.primaryDark} style={{ marginRight: 5 }} />
                  <Text style={localStyles.actionBtnText}>Use Current Location</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[localStyles.actionBtn, localStyles.actionBtnSecondary]}
              onPress={() => setMapModalVisible(true)}
            >
              <Icon name="map-outline" size={17} color={colors.primaryDark} style={{ marginRight: 5 }} />
              <Text style={localStyles.actionBtnText}>
                {deliveryLat ? 'Edit on Map' : 'Select on Map'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery fee recalculation indicator */}
        {recalculating && (
          <View style={localStyles.recalcRow}>
            <ActivityIndicator size="small" color={colors.primaryButton} />
            <Text style={localStyles.recalcText}>Recalculating delivery fee...</Text>
          </View>
        )}

        {/* Slow Internet / Calculation Error Banner */}
        {calculationError && (
          <View style={localStyles.errorCard}>
            <Text style={localStyles.errorTitle}>⚠️ Slow Internet Connection</Text>
            <Text style={localStyles.errorMessage}>{calculationError}</Text>
            <TouchableOpacity style={localStyles.retryBtn} onPress={retryRecalculate}>
              <Text style={localStyles.retryBtnText}>Tap to Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Payment Method</Text>

        <View style={[styles.paymentCard, styles.paymentCardSelected, { marginTop: 8 }]}>
          <Text style={styles.paymentIcon}>💵</Text>
          <Text style={styles.paymentText}>Cash on Delivery (COD)</Text>
        </View>
      </ScrollView>


      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <PrimaryButton
          title={
            recalculating
              ? "Calculating Delivery Fee..."
              : !deliveryLat
              ? "Select Address to Continue"
              : calculationError
              ? "Check Internet & Retry"
              : "Place Order"
          }
          onPress={handlePlaceOrderClick}
          disabled={recalculating || isSubmitting}
        />
      </View>


      <Modal visible={isBillModalVisible} transparent={true} animationType="slide">
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.sheet, { paddingBottom: insets.bottom + 24 }]}>
            <Text style={modalStyles.title}>Order Summary</Text>


            <View style={modalStyles.itemsListContainer}>
              <View style={modalStyles.itemsListHeader}>
                <Text style={[modalStyles.itemsListHeaderText, { flex: 2 }]}>Item</Text>
                <Text style={[modalStyles.itemsListHeaderText, { flex: 1, textAlign: 'center' }]}>Qty</Text>
                <Text style={[modalStyles.itemsListHeaderText, { flex: 1, textAlign: 'right' }]}>Price</Text>
              </View>
              <ScrollView style={{ maxHeight: 150 }} showsVerticalScrollIndicator={false}>
                {cartItems.map((item: any) => (
                  <View key={item.id} style={modalStyles.itemRow}>
                    <Text style={[modalStyles.itemText, { flex: 2 }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[modalStyles.itemText, { flex: 1, textAlign: 'center' }]}>
                      x{item.quantity}
                    </Text>
                    <Text style={[modalStyles.itemText, { flex: 1, textAlign: 'right' }]}>
                      Rs. {item.price * item.quantity}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={modalStyles.billRow}>
              <Text style={modalStyles.billText}>Subtotal</Text>
              <Text style={modalStyles.billValue}>Rs. {subTotal}</Text>
            </View>

            <View style={modalStyles.billRow}>
              <Text style={modalStyles.billText}>Delivery Fee</Text>
              {deliveryFeePending ? (
                <Text style={modalStyles.billValue}>Shop will confirm</Text>
              ) : (
                <Text style={modalStyles.billValue}>Rs. {deliveryFee}</Text>
              )}
            </View>

            <View style={[modalStyles.billRow, modalStyles.billTotalRow]}>
              <Text style={modalStyles.billTotalText}>Total Bill</Text>
              <Text style={modalStyles.billTotalValue}>Rs. {grandTotal}</Text>
            </View>

            <View style={modalStyles.paymentInfoBox}>
              <Text style={modalStyles.paymentInfoIcon}>💵</Text>
              <Text style={modalStyles.paymentInfoText}>Payment Method: Cash on Delivery</Text>
            </View>

            <PrimaryButton 
              title="Confirm Order" 
              onPress={confirmOrder} 
              isLoading={isSubmitting} 
            />
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setBillModalVisible(false)} disabled={isSubmitting}>
              <Text style={modalStyles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Interactive Leaflet Pin Drop Map Modal */}
      <LocationPickerMapModal
        visible={isMapModalVisible}
        initialLat={deliveryLat || 33.6844}
        initialLng={deliveryLng || 73.0479}
        onClose={() => setMapModalVisible(false)}
        onConfirm={handleMapLocationConfirm}
      />

    </KeyboardAvoidingView>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  billValue: {
    fontSize: 16,
    color: colors.textMain,
    fontWeight: '600',
  },
  billTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  billTotalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  billTotalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
  },
  paymentInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  paymentInfoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  paymentInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  cancelBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemsListContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  itemsListHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  itemsListHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  itemText: {
    fontSize: 14,
    color: colors.textMain,
    fontWeight: '500',
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const localStyles = StyleSheet.create({
  locationActionsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  actionBtnSecondary: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  recalcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  recalcText: {
    marginLeft: 10,
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  errorMessage: {
    fontSize: 12,
    color: '#B91C1C',
    marginTop: 4,
    lineHeight: 16,
  },
  retryBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#DC2626',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
