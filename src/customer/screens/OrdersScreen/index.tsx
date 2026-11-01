import React from 'react';
import { View, Text, FlatList, StatusBar, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Icon from 'react-native-vector-icons/Ionicons';
import { useOrdersController, Order } from './controller';
import { styles } from './styles';
import { colors } from '../../../theme/colors';
import { ScreenLoader } from '../../../components/ScreenLoader';
import { EmptyState } from '../../../components/EmptyState';
import { RatingModal } from '../../../components/RatingModal';
import { formatOrderItemQuantity } from '../../../utils/itemQuantity';

export const OrdersScreen = () => {
  const { 
    loading, selectedTab, setSelectedTab, filteredOrders,
    cancellingOrderId, confirmCancelOrder,
    trackingOrder, openOrderTracking, closeOrderTracking,
    selectedOrderToRate, isRatingModalVisible, rating, setRating, reviewText, setReviewText,
    openRatingModal, closeRatingModal, handleSubmitRating,
    receiptOrder, openReceipt, closeReceipt, receiptViewRef, handleSaveReceipt
  } = useOrdersController();

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'incoming':
      case 'pending':
        return { backgroundColor: '#F59E0B' }; 
      case 'preparing':
      case 'accepted': 
      case 'on_delivery':
        return { backgroundColor: '#3B82F6' }; 
      case 'completed':
      case 'delivered':
        return { backgroundColor: '#10B981' }; 
      case 'cancelled':
        return { backgroundColor: '#EF4444' };
      default:
        return { backgroundColor: '#9CA3AF' }; 
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'incoming': return 'Pending';
      case 'pending': return 'Accepted';
      case 'on_delivery': return 'On the Way';
      case 'completed': return 'Received';
      case 'cancelled': return 'Cancelled';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    const date = new Date(item.created_at);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    const itemCount = Array.isArray(item.items)
      ? item.items.reduce((sum: number, i: any) => sum + Number(i?.quantity ?? 0), 0)
      : 0;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`View tracking for order ${item.id.slice(0, 8)}`}
          onPress={() => openOrderTracking(item)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.orderId}>Order #{item.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardBody}>
            <View>
              <Text style={styles.itemsText}>{itemCount} Items</Text>
              <Text style={styles.totalAmount}>Rs. {item.total_amount.toFixed(2)}</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <View style={[styles.badge, getStatusBadgeStyles(item.status), { marginBottom: item.status === 'completed' ? 8 : 0 }]}>
                <Text style={styles.badgeText}>{getStatusLabel(item.status)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.viewTrackingRow}>
            <Text style={styles.viewTrackingText}>Tap to track order</Text>
            <Icon name="chevron-forward" size={16} color={colors.primaryDark} />
          </View>
        </TouchableOpacity>

        {item.status === 'completed' && (
          item.is_rated ? (
            <View style={styles.ratedRow}>
              <Icon name="star" size={14} color="#FBBF24" />
              <Text style={styles.ratedText}>{item.rating} Rated</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => openRatingModal(item)} style={styles.rateOrderButton}>
              <Text style={styles.rateOrderText}>Rate Order</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Active' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('Active')}
        >
          <Text style={[styles.tabText, selectedTab === 'Active' && styles.tabTextActive]}>Active</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, selectedTab === 'Delivered' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('Delivered')}
        >
          <Text style={[styles.tabText, selectedTab === 'Delivered' && styles.tabTextActive]}>Received</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Cancelled' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('Cancelled')}
        >
          <Text style={[styles.tabText, selectedTab === 'Cancelled' && styles.tabTextActive]}>Cancelled</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ScreenLoader />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={renderOrderCard}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title="No Orders Yet"
              subtitle="Looks like you haven't placed any orders. Start shopping to see your history here!"
              iconSize={80}
              iconColor="#D1D5DB"
            />
          }
        />
      )}

      <RatingModal
        visible={isRatingModalVisible}
        orderId={selectedOrderToRate?.id}
        rating={rating}
        setRating={setRating}
        reviewText={reviewText}
        setReviewText={setReviewText}
        onSubmit={handleSubmitRating}
        onCancel={closeRatingModal}
      />

      <Modal visible={!!trackingOrder} transparent animationType="slide" onRequestClose={closeOrderTracking}>
        <View style={styles.trackingOverlay}>
          <TouchableOpacity style={styles.trackingBackdrop} activeOpacity={1} onPress={closeOrderTracking} />
          {trackingOrder && (
            <View style={styles.trackingSheet}>
              <View style={styles.trackingHandle} />
              <View style={styles.trackingHeader}>
                <View>
                  <Text style={styles.trackingTitle}>Order Tracking</Text>
                  <Text style={styles.trackingOrderId}>#{trackingOrder.id.slice(0, 8).toUpperCase()}</Text>
                </View>
                <View style={[styles.badge, getStatusBadgeStyles(trackingOrder.status)]}>
                  <Text style={styles.badgeText}>{getStatusLabel(trackingOrder.status)}</Text>
                </View>
              </View>

              {trackingOrder.status === 'cancelled' ? (
                <View style={styles.cancelledNotice}>
                  <Icon name="close-circle" size={22} color="#DC2626" />
                  <Text style={styles.cancelledNoticeText}>This order was cancelled.</Text>
                </View>
              ) : (
                <View style={styles.trackingTimeline}>
                  <TrackingStep active title="Order Placed" description="We received your order." />
                  <TrackingStep
                    active={['pending', 'on_delivery', 'completed'].includes(trackingOrder.status)}
                    title="Accepted"
                    description="The shopkeeper accepted your order."
                  />
                  <TrackingStep
                    active={['on_delivery', 'completed'].includes(trackingOrder.status)}
                    title="On the Way"
                    description="Your order is on the way."
                  />
                  <TrackingStep
                    active={trackingOrder.status === 'completed'}
                    title="Received"
                    description="Your order has arrived!"
                    last
                  />
                </View>
              )}

              <View style={styles.trackingSummary}>
                <Text style={styles.trackingSummaryLabel}>
                  {(Array.isArray(trackingOrder.items)
                    ? trackingOrder.items.reduce((count, product) => count + Number(product?.quantity ?? 0), 0)
                    : 0)} items
                </Text>
                <Text style={styles.trackingSummaryAmount}>Rs. {Number(trackingOrder.total_amount ?? 0).toFixed(2)}</Text>
              </View>

              {(trackingOrder.status === 'incoming' || trackingOrder.status === 'pending') && (
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={cancellingOrderId === trackingOrder.id}
                  onPress={() => confirmCancelOrder(trackingOrder)}
                  style={styles.cancelOrderButton}
                >
                  <Text style={styles.cancelOrderButtonText}>
                    {cancellingOrderId === trackingOrder.id ? 'Cancelling…' : 'Cancel Order'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.viewReceiptButton}
                onPress={() => {
                  closeOrderTracking();
                  if (trackingOrder) openReceipt(trackingOrder);
                }}
              >
                <Icon name="receipt-outline" size={18} color={colors.primaryDark} />
                <Text style={styles.viewReceiptButtonText}>View E-Receipt</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeTrackingButton} onPress={closeOrderTracking}>
                <Text style={styles.closeTrackingText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* E-Receipt Modal */}
      <Modal visible={!!receiptOrder} transparent animationType="fade" onRequestClose={closeReceipt}>
        <View style={styles.receiptOverlay}>
          <ScrollView contentContainerStyle={styles.receiptModalContent} showsVerticalScrollIndicator={false}>
            {receiptOrder && (() => {
              const receiptItems = Array.isArray(receiptOrder.items) ? receiptOrder.items : [];
              const totalAmount = Number(receiptOrder.total_amount ?? 0);
              const deliveryFee = receiptOrder.delivery_fee;
              const numericDeliveryFee = typeof deliveryFee === 'number' ? deliveryFee : 0;
              const subtotal = deliveryFee === 'Pending' ? totalAmount : Math.max(0, totalAmount - numericDeliveryFee);
              const formatCurrency = (value: number) => `Rs.${value.toLocaleString('en-PK')}`;
              const createdAt = receiptOrder.created_at ? new Date(receiptOrder.created_at) : null;
              const receiptDate = createdAt && !Number.isNaN(createdAt.getTime())
                ? createdAt.toLocaleString('en-GB', {
                    day: 'numeric', month: 'numeric', year: 'numeric',
                    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
                  })
                : 'N/A';

              return (
                <>
                  <ViewShot ref={receiptViewRef} style={styles.receiptPaper} options={{ format: 'png', quality: 1 }}>
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
                        <Text style={styles.receiptValueText}>#{receiptOrder.id.slice(0, 8).toUpperCase()}</Text>
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
                        <Text style={styles.receiptValueText}>{receiptOrder.customer_name || 'N/A'}</Text>
                      </View>
                      <View style={styles.receiptRowInfo}>
                        <Text style={styles.receiptLabelText}>Phone:</Text>
                        <Text style={styles.receiptValueText}>{receiptOrder.customer_phone || 'N/A'}</Text>
                      </View>
                      <View style={styles.receiptRowInfo}>
                        <Text style={styles.receiptLabelText}>Address:</Text>
                        <Text style={styles.receiptValueText}>{receiptOrder.delivery_address || 'N/A'}</Text>
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
                      {!!receiptOrder.distance_km && (
                        <View style={styles.receiptRowInfo}>
                          <Text style={styles.receiptLabelText}>Distance:</Text>
                          <Text style={styles.receiptValueText}>{Number(receiptOrder.distance_km).toFixed(2)} KM</Text>
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

                  <TouchableOpacity style={styles.receiptCloseBtn} onPress={closeReceipt}>
                    <Text style={styles.receiptCloseBtnText}>Close</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
};

const TrackingStep = ({
  active,
  title,
  description,
  last = false,
}: {
  active: boolean;
  title: string;
  description: string;
  last?: boolean;
}) => (
  <View style={styles.trackingStep}>
    <View style={styles.trackingStepRail}>
      <View style={[styles.trackingDot, active ? styles.trackingDotActive : styles.trackingDotInactive]} />
      {!last && <View style={styles.trackingLine} />}
    </View>
    <View style={styles.trackingStepText}>
      <Text style={active ? styles.trackingStepTitleActive : styles.trackingStepTitle}>{title}</Text>
      <Text style={styles.trackingStepDescription}>{description}</Text>
    </View>
  </View>
);
