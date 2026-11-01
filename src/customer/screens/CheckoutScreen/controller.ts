import { useState, useEffect, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CustomerStackParamList, CustomerStackNavigationProp } from '../../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseDb, firebaseAuth } from '../../../services/firebase';
import { useCart } from '../../../context/CartContext';
import { useCustomerProfileCache } from '../../../hooks/useCustomerProfileCache';
import { useAuth } from '../../../context/AuthContext';
import { normalizePhone } from '../../../utils/phoneUtils';
import { readDeliveryConfig } from '../../../services/deliveryConfig';
import { calculateDistance } from '../../../utils/distanceUtils';
import { notifyStaffOfNewOrder } from '../../../services/orderNotification';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjE4OTE1ZTE5ZTQ5NzQxYjc5MWNhZDI0NjMxNjUyNGM1IiwiaCI6Im11cm11cjY0In0=';

export const useCheckoutController = () => {
  const navigation = useNavigation<CustomerStackNavigationProp>();
  const route = useRoute<RouteProp<CustomerStackParamList, 'Checkout'>>();
  const { cartItems, total: subTotal, clearCart } = useCart();

  // Delivery fee & distance — initially from route params (GPS-based),
  // but updated when user picks a location from autocomplete.
  const [deliveryFee, setDeliveryFee] = useState(route.params?.deliveryFee || 0);
  const [distance, setDistance] = useState(route.params?.distance || 0);
  const [deliveryFeePending, setDeliveryFeePending] = useState(route.params?.deliveryFeePending ?? false);
  const [recalculating, setRecalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryLat, setDeliveryLat] = useState<number | null>(route.params?.latitude ?? null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(route.params?.longitude ?? null);
  const [lastSelectedLocation, setLastSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBillModalVisible, setBillModalVisible] = useState(false);
  const [fetchingGps, setFetchingGps] = useState(false);
  const [isMapModalVisible, setMapModalVisible] = useState(false);

  const grandTotal = subTotal + deliveryFee;

  const { profile } = useCustomerProfileCache();
  const { userProfile } = useAuth();

  useEffect(() => {
    if (profile.fullName) setFullName(profile.fullName);
    if (profile.address) {
      setAddress(profile.address);
      // If we don't have GPS coords from cart, profile address must be confirmed via autocomplete
      if (!route.params?.latitude || !route.params?.longitude) {
        setDeliveryLat(null);
        setDeliveryLng(null);
      }
    }
  }, [profile, route.params?.latitude, route.params?.longitude]);

  const fetchWithTimeout = (url: string, timeoutMs = 8000) => {
    return Promise.race([
      fetch(url),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('Slow or weak internet connection.')), timeoutMs)
      ),
    ]);
  };

  /**
   * Recalculate delivery fee when user selects an address from the
   * LocationAutocomplete dropdown — coordinates are now accurate.
   */
  const handleLocationSelect = useCallback(async (lat: number, lng: number, formattedAddress: string) => {
    setAddress(formattedAddress);
    setDeliveryLat(lat);
    setDeliveryLng(lng);
    setLastSelectedLocation({ lat, lng, address: formattedAddress });
    setRecalculating(true);
    setCalculationError(null);

    try {
      const config = await readDeliveryConfig();
      const shopLocation = config.shopLocation;
      const deliverySettings = config.settings || { base_fee: 0, per_km_fee: 0 };
      const baseFee = Number(deliverySettings.base_fee) || 0;
      const perKm = Number(deliverySettings.per_km_fee) || 0;

      if (!shopLocation) {
        setDeliveryLat(null);
        setDeliveryLng(null);
        setDeliveryFee(0);
        setCalculationError('Could not load shop delivery settings. Please check your internet connection.');
        setRecalculating(false);
        Alert.alert(
          'Please Check Your Internet',
          'Could not calculate delivery charges due to slow or weak internet. Please check your connection and try again.'
        );
        return;
      }

      let distKm = 0;
      try {
        const startStr = `${shopLocation.longitude},${shopLocation.latitude}`;
        const endStr = `${lng},${lat}`;
        const response = await fetchWithTimeout(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${startStr}&end=${endStr}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.features?.length > 0) {
            distKm = data.features[0].properties.summary.distance / 1000;
          }
        } else {
          distKm = calculateDistance(lat, lng, shopLocation.latitude, shopLocation.longitude);
        }
      } catch (orsErr: any) {
        console.warn('ORS fetch failed, using straight-line fallback:', orsErr.message);
        distKm = calculateDistance(lat, lng, shopLocation.latitude, shopLocation.longitude);
      }

      if (distKm <= 0 && calculateDistance(lat, lng, shopLocation.latitude, shopLocation.longitude) > 0) {
        distKm = calculateDistance(lat, lng, shopLocation.latitude, shopLocation.longitude);
      }

      if (distKm <= 0) {
        throw new Error('Distance calculation failed. Please check your internet connection.');
      }

      const calculatedFee = baseFee + (distKm * perKm);
      setDistance(distKm);
      setDeliveryFee(Math.round(calculatedFee));
      setDeliveryFeePending(false);
      setCalculationError(null);
    } catch (error: any) {
      console.error('Error recalculating delivery fee:', error);
      setDeliveryLat(null);
      setDeliveryLng(null);
      setDeliveryFee(0);
      setCalculationError('Slow internet: Could not calculate delivery charges. Please check your internet connection and re-select your address.');
      Alert.alert(
        'Please Check Your Internet',
        'Could not calculate delivery charges due to slow or weak internet. Please check your internet connection and tap on your address to try again.'
      );
    } finally {
      setRecalculating(false);
    }
  }, []);

  const handleAddressTextChange = (text: string) => {
    setAddress(text);
    // Unset coords if user manually types — they must select from autocomplete suggestions
    setDeliveryLat(null);
    setDeliveryLng(null);
    setCalculationError(null);
  };

  const retryRecalculate = () => {
    if (lastSelectedLocation) {
      handleLocationSelect(lastSelectedLocation.lat, lastSelectedLocation.lng, lastSelectedLocation.address);
    } else if (deliveryLat && deliveryLng) {
      handleLocationSelect(deliveryLat, deliveryLng, address);
    } else {
      Alert.alert('Select Address', 'Please select your address from the search suggestions or use GPS.');
    }
  };

  /**
   * Auto-detect location via device GPS
   */
  const handleUseCurrentLocation = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'DoorStore needs access to your location to set accurate delivery address and charges.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Location permission is required to detect your location automatically.');
        return;
      }
    }

    setFetchingGps(true);
    Geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=a0d829d050494d49b5bc7d3aff706447&format=json`
          );
          let detectedAddress = 'Current Location, Pakistan';
          if (res.ok) {
            const data = await res.json();
            const first = data.results && data.results[0];
            if (first) {
              const parts = [
                first.street || first.road || first.name,
                first.suburb || first.neighbourhood || first.district,
                first.city || first.county || first.state,
              ].filter(Boolean);

              if (parts.length > 0) {
                detectedAddress = parts.join(', ');
              } else if (first.formatted) {
                detectedAddress = first.formatted;
              }
            }
          }
          await handleLocationSelect(latitude, longitude, detectedAddress);
        } catch {
          await handleLocationSelect(latitude, longitude, 'Current Location, Pakistan');
        } finally {
          setFetchingGps(false);
        }
      },
      (err) => {
        console.warn('GPS error:', err);
        setFetchingGps(false);
        Alert.alert('GPS Error', 'Could not detect your location. Please ensure Location/GPS is turned ON in your device settings.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  /**
   * Confirms location adjusted on the Leaflet map modal
   */
  const handleMapLocationConfirm = async (lat: number, lng: number, formattedAddress: string) => {
    await handleLocationSelect(lat, lng, formattedAddress);
  };

  const handlePlaceOrderClick = () => {
    if (!fullName.trim() || !address.trim()) {
      Alert.alert('Incomplete Details', 'Please enter your Name and Address.');
      return;
    }

    // Must have coordinates verified from autocomplete / GPS
    if (!deliveryLat || !deliveryLng) {
      Alert.alert(
        'Address Selection Required',
        'Please search and select your complete delivery address from the suggestions so that accurate delivery charges can be applied.'
      );
      return;
    }

    if (recalculating) {
      Alert.alert('Please Wait', 'Delivery charges are being calculated...');
      return;
    }

    if (calculationError) {
      Alert.alert(
        'Please Check Your Internet',
        'Delivery charges could not be calculated due to slow or weak internet. Please check your internet connection and tap on your address to recalculate.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: retryRecalculate },
        ]
      );
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
        customer_phone: normalizePhone(userProfile?.phone || user.phoneNumber) || 'Unknown',
        delivery_address: address.trim(),
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
        items: cartItems,
        total_amount: grandTotal,
        totalAmount: grandTotal,
        delivery_fee: deliveryFee,
        distance_km: distance,
        status: 'incoming', 
        created_at: new Date().toISOString(), 
        payment_method: 'COD',
        is_rated: false
      };

      const newOrderRef = firebaseDb.collection('orders').doc();

      const firestorePromise = newOrderRef.set(orderData);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout connecting to server. Please check your internet.')), 10000);
      });

      await Promise.race([firestorePromise, timeoutPromise]);

      // Order save ho chuka — staff (admin/shopkeeper) devices ko push
      // bhejo (DoorStore backend via Vercel). Fire-and-forget: notification
      // network delay order success screen ko kabhi block nahi karega.
      notifyStaffOfNewOrder(newOrderRef.id);

      clearCart();
      setBillModalVisible(false);
      setIsSubmitting(false);
      navigation.navigate('OrderSuccess', { orderId: newOrderRef.id });

    } catch (error: any) {
      console.error('Order placement error:', error);
      Alert.alert('Error', error.message || 'Failed to place order. Please check your internet and try again.');
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
    handleAddressTextChange,
    city: '',
    setCity: () => {},
    paymentMethod: 'COD',
    setPaymentMethod: () => {},
    isSubmitting,
    isBillModalVisible,
    setBillModalVisible,
    subTotal,
    deliveryFee,
    deliveryFeePending,
    recalculating,
    calculationError,
    retryRecalculate,
    deliveryLat,
    deliveryLng,
    grandTotal,
    cartItems,
    handlePlaceOrderClick,
    handleLocationSelect,
    confirmOrder,
    handleGoBack,
    fetchingGps,
    handleUseCurrentLocation,
    isMapModalVisible,
    setMapModalVisible,
    handleMapLocationConfirm,
  };
};
