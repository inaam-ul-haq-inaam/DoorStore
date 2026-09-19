import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firebaseDb, firebaseAuth } from '../../../services/firebase';
import { readDeliveryConfig, writeDeliveryConfig } from '../../../services/deliveryConfig';

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
        if (!user) return;

        // Pehle shared config dekho, warna apne profile se (purana data).
        const config = await readDeliveryConfig();
        if (config.settings) {
          setBaseFee(config.settings.base_fee.toString());
          setPerKmFee(config.settings.per_km_fee.toString());
          return;
        }

        const doc = await firebaseDb.collection('users').doc(user.uid).get();
        if (doc.exists()) {
          const data = doc.data();
          if (data?.delivery_settings) {
            setBaseFee(data.delivery_settings.base_fee?.toString() || '0');
            setPerKmFee(data.delivery_settings.per_km_fee?.toString() || '0');
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
      const deliverySettings = {
        base_fee: Number(baseFee),
        per_km_fee: Number(perKmFee),
      };

      await firebaseDb.collection('users').doc(user.uid).set({
        delivery_settings: deliverySettings,
      }, { merge: true });

      // Customer app isi shared doc se fees padhta hai
      // (users doc customer ke liye readable nahi hai).
      await writeDeliveryConfig({ delivery_settings: deliverySettings });

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
