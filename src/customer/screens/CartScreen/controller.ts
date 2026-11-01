import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CustomerStackNavigationProp } from '../../../navigation/types';
import { useCart } from '../../../context/CartContext';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { readDeliveryConfig } from '../../../services/deliveryConfig';
import { calculateDistance } from '../../../utils/distanceUtils';

const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjE4OTE1ZTE5ZTQ5NzQxYjc5MWNhZDI0NjMxNjUyNGM1IiwiaCI6Im11cm11cjY0In0=';

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
  const [feeError, setFeeError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

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

  const fetchWithTimeout = (url: string, timeoutMs = 8000) => {
    return Promise.race([
      fetch(url),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('Slow or weak internet connection.')), timeoutMs)
      ),
    ]);
  };

  const calculateFee = async (isMounted = true) => {
    setCalculatingFee(true);
    setFeeError(null);

    try {
      const config = await readDeliveryConfig();
      const shopLocation = config.shopLocation;
      const deliverySettings = config.settings || { base_fee: 0, per_km_fee: 0 };

      if (shopLocation?.address && isMounted) {
        setShopAddress(shopLocation.address);
      }

      const baseFee = Number(deliverySettings.base_fee) || 0;
      const perKm = Number(deliverySettings.per_km_fee) || 0;

      if (!shopLocation) {
        if (isMounted) {
          setFeeError('Could not load shop delivery settings. Please check your internet connection.');
          setDynamicDeliveryFee(0);
          setCalculatingFee(false);
        }
        return;
      }

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        if (isMounted) {
          Alert.alert('Permission Required', 'Location permission is required to calculate accurate delivery charges.');
          setFeeError('Location permission denied. Cannot calculate distance.');
          setDynamicDeliveryFee(0);
          setCalculatingFee(false);
        }
        return;
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          if (!isMounted) return;
          const { latitude, longitude } = position.coords;
          setUserCoords({ latitude, longitude });

          try {
            const startStr = `${shopLocation.longitude},${shopLocation.latitude}`;
            const endStr = `${longitude},${latitude}`;

            let distKm = 0;
            try {
              const response = await fetchWithTimeout(
                `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${startStr}&end=${endStr}`
              );
              if (response.ok) {
                const data = await response.json();
                if (data.features && data.features.length > 0) {
                  const distMeters = data.features[0].properties.summary.distance;
                  distKm = distMeters / 1000;
                }
              } else {
                distKm = calculateDistance(latitude, longitude, shopLocation.latitude, shopLocation.longitude);
              }
            } catch (orsError: any) {
              console.warn('ORS fetch failed, falling back to straight-line:', orsError.message);
              distKm = calculateDistance(latitude, longitude, shopLocation.latitude, shopLocation.longitude);
            }

            if (!isMounted) return;
            if (distKm <= 0 && calculateDistance(latitude, longitude, shopLocation.latitude, shopLocation.longitude) > 0) {
              distKm = calculateDistance(latitude, longitude, shopLocation.latitude, shopLocation.longitude);
            }

            setDistance(distKm);
            const calculatedFee = baseFee + (distKm * perKm);
            setDynamicDeliveryFee(Math.round(calculatedFee));
            setFeeError(null);
            setCalculatingFee(false);
          } catch (error: any) {
            console.error("Error calculating dynamic delivery fee", error);
            if (isMounted) {
              setFeeError('Slow internet: Could not calculate delivery charges. Please check your internet connection.');
              setDynamicDeliveryFee(0);
              setCalculatingFee(false);
            }
          }
        },
        (error) => {
          console.error("GPS error", error);
          if (isMounted) {
            setFeeError('Could not get your location. Please turn on GPS and check internet.');
            setDynamicDeliveryFee(0);
            setCalculatingFee(false);
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (err: any) {
      console.error("readDeliveryConfig failed", err);
      if (isMounted) {
        setFeeError('Slow internet: Could not fetch shop delivery settings.');
        setDynamicDeliveryFee(0);
        setCalculatingFee(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (cartItems.length > 0) {
      calculateFee(isMounted);
    } else {
      setCalculatingFee(false);
      setDynamicDeliveryFee(0);
      setFeeError(null);
    }

    return () => { isMounted = false; };
  }, [cartItems.length]);

  const retryFetchFee = () => {
    calculateFee(true);
  };

  const handleCheckout = () => {
    if (calculatingFee) {
      Alert.alert('Please Wait', 'Calculating delivery charges...');
      return;
    }

    if (feeError) {
      Alert.alert(
        'Please Check Your Internet',
        'Delivery charges could not be calculated due to slow or weak internet. Please check your internet connection and tap Retry.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: retryFetchFee },
        ]
      );
      return;
    }

    navigation.navigate('Checkout', {
      deliveryFee: dynamicDeliveryFee,
      distance,
      deliveryFeePending,
      latitude: userCoords?.latitude,
      longitude: userCoords?.longitude,
    });
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  const grandTotal = subTotal + dynamicDeliveryFee;
  const deliveryFeePending = !calculatingFee && cartItems.length > 0 && dynamicDeliveryFee <= 0 && !feeError;

  return {
    cartItems,
    subTotal,
    dynamicDeliveryFee,
    grandTotal,
    calculatingFee,
    deliveryFeePending,
    feeError,
    distance,
    shopAddress,
    handleIncrease,
    handleDecrease,
    handleCheckout,
    retryFetchFee,
    handleGoBack,
  };
};
