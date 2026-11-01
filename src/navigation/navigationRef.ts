import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

/**
 * Notification tap se order screen khulne ke liye shared navigation ref.
 * AppNavigator isko <NavigationContainer ref={navigationRef}> me attach karta hai.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
