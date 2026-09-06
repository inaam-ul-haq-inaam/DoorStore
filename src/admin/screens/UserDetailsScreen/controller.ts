import { useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AdminDrawerParamList, AdminDrawerNavigationProp } from '../../../navigation/types';
import { firebaseDb } from '../../../services/firebase';

export interface UserDetail {
  full_name?: string;
  phone?: string;
  email?: string;
  role?: string;
  created_at?: any;
  address?: string;
}

export const useUserDetailsController = () => {
  const navigation = useNavigation<AdminDrawerNavigationProp>();
  const route = useRoute<RouteProp<AdminDrawerParamList, 'UserDetails'>>();
  const { userId } = route.params;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeUser = firebaseDb
      .collection('users')
      .doc(userId)
      .onSnapshot(doc => {
        if (doc.exists()) {
          setUser(doc.data() as UserDetail);
        } else {
          setUser(null);
        }
        setLoading(false);
      }, error => {
        console.error('User details error:', error);
        setLoading(false);
      });

    const fetchOrderStats = async () => {
      try {
        const snapshot = await firebaseDb
          .collection('orders')
          .where('customer_id', '==', userId)
          .get();

        let count = 0;
        let spent = 0;
        snapshot.forEach(doc => {
          const data = doc.data();
          count++;
          if (typeof data.total_amount === 'number') {
            spent += data.total_amount;
          }
        });
        setOrderCount(count);
        setTotalSpent(spent);
      } catch (e) {
        console.error('Order stats error:', e);
      }
    };

    fetchOrderStats();

    return () => unsubscribeUser();
  }, [userId]);

  const handleGoBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  return { user, userId, orderCount, totalSpent, loading, handleGoBack };
};