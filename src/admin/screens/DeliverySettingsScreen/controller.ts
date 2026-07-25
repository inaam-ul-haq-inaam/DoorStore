import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firebaseDb, firebaseAuth } from '../../../services/firebase';

export const useDeliverySettingsController = () => {
  const navigation = useNavigation();
  const [baseFee, setBaseFee] = useState('0');
  const [perKmFee, setPerKmFee] = useState('0');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const user = firebaseAuth.currentUser;
        if (user) {
          const doc = await firebaseDb.collection('users').doc(user.uid).get();
          if (doc.exists()) {
            const data = doc.data();
            if (data?.delivery_settings) {
              setBaseFee(data.delivery_settings.base_fee?.toString() || '0');
              setPerKmFee(data.delivery_settings.per_km_fee?.toString() || '0');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching delivery settings', error);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    const user = firebaseAuth.currentUser;
    if (!user) return;

    if (isNaN(Number(baseFee)) || isNaN(Number(perKmFee))) {
      Alert.alert('Validation Error', 'Please enter valid numbers for the fees.');
      return;
    }

    setLoading(true);
    try {
      await firebaseDb.collection('users').doc(user.uid).set({
        delivery_settings: {
          base_fee: Number(baseFee),
          per_km_fee: Number(perKmFee)
        }
      }, { merge: true });

      Alert.alert('Success', 'Delivery settings saved successfully!');
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving delivery settings', error);
      Alert.alert('Error', 'Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  return {
    baseFee,
    setBaseFee,
    perKmFee,
    setPerKmFee,
    loading,
    fetching,
    handleSave,
    handleGoBack
  };
};
