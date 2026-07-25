import React from 'react';
import { View, Text, FlatList, StatusBar, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useOrdersController, Order } from './controller';
import { styles } from './styles';
import { colors } from '../../../theme/colors';
import { ScreenLoader } from '../../../components/ScreenLoader';
import { EmptyState } from '../../../components/EmptyState';
import { RatingModal } from '../../../components/RatingModal';

export const OrdersScreen = () => {
  const { 
    loading, selectedTab, setSelectedTab, filteredOrders,
    selectedOrderToRate, isRatingModalVisible, rating, setRating, reviewText, setReviewText,
    openRatingModal, closeRatingModal, handleSubmitRating
  } = useOrdersController();

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'incoming':
      case 'pending':
        return { backgroundColor: '#F59E0B' }; // Orange/Yellow
      case 'preparing':
      case 'accepted': // If client meant this, we just map it
        return { backgroundColor: '#3B82F6' }; // Blue
      case 'completed':
      case 'delivered':
        return { backgroundColor: '#10B981' }; // Green
      default:
        return { backgroundColor: '#9CA3AF' }; // Gray
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'incoming': return 'Pending';
      case 'pending': return 'Preparing';
      case 'completed': return 'Delivered';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    const date = new Date(item.created_at);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    const itemCount = item.items ? item.items.reduce((sum: number, i: any) => sum + i.quantity, 0) : 0;

    return (
      <View style={styles.card}>
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

            {item.status === 'completed' && (
              item.is_rated ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="star" size={14} color="#FBBF24" />
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#FBBF24', marginLeft: 4 }}>
                    {item.rating} Rated
                  </Text>
                </View>
              ) : (
                <TouchableOpacity onPress={() => openRatingModal(item)} style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.primaryDark }}>Rate Order</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {/* Tabs Container */}
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
          <Text style={[styles.tabText, selectedTab === 'Delivered' && styles.tabTextActive]}>Delivered</Text>
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

      {/* Rating Modal */}
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

    </View>
  );
};
