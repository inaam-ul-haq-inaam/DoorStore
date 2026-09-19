import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CustomerStackNavigationProp } from '../../../navigation/types';
import { useCart } from '../../../context/CartContext';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { readDeliveryConfig } from '../../../services/deliveryConfig';
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

      // Shop location + fees shared config doc (`settings/delivery`) se aate hain.
      // Pehle yahan `users` collection par query thi, jo customer ke liye
      // Firestore rules se reject ho jati thi -> delivery fee hamesha 0.
      const config = await readDeliveryConfig();
      const shopLocation = config.shopLocation;
      const deliverySettings = config.settings || { base_fee: 0, per_km_fee: 0 };

      if (shopLocation?.address && isMounted) {
        setShopAddress(shopLocation.address);
      }

      const baseFee = Number(deliverySettings.base_fee) || 0;

      if (!shopLocation) {
        // Shop location set nahi hui -> sirf base fee lagti hai
        if (isMounted) {
          setDynamicDeliveryFee(baseFee);
          setCalculatingFee(false);
        }
        return;
      }

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        if (isMounted) {
          Alert.alert('Permission Denied', 'Using default base fee. Cannot calculate distance.');
          setDynamicDeliveryFee(baseFee);
          setCalculatingFee(false);
        }
        return;
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          if (!isMounted) return;
          const { latitude, longitude } = position.coords;

          try {

            const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjE4OTE1ZTE5ZTQ5NzQxYjc5MWNhZDI0NjMxNjUyNGM1IiwiaCI6Im11cm11cjY0In0=';

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

              console.warn("ORS API Failed, falling back to straight-line distance.");
              distKm = calculateDistance(latitude, longitude, shopLocation.latitude, shopLocation.longitude);
            }

            if (!isMounted) return;
            setDistance(distKm);

            const perKm = Number(deliverySettings.per_km_fee) || 0;
            const calculatedFee = baseFee + (distKm * perKm);

            setDynamicDeliveryFee(Math.round(calculatedFee));
            setCalculatingFee(false);
          } catch (error) {
            console.error("Error calculating dynamic delivery fee", error);
            if (isMounted) {
              setDynamicDeliveryFee(baseFee);
              setCalculatingFee(false);
            }
          }
        },
        (error) => {
          console.error("GPS error", error);
          if (isMounted) {
            Alert.alert('GPS Error', 'Could not get your location. Using base fee.');
            setDynamicDeliveryFee(baseFee);
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
    navigation.navigate('Checkout', { deliveryFee: dynamicDeliveryFee, distance, deliveryFeePending });
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  const grandTotal = subTotal + dynamicDeliveryFee;

  // Koi fee set na ho (shop ne delivery settings hi nahi bhari) to
  // customer ko "Rs. 0" ke bajaye bata dena behtar hai.
  const deliveryFeePending = !calculatingFee && cartItems.length > 0 && dynamicDeliveryFee <= 0;

  return {
    cartItems,
    subTotal,
    dynamicDeliveryFee,
    grandTotal,
    calculatingFee,
    deliveryFeePending,
    distance,
    shopAddress,
    handleIncrease,
    handleDecrease,
    handleCheckout,
    handleGoBack,
  };
};
