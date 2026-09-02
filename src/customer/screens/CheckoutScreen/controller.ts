import { useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CustomerStackParamList, CustomerStackNavigationProp } from '../../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseDb, firebaseAuth } from '../../../services/firebase';
import { useCart } from '../../../context/CartContext';
import { useCustomerProfileCache } from '../../../hooks/useCustomerProfileCache';
import { Alert } from 'react-native';

export const useCheckoutController = () => {
  const navigation = useNavigation<CustomerStackNavigationProp>();
  const route = useRoute<RouteProp<CustomerStackParamList, 'Checkout'>>();
  const { cartItems, total: subTotal, clearCart } = useCart();

  const deliveryFee = route.params?.deliveryFee || 0;
  const grandTotal = subTotal + deliveryFee;

  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBillModalVisible, setBillModalVisible] = useState(false);

  const { profile } = useCustomerProfileCache();


  useEffect(() => {
    if (profile.fullName) setFullName(profile.fullName);
    if (profile.address) setAddress(profile.address);
  }, [profile]);

  const handlePlaceOrderClick = () => {
    if (!fullName.trim() || !address.trim()) {
      Alert.alert('Incomplete Details', 'Please enter your Name and Address.');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      return;
    }

    const user = firebaseAuth.currentUser;
    if (!user) {
      Alert.alert('Auth Error', 'You must be logged in to place an order.');
      return;
    }


    setBillModalVisible(true);
  };

  const confirmOrder = async () => {
    const user = firebaseAuth.currentUser;
    if (!user) return;

    setIsSubmitting(true);

    try {

      await AsyncStorage.setItem('@customer_profile', JSON.stringify({ fullName: fullName.trim(), address: address.trim() }));


      const orderData = {
        customer_id: user.uid,
        customer_name: fullName.trim(),
        customer_phone: user.phoneNumber || 'Unknown',
        delivery_address: address.trim(),
        items: cartItems,
        total_amount: grandTotal,
        delivery_fee: deliveryFee,
        distance_km: route.params?.distance || 0,
        status: 'incoming', 
        created_at: new Date().toISOString(), 
        payment_method: 'COD',
        is_rated: false
      };


      const newOrderRef = firebaseDb.collection('orders').doc();

      const firestorePromise = newOrderRef.set(orderData);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout connecting to server.')), 10000);
      });

      await Promise.race([firestorePromise, timeoutPromise]);


      clearCart();
      setBillModalVisible(false);
      setIsSubmitting(false);
      navigation.navigate('OrderSuccess', { orderId: newOrderRef.id });

    } catch (error: any) {
      console.error('Order placement error:', error);
      Alert.alert('Error', error.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
      setBillModalVisible(false);
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };


  return {
    fullName,
    setFullName,
    phone: '', 
    setPhone: () => {},
    address,
    setAddress,
    city: '',
    setCity: () => {},
    paymentMethod: 'COD',
    setPaymentMethod: () => {},
    isSubmitting,
    isBillModalVisible,
    setBillModalVisible,
    subTotal,
    deliveryFee,
    grandTotal,
    cartItems,
    handlePlaceOrderClick,
    confirmOrder,
    handleGoBack,
  };
};
