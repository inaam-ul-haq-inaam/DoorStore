import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';

// Screens
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { OrderSuccessScreen } from '../screens/OrderSuccessScreen';
import { CustomerChatScreen } from '../screens/CustomerChatScreen';
import { PolicyScreen } from '../../screens/PolicyScreen';

// Types
import { CustomerStackParamList } from '../../navigation/types';

const Stack = createNativeStackNavigator<CustomerStackParamList>();

export const CustomerNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="CustomerChat" component={CustomerChatScreen} />
      <Stack.Screen name="Policy" component={PolicyScreen} />
    </Stack.Navigator>
  );
};
