import { useState, useRef } from 'react';
import { firebaseDb, firebaseAuth } from '../../../services/firebase';
import { useOrdersFetch } from '../../../hooks/useOrdersFetch';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  status: 'incoming' | 'pending' | 'on_delivery' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  items: any[];
  customer_phone?: string;
  delivery_address?: string;
  delivery_fee?: number | 'Pending';
  distance_km?: number;
  is_rated?: boolean;
  rating?: number;
  review_text?: string;
}

export const useOrdersController = () => {
  const user = firebaseAuth.currentUser;

  const { orders, loading } = useOrdersFetch<Order>({
    filters: [{ field: 'customer_id', operator: '==', value: user?.uid }],
  });

  const [selectedTab, setSelectedTab] = useState<'Active' | 'Delivered' | 'Cancelled'>('Active');

  const [selectedOrderToRate, setSelectedOrderToRate] = useState<Order | null>(null);
  const [isRatingModalVisible, setRatingModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);
  const trackingOrder = selectedTrackingOrder
    ? orders.find(order => order.id === selectedTrackingOrder.id) ?? selectedTrackingOrder
    : null;

  const filteredOrders = orders.filter(order => {
    if (selectedTab === 'Active') {
      return order.status === 'incoming' || order.status === 'pending' || order.status === 'on_delivery';
    }
    if (selectedTab === 'Delivered') {
      return order.status === 'completed';
    }
    return order.status === 'cancelled';
  });

  const cancelOrder = async (order: Order) => {
    if (!user) {
      Alert.alert('Sign-in required', 'Please sign in to cancel your order.');
      return;
    }

    setCancellingOrderId(order.id);
    try {
      const orderRef = firebaseDb.collection('orders').doc(order.id);
      await firebaseDb.runTransaction(async transaction => {
        const orderSnapshot = await transaction.get(orderRef);
        const latestOrder = orderSnapshot.data();
        if (!orderSnapshot.exists || !latestOrder) {
          throw new Error('This order could not be found.');
        }
        if (latestOrder.customer_id !== user.uid) {
          throw new Error('You can only cancel your own orders.');
        }
        if (latestOrder.status !== 'incoming' && latestOrder.status !== 'pending') {
          throw new Error('This order can no longer be cancelled.');
        }

        transaction.update(orderRef, { status: 'cancelled' });
      });
      Alert.alert('Order cancelled', 'Your order has been cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling order', error);
      Alert.alert(
        'Unable to cancel order',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  const confirmCancelOrder = (order: Order) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'Keep Order', style: 'cancel' },
        { text: 'Cancel Order', style: 'destructive', onPress: () => cancelOrder(order) },
      ]
    );
  };

  const openOrderTracking = (order: Order) => {
    setSelectedTrackingOrder(order);
  };

  const closeOrderTracking = () => {
    setSelectedTrackingOrder(null);
  };

  const openRatingModal = (order: Order) => {
    setSelectedOrderToRate(order);
    setRating(0);
    setReviewText('');
    setRatingModalVisible(true);
  };

  const closeRatingModal = () => {
    setRatingModalVisible(false);
    setSelectedOrderToRate(null);
  };

  const handleSubmitRating = async () => {
    if (!selectedOrderToRate || rating === 0) return;
    try {
      await firebaseDb.collection('orders').doc(selectedOrderToRate.id).update({
        is_rated: true,
        rating: rating,
        review_text: reviewText,
      });

      if (selectedOrderToRate.items && Array.isArray(selectedOrderToRate.items)) {
        for (const item of selectedOrderToRate.items) {
          if (item.id) {
            try {
              const prodRef = firebaseDb.collection('products').doc(item.id);
              const prodDoc = await prodRef.get();
              if (prodDoc.exists()) {
                const prodData = prodDoc.data();
                const currentCount = typeof prodData?.rating_count === 'number' ? prodData.rating_count : 0;
                const currentRating = typeof prodData?.rating === 'number' ? prodData.rating : 0;

                const newCount = currentCount + 1;
                const newTotal = (currentRating * currentCount) + rating;
                const newAvg = Number((newTotal / newCount).toFixed(1));

                await prodRef.update({
                  rating: newAvg,
                  rating_count: newCount
                });
              }
            } catch(e) {
              console.log('Failed to propagate rating to product', item.id, e);
            }
          }
        }
      }

      closeRatingModal();
    } catch (error) {
      console.log('Error saving rating', error);
    }
  };
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const receiptViewRef = useRef<any>(null);

  const openReceipt = (order: Order) => {
    setReceiptOrder(order);
  };

  const closeReceipt = () => {
    setReceiptOrder(null);
  };

  const hasAndroidPermission = async () => {
    if (Platform.OS !== 'android') return true;
    if (Platform.Version >= 29) return true;
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) return true;
    const status = await PermissionsAndroid.request(permission);
    return status === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handleSaveReceipt = async () => {
    try {
      if (!receiptViewRef.current) return;
      const hasPerm = await hasAndroidPermission();
      if (!hasPerm) {
        Alert.alert('Permission Denied', 'Storage permission is required to save the receipt.');
        return;
      }
      const uri = await captureRef(receiptViewRef, { format: 'png', quality: 1 });
      await CameraRoll.saveAsset(uri, { type: 'photo' });
      Alert.alert('Success', 'Receipt saved to gallery!');
    } catch (error) {
      console.log('Error saving receipt:', error);
      Alert.alert('Error', 'Failed to save receipt.');
    }
  };

  return { 
    orders, loading, selectedTab, setSelectedTab, filteredOrders,
    cancellingOrderId, confirmCancelOrder, trackingOrder, openOrderTracking, closeOrderTracking,
    selectedOrderToRate, isRatingModalVisible, rating, setRating, reviewText, setReviewText,
    openRatingModal, closeRatingModal, handleSubmitRating,
    receiptOrder, openReceipt, closeReceipt, receiptViewRef, handleSaveReceipt
  };
};
