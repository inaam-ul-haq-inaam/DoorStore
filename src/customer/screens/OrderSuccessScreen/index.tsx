import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Modal, ScrollView, Image } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Icon from 'react-native-vector-icons/Ionicons';
import { useOrderSuccessController } from './controller';
import { styles } from './styles';
import { colors } from '../../../theme/colors';
import { formatOrderItemQuantity } from '../../../utils/itemQuantity';

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
  const isStep2 = orderStatus === 'pending' || orderStatus === 'on_delivery' || orderStatus === 'completed';
  const isStep3 = orderStatus === 'pending' || orderStatus === 'on_delivery' || orderStatus === 'completed';
  const isStep4 = orderStatus === 'on_delivery' || orderStatus === 'completed';
  const isStep5 = orderStatus === 'completed';
  const receiptItems = Array.isArray(orderData?.items) ? orderData.items : [];
  const totalAmount = Number(orderData?.total_amount ?? 0);
  const deliveryFee = orderData?.delivery_fee;
  const numericDeliveryFee = typeof deliveryFee === 'number' ? deliveryFee : 0;
  const subtotal = deliveryFee === 'Pending'
    ? totalAmount
    : Math.max(0, totalAmount - numericDeliveryFee);
  const formatCurrency = (value: number) => `Rs. ${value.toLocaleString('en-PK')}`;
  const createdAt = orderData?.created_at ? new Date(orderData.created_at) : null;
  const receiptDate = createdAt && !Number.isNaN(createdAt.getTime())
    ? createdAt.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : 'N/A';

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
                  <View style={styles.timelineLine} />
                </View>
                <View style={styles.timelineTextContainer}>
                  <Text style={isStep4 ? styles.timelineTitleActive : styles.timelineTitleInactive}>On the Way</Text>
                  <Text style={styles.timelineDesc}>Your order is on the way</Text>
                </View>
              </View>

              <View style={styles.timelineItem}>
                <View style={styles.timelineLineBox}>
                  <View style={isStep5 ? styles.timelineDotActive : styles.timelineDotInactive} />
                </View>
                <View style={styles.timelineTextContainer}>
                  <Text style={isStep5 ? styles.timelineTitleActive : styles.timelineTitleInactive}>Received</Text>
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
          <ScrollView
            contentContainerStyle={styles.receiptModalContent}
            showsVerticalScrollIndicator={false}
          >
            <ViewShot ref={viewRef} style={styles.receiptPaper} options={{ format: 'png', quality: 1 }}>
              <View style={styles.receiptHeader}>
                <Image source={require('../../../assets/logo.png')} style={styles.receiptLogo} resizeMode="contain" />
                <Text style={styles.receiptBrand}>DOOR STORE</Text>
                <Text style={styles.receiptSlogan}>Your fresh food partner</Text>
                <Text style={styles.receiptStoreTitle}>CHUNG LAHORE</Text>
                <Text style={styles.receiptContact}>WhatsApp: 03025769675</Text>
              </View>

              <View style={styles.receiptDashedLine} />
              <Text style={styles.receiptSectionTitle}>ORDER DETAILS</Text>
              <View style={styles.receiptInfoSection}>
                <View style={styles.receiptRowInfo}>
                  <Text style={styles.receiptLabelText}>Order ID:</Text>
                  <Text style={styles.receiptValueText}>#{orderId.slice(0, 8).toUpperCase()}</Text>
                </View>
                <View style={styles.receiptRowInfo}>
                  <Text style={styles.receiptLabelText}>Date:</Text>
                  <Text style={styles.receiptValueText}>{receiptDate}</Text>
                </View>
              </View>

              <View style={styles.receiptDashedLine} />
              <Text style={styles.receiptSectionTitle}>CUSTOMER DETAILS</Text>
              <View style={styles.receiptInfoSection}>
                <View style={styles.receiptRowInfo}>
                  <Text style={styles.receiptLabelText}>Customer:</Text>
                  <Text style={styles.receiptValueText}>{orderData?.customer_name || 'N/A'}</Text>
                </View>
                <View style={styles.receiptRowInfo}>
                  <Text style={styles.receiptLabelText}>Phone:</Text>
                  <Text style={styles.receiptValueText}>{orderData?.customer_phone || 'N/A'}</Text>
                </View>
                <View style={styles.receiptRowInfo}>
                  <Text style={styles.receiptLabelText}>Address:</Text>
                  <Text style={styles.receiptValueText}>{orderData?.delivery_address || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.receiptDashedLine} />
              <Text style={styles.receiptSectionTitle}>ITEMS</Text>
              <View style={styles.receiptItemsSection}>
                {receiptItems.map((item: any, idx: number) => {
                  const quantity = Number(item?.quantity ?? 0);
                  const amount = Number(item?.price ?? 0) * quantity;
                  return (
                    <View key={`${item?.name ?? 'item'}-${idx}`} style={styles.receiptRowItem}>
                      <Text style={styles.receiptItemText}>{item?.name ?? 'Item'}</Text>
                      <Text style={styles.receiptItemQuantity}>{formatOrderItemQuantity(item)}</Text>
                      <Text style={styles.receiptItemAmount}>{formatCurrency(amount)}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.receiptDashedLine} />
              <View style={styles.receiptTotalsSection}>
                <View style={styles.receiptRowInfo}>
                  <Text style={styles.receiptLabelText}>Subtotal:</Text>
                  <Text style={styles.receiptValueText}>{formatCurrency(subtotal)}</Text>
                </View>
                <View style={styles.receiptRowInfo}>
                  <Text style={styles.receiptLabelText}>Delivery Fee:</Text>
                  <Text style={styles.receiptValueText}>
                    {deliveryFee === 'Pending' ? 'Pending' : formatCurrency(numericDeliveryFee)}
                  </Text>
                </View>
                {!!orderData?.distance_km && (
                  <View style={styles.receiptRowInfo}>
                    <Text style={styles.receiptLabelText}>Distance:</Text>
                    <Text style={styles.receiptValueText}>{Number(orderData.distance_km).toFixed(2)} KM</Text>
                  </View>
                )}
                <View style={styles.receiptGrandTotal}>
                  <Text style={styles.receiptGrandTotalText}>TOTAL:</Text>
                  <Text style={styles.receiptGrandTotalValue}>{formatCurrency(totalAmount)}</Text>
                </View>
              </View>

              <View style={styles.receiptDashedLine} />
              <Text style={styles.receiptFooterText}>Thank you for your order!</Text>
              <Text style={styles.receiptFooterNote}>
                We appreciate you choosing DOOR STORE{'\n'}— your fresh food partner.
              </Text>
              <Text style={styles.receiptKeepNote}>Please keep this receipt for your records</Text>
            </ViewShot>

            <TouchableOpacity style={styles.receiptSaveBtn} onPress={handleSaveReceipt}>
              <Icon name="download-outline" size={20} color="#FFF" />
              <Text style={styles.receiptSaveBtnText}>Save to Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.receiptCloseBtn} onPress={() => setReceiptModalVisible(false)}>
              <Text style={styles.receiptCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
};
