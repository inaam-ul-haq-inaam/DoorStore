import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';

import { PhoneAuthScreen } from '../screens/PhoneAuthScreen';
import { CompleteProfileScreen } from '../screens/CompleteProfileScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  const { user, userProfile } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {user && !userProfile?.full_name ? (
        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      ) : (
        <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
      )}
    </Stack.Navigator>
  );
};
