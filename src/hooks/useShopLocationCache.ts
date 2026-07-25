import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ShopLocation {
  address?: string;
  lat?: number;
  lng?: number;
}

export const useShopLocationCache = () => {
  const [shopLocation, setShopLocation] = useState<ShopLocation>({});

  const loadLocation = async () => {
    try {
      const stored = await AsyncStorage.getItem('@shop_location');
      if (stored) {
        setShopLocation(JSON.parse(stored));
      }

      // Force sync from Firebase for Admin
      const { firebaseAuth, firebaseDb } = require('../services/firebase');
      const user = firebaseAuth.currentUser;
      if (user) {
        const doc = await firebaseDb.collection('users').doc(user.uid).get();
        if (doc.exists) {
          const data = doc.data();
          if (data.shop_location) {
            setShopLocation(data.shop_location);
            await AsyncStorage.setItem('@shop_location', JSON.stringify(data.shop_location));
          }
        }
      }
    } catch (e) {
      console.log('Error loading shop location from cache', e);
    }
  };

  const updateLocation = async (updates: Partial<ShopLocation>) => {
    try {
      const newLocation = { ...shopLocation, ...updates };
      await AsyncStorage.setItem('@shop_location', JSON.stringify(newLocation));
      setShopLocation(newLocation);
    } catch (e) {
      console.log('Error saving shop location to cache', e);
    }
  };

  useEffect(() => {
    loadLocation();
  }, []);

  return { shopLocation, updateLocation, refreshLocation: loadLocation };
};
