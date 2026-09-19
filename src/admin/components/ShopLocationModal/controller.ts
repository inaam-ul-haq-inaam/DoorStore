import { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseDb, firebaseAuth } from '../../../services/firebase';
import { writeDeliveryConfig } from '../../../services/deliveryConfig';
import { useShopLocationCache } from '../../../hooks/useShopLocationCache';

export const useShopLocationController = (isVisible: boolean, onClose: () => void, onSave?: (address: string) => void) => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingGpsLocation, setFetchingGpsLocation] = useState(false);

  const { shopLocation, updateLocation } = useShopLocationCache();

  useEffect(() => {
    if (isVisible && shopLocation?.address) {
      setAddress(shopLocation.address);
    }
  }, [isVisible, shopLocation]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Shop Location Permission',
          message: 'We need your location to set the shop delivery origin.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleUseGpsLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }
      setFetchingGpsLocation(true);
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { 'Accept-Language': 'en', 'User-Agent': 'DoorStoreApp/1.0' } }
            );
            const data = await res.json();
            const addr = data?.display_name
              ? data.display_name.split(',').slice(0, 3).join(', ')
              : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setAddress(addr);
          } catch {
            setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          } finally {
            setFetchingGpsLocation(false);
          }
        },
        (error) => {
          setFetchingGpsLocation(false);
          Alert.alert('Error', 'Could not get location. Please enter manually.');
          console.log('GPS error:', error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } catch (e) {
      setFetchingGpsLocation(false);
      Alert.alert('Error', 'Location permission failed.');
    }
  };

  const handleSaveLocation = async () => {
    if (!address.trim()) {
      Alert.alert('Validation', 'Please enter a shop address.');
      return;
    }

    setLoading(true);
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Cannot set location without permission.');
      setLoading(false);
      return;
    }

    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const locationData = { address: address.trim(), lat: latitude, lng: longitude };
          const shopLocation = { latitude, longitude, address: address.trim() };

          await updateLocation(locationData);

          const user = firebaseAuth.currentUser;
          if (user) {
            await firebaseDb.collection('users').doc(user.uid).set({
              shop_location: shopLocation
            }, { merge: true });
          }

          // Customer app isi shared doc se shop location padhta hai
          // (users doc customer ke liye readable nahi hai).
          await writeDeliveryConfig({ shop_location: shopLocation });

          Alert.alert('Success', 'Shop location saved successfully!');
          if (onSave) onSave(address.trim());
          onClose();
        } catch (error) {
          Alert.alert('Error', 'Failed to save location.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        Alert.alert('Location Error', error.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  return { address, setAddress, loading, handleSaveLocation, fetchingGpsLocation, handleUseGpsLocation };
};
