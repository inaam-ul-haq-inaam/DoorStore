import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CustomerStackNavigationProp } from '../../../navigation/types';
import { useCart } from '../../../context/CartContext';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { firebaseDb } from '../../../services/firebase';
import { calculateDistance } from '../../../utils/distanceUtils';

export const useCartController = () => {
  const navigation = useNavigation<CustomerStackNavigationProp>();
  const { 
    cartItems, 
    subTotal, 
    increaseQuantity: handleIncrease, 
    decreaseQuantity: handleDecrease 
  } = useCart();

  const [calculatingFee, setCalculatingFee] = useState(true);
  const [dynamicDeliveryFee, setDynamicDeliveryFee] = useState(0);
  const [distance, setDistance] = useState(0);
  const [shopAddress, setShopAddress] = useState('');

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need your location to calculate the delivery fee.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchFee = async () => {
      // 1. Fetch Shop Location and Delivery Settings
      let shopLocation = null;
      let deliverySettings = { base_fee: 0, per_km_fee: 0 };
      
      try {
        const adminSnapshot = await firebaseDb.collection('users')
          .where('role', 'in', ['admin', 'shopkeeper'])
          .limit(1)
          .get();

        if (!adminSnapshot.empty) {
          const adminData = adminSnapshot.docs[0].data();
          if (adminData.shop_location) {
            shopLocation = adminData.shop_location;
            if (isMounted) setShopAddress(shopLocation.address || '');
          }
          if (adminData.delivery_settings) deliverySettings = adminData.delivery_settings;
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }

      if (!shopLocation) {
        if (isMounted) {
          setDynamicDeliveryFee(0);
          setCalculatingFee(false);
        }
        return;
      }

      // 2. Get Buyer Location
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        if (isMounted) {
          Alert.alert('Permission Denied', 'Using default base fee. Cannot calculate distance.');
          setDynamicDeliveryFee(Number(deliverySettings.base_fee) || 0);
          setCalculatingFee(false);
        }
        return;
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          if (!isMounted) return;
          const { latitude, longitude } = position.coords;
          
          try {
            // 3. Calculate Distance using OpenRouteService API
            const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjE4OTE1ZTE5ZTQ5NzQxYjc5MWNhZDI0NjMxNjUyNGM1IiwiaCI6Im11cm11cjY0In0=';
            
            // Note: ORS requires coordinates in [Longitude, Latitude] format
            const startStr = `${shopLocation.longitude},${shopLocation.latitude}`;
            const endStr = `${longitude},${latitude}`;
            
            const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${startStr}&end=${endStr}`);
            
            let distKm = 0;
            if (response.ok) {
              const data = await response.json();
              if (data.features && data.features.length > 0) {
                const distMeters = data.features[0].properties.summary.distance;
                distKm = distMeters / 1000;
              }
            } else {
              // Fallback to straight line distance if ORS fails
              console.warn("ORS API Failed, falling back to straight-line distance.");
              distKm = calculateDistance(latitude, longitude, shopLocation.latitude, shopLocation.longitude);
            }
            
            if (!isMounted) return;
            setDistance(distKm);

            const base = Number(deliverySettings.base_fee) || 0;
            const perKm = Number(deliverySettings.per_km_fee) || 0;
            const calculatedFee = base + (distKm * perKm);

            setDynamicDeliveryFee(Math.round(calculatedFee));
            setCalculatingFee(false);
          } catch (error) {
            console.error("Error calculating dynamic delivery fee", error);
            if (isMounted) {
              setDynamicDeliveryFee(Number(deliverySettings.base_fee) || 0);
              setCalculatingFee(false);
            }
          }
        },
        (error) => {
          console.error("GPS error", error);
          if (isMounted) {
            Alert.alert('GPS Error', 'Could not get your location. Using base fee.');
            setDynamicDeliveryFee(Number(deliverySettings.base_fee) || 0);
            setCalculatingFee(false);
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    if (cartItems.length > 0) {
      setCalculatingFee(true);
      fetchFee();
    } else {
      setCalculatingFee(false);
      setDynamicDeliveryFee(0);
    }

    return () => { isMounted = false; };
  }, [cartItems.length]);

  const handleCheckout = () => {
    navigation.navigate('Checkout', { deliveryFee: dynamicDeliveryFee, distance });
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  const grandTotal = subTotal + dynamicDeliveryFee;

  return {
    cartItems,
    subTotal,
    dynamicDeliveryFee,
    grandTotal,
    calculatingFee,
    distance,
    shopAddress,
    handleIncrease,
    handleDecrease,
    handleCheckout,
    handleGoBack,
  };
};
