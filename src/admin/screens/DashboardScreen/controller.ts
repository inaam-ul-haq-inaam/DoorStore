import { useNavigation } from '@react-navigation/native';
import { AdminDrawerNavigationProp } from '../../../navigation/types';
import { firebaseDb, firebaseAuth } from '../../../services/firebase';
import { useStoreStatus } from '../../../hooks/useStoreStatus';
import { useShopLocationCache } from '../../../hooks/useShopLocationCache';
import { Alert } from 'react-native';
import { useState, useEffect } from 'react';

export const useAdminDashboardController = () => {
  const navigation = useNavigation<AdminDrawerNavigationProp>();
  const { isStoreOpen, setIsStoreOpen } = useStoreStatus();
  const { shopLocation, updateLocation } = useShopLocationCache();
  const [stats, setStats] = useState({
    incoming: 0,
    pending: 0,
    completed: 0,
  });
  const [unreadChats, setUnreadChats] = useState(0);
  const [shopRating, setShopRating] = useState<string>('0.0');
  const [totalReviews, setTotalReviews] = useState(0);


  useEffect(() => {
    const unsubscribeOrders = firebaseDb.collection('orders').onSnapshot(snapshot => {
      let incoming = 0;
      let pending = 0;
      let completed = 0;

      let totalRatingValue = 0;
      let ratedOrdersCount = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'incoming') incoming++;
        if (data.status === 'pending') pending++;
        if (data.status === 'completed') completed++;

        if (data.is_rated && typeof data.rating === 'number') {
          totalRatingValue += data.rating;
          ratedOrdersCount++;
        }
      });

      setStats({ incoming, pending, completed });

      if (ratedOrdersCount > 0) {
        setShopRating((totalRatingValue / ratedOrdersCount).toFixed(1));
      } else {
        setShopRating('0.0');
      }
      setTotalReviews(ratedOrdersCount);
    });

    const unsubscribeChats = firebaseDb.collection('chats').onSnapshot(snapshot => {
      let count = 0;
      snapshot.forEach(doc => {
        if (doc.data().unreadByAdmin) count++;
      });
      setUnreadChats(count);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeChats();
    };
  }, []);

  const [isLocationModalVisible, setLocationModalVisible] = useState(false);
  const shopAddress = shopLocation?.address || 'Set Location';

  const handleToggleStore = async (value: boolean) => {
    setIsStoreOpen(value);
    try {
      await firebaseDb.collection('settings').doc('store_status').set({ is_open: value }, { merge: true });
    } catch (error) {
      console.error("Error toggling store status", error);
    }
  };

  const handleStatPress = (status: string) => {
    navigation.navigate('OrdersList', { status });
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const handleManageInventory = () => {
    navigation.navigate('Inventory');
  };

  const handleSetLocation = () => {
    setLocationModalVisible(true);
  };

  const handleLocationSaved = async (newAddress: string) => {
    await updateLocation({ address: newAddress });
    setLocationModalVisible(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await firebaseAuth.signOut();
            } catch (e) {
              console.error('Logout error', e);
            }
          }
        }
      ]
    );
  };

  const handleMessages = () => {
    navigation.navigate('Inbox');
  };

  const handleDeliverySettings = () => {
    navigation.navigate('DeliverySettings');
  };

  const handleReviews = () => {
    navigation.navigate('AdminReviews');
  };

  const handleUsers = () => {
    navigation.navigate('UsersList');
  };

  return { 
    stats, 
    isStoreOpen, 
    isLocationModalVisible,
    setLocationModalVisible,
    shopAddress,
    unreadChats,
    handleToggleStore, 
    handleStatPress, 
    handleAddProduct, 
    handleManageInventory,
    handleMessages,
    handleDeliverySettings,
    handleSetLocation,
    handleLocationSaved,
    handleLogout,
    shopRating,
    totalReviews,
    handleReviews,
    handleUsers
  };
};
