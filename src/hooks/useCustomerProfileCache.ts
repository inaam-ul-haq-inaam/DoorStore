import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CustomerProfile {
  fullName?: string;
  address?: string;
}

export const useCustomerProfileCache = () => {
  const [profile, setProfile] = useState<CustomerProfile>({});

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem('@customer_profile');
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (e) {
      console.log('Error loading customer profile from cache', e);
    }
  };

  const updateProfile = async (updates: Partial<CustomerProfile>) => {
    try {
      const newProfile = { ...profile, ...updates };
      await AsyncStorage.setItem('@customer_profile', JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (e) {
      console.log('Error saving customer profile to cache', e);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return { profile, updateProfile, refreshProfile: loadProfile };
};
