import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Modal, ScrollView } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Icon from 'react-native-vector-icons/Ionicons';
import { useOrderSuccessController } from './controller';
import { styles } from './styles';
import { colors } from '../../../theme/colors';

export const OrderSuccessScreen = () => {
  const { 
    orderId, 
    orderStatus,
    orderData,
    handleBackToHome, 
    handleTrackOrder, 
    isTrackModalVisible, 
    closeTrackModal,
    isReceiptModalVisible,
    setReceiptModalVisible,
    viewRef,
    handleSaveReceipt
  } = useOrderSuccessController();

  const isStep1 = true; 
  const isStep2 = orderStatus === 'pending' || orderStatus === 'completed';
  const isStep3 = orderStatus === 'pending' || orderStatus === 'completed';
  const isStep4 = orderStatus === 'completed';

  return (
    <View style={styles.container}>

      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>✓</Text>
      </View>

      <Text style={styles.title}>Order Placed!</Text>

      <Text style={styles.subtitle}>
        Thank you! Your grocery order has been successfully placed. We're preparing it for delivery.
      </Text>

      <View style={styles.orderIdBox}>
        <Text style={styles.orderIdLabel}>ORDER ID</Text>
        <Text style={styles.orderIdText}>{orderId.slice(0, 8).toUpperCase()}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleTrackOrder}>
          <Text style={styles.primaryBtnText}>Track Order Live</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 12, backgroundColor: '#EBF4F0', borderWidth: 0 }]} onPress={() => setReceiptModalVisible(true)}>
          <Text style={[styles.secondaryBtnText, { color: colors.primaryDark }]}>View E-Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 12 }]} onPress={handleBackToHome}>
          <Text style={styles.secondaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isTrackModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Order Status</Text>

            <View style={styles.timelineContainer}>

              <View style={styles.timelineItem}>
                <View style={styles.timelineLineBox}>
                  <View style={isStep1 ? styles.timelineDotActive : styles.timelineDotInactive} />
                  <View style={styles.timelineLine} />
                </View>
                <View style={styles.timelineTextContainer}>
                  <Text style={isStep1 ? styles.timelineTitleActive : styles.timelineTitleInactive}>Order Placed</Text>
                  <Text style={styles.timelineDesc}>We have received your order</Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineLineBox}>
                  <View style={isStep2 ? styles.timelineDotActive : styles.timelineDotInactive} />
                  <View style={styles.timelineLine} />
                </View>
                <View style={styles.timelineTextContainer}>
                  <Text style={isStep2 ? styles.timelineTitleActive : styles.timelineTitleInactive}>Order Accepted</Text>
                  <Text style={styles.timelineDesc}>Shopkeeper has confirmed</Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineLineBox}>
                  <View style={isStep3 ? styles.timelineDotActive : styles.timelineDotInactive} />
                  <View style={styles.timelineLine} />
                </View>
                <View style={styles.timelineTextContainer}>
                  <Text style={isStep3 ? styles.timelineTitleActive : styles.timelineTitleInactive}>Preparing Order</Text>
                  <Text style={styles.timelineDesc}>Your items are being packed</Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineLineBox}>
                  <View style={isStep4 ? styles.timelineDotActive : styles.timelineDotInactive} />
                </View>
                <View style={styles.timelineTextContainer}>
                  <Text style={isStep4 ? styles.timelineTitleActive : styles.timelineTitleInactive}>Delivered</Text>
                  <Text style={styles.timelineDesc}>Order has arrived!</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={closeTrackModal}>
              <Text style={styles.modalCloseText}>Close Tracker</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isReceiptModalVisible} transparent animationType="fade">
        <View style={styles.receiptOverlay}>
          <ViewShot ref={viewRef} style={styles.receiptPaper} options={{ format: 'png', quality: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false}>

              <View style={styles.receiptHeader}>
                <Text style={styles.receiptBrand}>DOOR STORE</Text>
                <Text style={styles.receiptSlogan}>Your fresh food partner</Text>
              </View>

              <Text style={styles.receiptDashedLine}>- - - - - - - - - - - - - - - - - - - - - - - -</Text>

              <View style={styles.receiptInfoSection}>
                <View style={styles.receiptRowInfo}>
                  <Text style={styles.receiptLabelText}>Order ID:</Text>
                  <Text style={styles.receiptValueText}>#{orderId.slice(0, 8).toUpperCase()}</Text>
                </View>
                <View style={styles.receiptRowInfo}>
                  <Text style={styles.receiptLabelText}>Date:</Text>
                  <Text style={styles.receiptValueText}>
                    {orderData?.created_at ? new Date(orderData.created_at).toLocaleString() : 'N/A'}
                  </Text>
                </View>
                <View style={styles.receiptRowInfo}>
                  <Text style={styles.receiptLabelText}>Customer:</Text>
                  <Text style={styles.receiptValueText}>{orderData?.customer_name || 'N/A'}</Text>
                </View>
                <View style={styles.receiptRowInfo}>
                  <Text style={styles.receiptLabelText}>Payment:</Text>
                  <Text style={styles.receiptValueText}>{orderData?.payment_method || 'COD'}</Text>
                </View>
              </View>

              <Text style={styles.receiptDashedLine}>- - - - - - - - - - - - - - - - - - - - - - - -</Text>

              <View style={styles.receiptItemsSection}>
                <View style={[styles.receiptRowItem, { marginBottom: 8 }]}>
                  <Text style={[styles.receiptLabelText, { flex: 0.2 }]}>Qty</Text>
                  <Text style={[styles.receiptLabelText, { flex: 0.5 }]}>Item</Text>
                  <Text style={[styles.receiptLabelText, { flex: 0.3, textAlign: 'right' }]}>Amount</Text>
                </View>

                {orderData?.items?.map((item: any, idx: number) => (
                  <View key={idx} style={styles.receiptRowItem}>
                    <Text style={[styles.receiptItemText, { flex: 0.2 }]}>{item.quantity}x</Text>
                    <Text style={[styles.receiptItemText, { flex: 0.5 }]} numberOfLines={2}>{item.name}</Text>
                    <Text style={[styles.receiptItemText, { flex: 0.3, textAlign: 'right' }]}>Rs. {item.price * item.quantity}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.receiptDashedLine}>- - - - - - - - - - - - - - - - - - - - - - - -</Text>

              <View style={styles.receiptTotalsSection}>
                <View style={styles.receiptRowInfo}>
                  <Text style={styles.receiptLabelText}>Subtotal</Text>
                  <Text style={styles.receiptValueText}>Rs. {orderData?.total_amount - orderData?.delivery_fee}</Text>
                </View>
                <View style={styles.receiptRowInfo}>
                  <Text style={styles.receiptLabelText}>Delivery Fee</Text>
                  <Text style={styles.receiptValueText}>Rs. {orderData?.delivery_fee}</Text>
                </View>
                <View style={[styles.receiptRowInfo, { marginTop: 8 }]}>
                  <Text style={styles.receiptGrandTotalText}>Total</Text>
                  <Text style={styles.receiptGrandTotalValue}>Rs. {orderData?.total_amount}</Text>
                </View>
              </View>

              <Text style={styles.receiptDashedLine}>- - - - - - - - - - - - - - - - - - - - - - - -</Text>

              <Text style={styles.receiptFooterText}>Thank you for your order!</Text>
            </ScrollView>
          </ViewShot>

          <TouchableOpacity style={styles.receiptSaveBtn} onPress={handleSaveReceipt}>
            <Icon name="download-outline" size={20} color="#FFF" />
            <Text style={styles.receiptSaveBtnText}>Save to Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.receiptCloseBtn} onPress={() => setReceiptModalVisible(false)}>
            <Text style={styles.receiptCloseBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
};
