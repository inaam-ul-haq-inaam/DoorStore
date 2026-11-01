import { useState, useEffect } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { AdminDrawerParamList, AdminDrawerNavigationProp } from '../../../navigation/types';
import { firebaseDb } from '../../../services/firebase';
import { Alert } from 'react-native';
import { notifyBuyerOfStatusChange } from '../../../services/buyerNotification';

export const useOrderDetailsController = () => {
  const route = useRoute<RouteProp<AdminDrawerParamList, 'OrderDetail'>>();
  const navigation = useNavigation<AdminDrawerNavigationProp>();
  const orderId = route.params?.orderId || 'Unknown';

  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (orderId === 'Unknown') {
      setLoading(false);
      return;
    }

    const unsubscribe = firebaseDb.collection('orders').doc(orderId).onSnapshot((doc) => {
      if (doc.exists()) {
        setOrderDetails({ id: doc.id, ...doc.data() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  /**
   * Items sirf tab tabdeel ho sakte hain jab order abhi tak shop par hi ho
   * (incoming/pending). On-delivery ya cancelled order me ched-chad nahi.
   */
  const canEditItems =    orderDetails != null &&    (orderDetails.status === 'incoming' || orderDetails.status === 'pending');

  const canCancelOrder =    orderDetails != null &&    orderDetails.status !== 'cancelled' &&
    orderDetails.status !== 'completed';

  /**
   * Partial cancellation — admin kisi ek item ko order se hata deta hai.
   * total_amount checkout ke formula ke mutabik dobara calculate hota hai:
   *   total = remaining items ka (price x quantity) sum + delivery_fee
   * (firestore.rules me staff ko orders par full update allowed hai).
   */
  const handleRemoveItem = (index: number) => {
    if (!orderDetails || !canEditItems || isUpdating) {
      return;
    }

    const items: any[] = orderDetails.items || [];
    const item = items[index];
    if (!item) {
      return;
    }

    // Aakhri item remove karne ka matlab hi order khaali ho jana hai —
    // us case me poora order cancel karne ka raasta behtar hai.
    if (items.length === 1) {
      Alert.alert(
        'Last Item',
        'This is the only item in the order. Use "Cancel Entire Order" instead.',
      );
      return;
    }

    Alert.alert(
      'Remove Item?',
      `Remove ${item.quantity}x ${item.name} from this order? The total will be recalculated automatically.`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsUpdating(true);
            try {
              const remaining = items.filter((_: any, i: number) => i !== index);
              const itemsSubtotal = remaining.reduce(
                (sum: number, it: any) =>
                  sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
                0,
              );
              const deliveryFee = Number(orderDetails.delivery_fee) || 0;

              const newTotal = itemsSubtotal + deliveryFee;

              await firebaseDb.collection('orders').doc(orderId).update({
                items: remaining,
                total_amount: newTotal,
                totalAmount: newTotal,
              });
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Could not remove the item.');
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ],
    );
  };

  /**
   * Full cancellation — status 'cancelled' par set ho jata hai.
   */
  const handleCancelOrder = () => {
    if (!orderDetails || !canCancelOrder || isUpdating) {
      return;
    }

    const shortId = `#${orderDetails.id.slice(0, 6).toUpperCase()}`;
    Alert.alert(
      'Cancel Entire Order?',
      `${shortId} will be marked as Cancelled. The customer will see this status in their app. This cannot be undone.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            setIsUpdating(true);
            try {
              await firebaseDb.collection('orders').doc(orderId).update({
                status: 'cancelled',
              });
              // Buyer ko cancel ki notification (fire-and-forget)
              notifyBuyerOfStatusChange(orderId, 'cancelled', orderDetails.customer_id);
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Could not cancel the order.');
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ],
    );
  };

  const handleAction = async (newStatus: 'pending' | 'on_delivery' | 'completed') => {
    if (!orderDetails) return;

    setIsUpdating(true);
    try {
      await firebaseDb.collection('orders').doc(orderId).update({
        status: newStatus
      });
      // Buyer ko status change ki notification (fire-and-forget, kabhi throw nahi karta)
      notifyBuyerOfStatusChange(orderId, newStatus, orderDetails.customer_id);
    } catch (error) {
      console.error("Error updating status: ", error);
      Alert.alert("Error", "Could not update order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Dashboard');
    }
  };

  return {
    orderDetails,
    loading,
    isUpdating,
    canEditItems,
    canCancelOrder,
    handleAction,
    handleRemoveItem,
    handleCancelOrder,
    handleGoBack,
  };
};
