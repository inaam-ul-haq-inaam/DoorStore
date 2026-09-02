import { useState, useEffect } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { AdminDrawerParamList, AdminDrawerNavigationProp } from '../../../navigation/types';
import { firebaseDb } from '../../../services/firebase';
import { Alert } from 'react-native';

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

  const handleAction = async (newStatus: 'pending' | 'completed') => {
    if (!orderDetails) return;

    setIsUpdating(true);
    try {
      await firebaseDb.collection('orders').doc(orderId).update({
        status: newStatus
      });

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

  return { orderDetails, loading, isUpdating, handleAction, handleGoBack };
};
