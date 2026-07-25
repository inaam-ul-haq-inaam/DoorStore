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
} from 'react-native';
import { useCheckoutController } from './controller';
import { styles } from './styles';
import { colors } from '../../../theme/colors';

// Components
import { IconButton } from '../../../components/IconButton';
import { PrimaryButton } from '../../../components/PrimaryButton';

export const CheckoutScreen = () => {
  const {
    fullName,
    setFullName,
    address,
    setAddress,
    isSubmitting,
    isBillModalVisible,
    setBillModalVisible,
    subTotal,
    deliveryFee,
    grandTotal,
    cartItems,
    handlePlaceOrderClick,
    confirmOrder,
    handleGoBack,
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Complete Delivery Address</Text>
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            placeholder="House, Street, Area, City"
            placeholderTextColor={colors.textMuted}
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        <View style={[styles.paymentCard, styles.paymentCardSelected, { marginTop: 8 }]}>
          <Text style={styles.paymentIcon}>💵</Text>
          <Text style={styles.paymentText}>Cash on Delivery (COD)</Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <PrimaryButton
          title="Place Order"
          onPress={handlePlaceOrderClick}
        />
      </View>

      {/* Bill Confirmation Modal */}
      <Modal visible={isBillModalVisible} transparent={true} animationType="slide">
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <Text style={modalStyles.title}>Order Summary</Text>
            
            {/* Bill Items List */}
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
              <Text style={modalStyles.billValue}>Rs. {deliveryFee}</Text>
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
