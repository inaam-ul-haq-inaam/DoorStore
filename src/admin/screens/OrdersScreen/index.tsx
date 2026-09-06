import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, SafeAreaView, TextInput, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ViewShot from 'react-native-view-shot';
import { colors } from '../../../theme/colors';
import { useOrdersController, Order } from './controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { ScreenLoader } from '../../../components/ScreenLoader';
import { EmptyState } from '../../../components/EmptyState';

export const OrdersScreen = () => {
  const insets = useSafeAreaInsets();
  const { 
    status, 
    orders, 
    loading, 
    selectedOrder, 
    openOrderDetails, 
    closeOrderDetails, 
    inputDeliveryFee,
    setInputDeliveryFee,
    isUpdatingFee,
    handleUpdateDeliveryFee,
    updateOrderStatus, 
    openGoogleMapsRoute,
    viewRef,
    handleSaveReceipt,
    handlePrintBill
  } = useOrdersController();

  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

  const getActionText = () => {
    if (status === 'incoming') return 'Accept Order';
    if (status === 'pending') return 'Mark Completed';
    return '';
  };

  const getNextStatus = () => {
    if (status === 'incoming') return 'pending';
    if (status === 'pending') return 'completed';
    return '';
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => openOrderDetails(item)} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.customerName}>{item.customer_name}</Text>
        <Text style={styles.orderTotal}>Rs. {item.total_amount.toFixed(2)}</Text>
      </View>

      <Text style={styles.phoneText}>
        <Icon name="call-outline" size={14} color={colors.textMuted} /> {item.customer_phone}
      </Text>

      <Text style={styles.addressText} numberOfLines={2}>
        <Icon name="location-outline" size={14} color={colors.textMuted} /> {item.delivery_address}
      </Text>

      <View style={styles.viewDetailsRow}>
        <Text style={styles.viewDetailsText}>Tap to view details</Text>
        <Icon name="chevron-forward" size={16} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{formattedStatus} Orders</Text>
        <Text style={styles.headerSubtitle}>{orders.length} orders found</Text>
      </View>

      {loading ? (
        <ScreenLoader />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title={`No ${status} orders right now.`}
          iconSize={80}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={!!selectedOrder} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeOrderDetails} style={styles.closeButton}>
              <Icon name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Order Details</Text>
          </View>

          {selectedOrder && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <ViewShot ref={viewRef} options={{ format: 'png', quality: 1 }} style={{ backgroundColor: '#f1f5f9', paddingBottom: 20 }}>
                <View style={styles.sectionCard}>
                <Text style={styles.sectionLabel}>Customer Information</Text>
                <Text style={styles.modalValue}>{selectedOrder.customer_name}</Text>
                <Text style={styles.modalValueSub}><Icon name="call-outline" size={14} /> {selectedOrder.customer_phone}</Text>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionLabel}>Delivery Address</Text>
                <Text style={styles.modalValue}>{selectedOrder.delivery_address}</Text>

                <TouchableOpacity 
                  style={styles.modalRouteBtn} 
                  onPress={() => {
                    closeOrderDetails();
                    openGoogleMapsRoute(selectedOrder.delivery_address);
                  }}
                >
                  <Icon name="map" size={16} color="#fff" />
                  <Text style={styles.modalRouteBtnText}>Open in Google Maps</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionLabel}>Order Items</Text>
                <View style={styles.itemsTable}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCol, { flex: 3, fontWeight: 'bold' }]}>Item</Text>
                    <Text style={[styles.tableCol, { flex: 1, fontWeight: 'bold', textAlign: 'center' }]}>Qty</Text>
                    <Text style={[styles.tableCol, { flex: 1, fontWeight: 'bold', textAlign: 'right' }]}>Price</Text>
                  </View>
                  {selectedOrder.items.map((prod, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCol, { flex: 3 }]}>{prod.name}</Text>
                      <Text style={[styles.tableCol, { flex: 1, textAlign: 'center' }]}>x{prod.quantity}</Text>
                      <Text style={[styles.tableCol, { flex: 1, textAlign: 'right' }]}>Rs. {prod.price.toFixed(0)}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal:</Text>
                  <Text style={styles.totalValue}>Rs. {(selectedOrder.delivery_fee === 'Pending' ? selectedOrder.total_amount : selectedOrder.total_amount - (selectedOrder.delivery_fee || 0)).toFixed(2)}</Text>
                </View>
                {selectedOrder.delivery_fee !== undefined && (
                  <View style={[styles.totalRow, { marginTop: 4, alignItems: 'center' }]}>
                    <Text style={styles.totalLabel}>Delivery Fee:</Text>
                    {selectedOrder.delivery_fee === 'Pending' ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, width: 80, height: 30, paddingHorizontal: 8, paddingVertical: 0, marginRight: 8, color: '#333' }}
                          placeholder="e.g. 150"
                          keyboardType="numeric"
                          value={inputDeliveryFee}
                          onChangeText={setInputDeliveryFee}
                        />
                        <TouchableOpacity 
                          onPress={handleUpdateDeliveryFee} 
                          disabled={isUpdatingFee}
                          style={{ backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
                        >
                          {isUpdatingFee ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: '#fff', fontSize: 12 }}>Save</Text>}
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text style={styles.totalValue}>Rs. {typeof selectedOrder.delivery_fee === 'number' ? selectedOrder.delivery_fee.toFixed(2) : selectedOrder.delivery_fee}</Text>
                    )}
                  </View>
                )}
                <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, marginTop: 4 }]}>
                  <Text style={[styles.totalLabel, { color: colors.primary }]}>Total Amount:</Text>
                  <Text style={[styles.totalValue, { color: colors.primary, fontSize: 18 }]}>Rs. {selectedOrder.total_amount.toFixed(2)}</Text>
                </View>
              </View>
              </ViewShot>
            </ScrollView>
          )}

          {selectedOrder && status !== 'completed' && (
            <View style={[styles.modalBottomBar, { paddingBottom: insets.bottom + 20 }]}>
              <PrimaryButton 
                title={getActionText()} 
                onPress={() => updateOrderStatus(selectedOrder.id, getNextStatus())} 
              />
              <TouchableOpacity style={[styles.saveReceiptBtn, { marginTop: 8, backgroundColor: '#374151' }]} onPress={handlePrintBill}>
                <Icon name="print-outline" size={20} color="#FFF" />
                <Text style={styles.saveReceiptBtnText}>Print Bill</Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedOrder && status === 'completed' && (
            <View style={[styles.modalBottomBar, { paddingBottom: insets.bottom + 20 }]}>
              <TouchableOpacity style={styles.saveReceiptBtn} onPress={handleSaveReceipt}>
                <Icon name="download-outline" size={20} color="#FFF" />
                <Text style={styles.saveReceiptBtnText}>Save Receipt to Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveReceiptBtn, { marginTop: 8, backgroundColor: '#374151' }]} onPress={handlePrintBill}>
                <Icon name="print-outline" size={20} color="#FFF" />
                <Text style={styles.saveReceiptBtnText}>Print Bill</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.primaryDark,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.surface,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a0aab5',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  phoneText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  viewDetailsText: {
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 16,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 4,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalContent: {
    padding: 16,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  modalValueSub: {
    fontSize: 14,
    color: colors.textMuted,
  },
  modalRouteBtn: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  modalRouteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemsTable: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCol: {
    fontSize: 14,
    color: colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  modalBottomBar: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20,
  },
  saveReceiptBtn: {
    backgroundColor: colors.primaryDark,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveReceiptBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
