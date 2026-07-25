import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

// Navigators
import { CustomerNavigator } from '../customer/navigation/CustomerNavigator';
import { AdminNavigator } from '../admin/navigation/AdminNavigator';
import { AuthNavigator } from '../auth/navigation/AuthNavigator';

// Screens
import { OnboardingScreen } from '../onboarding/screens/OnboardingScreen';
import { SplashScreen } from '../splash/SplashScreen';

// Types
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isSplashAnimationDone, setIsSplashAnimationDone] = useState(false);
  const { user, userProfile, loading: authLoading } = useAuth();

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('@has_launched');
        if (hasLaunched === null) {
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
        setIsFirstLaunch(false); 
      }
    };
    
    checkFirstLaunch();
  }, []);

  // Wait for both First Launch verification, Firebase Auth, and Splash Animation
  if (isFirstLaunch === null || authLoading || !isSplashAnimationDone) {
    return <SplashScreen onAnimationComplete={() => setIsSplashAnimationDone(true)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false, animation: 'fade' }}
        initialRouteName={isFirstLaunch ? "Onboarding" : (!user || !userProfile?.full_name) ? "AuthStack" : (userProfile?.role === 'admin' || userProfile?.role === 'shopkeeper') ? "AdminApp" : "CustomerApp"}
      >
        {/* Unauthenticated Stacks */}
        {(!user || !userProfile?.full_name) && (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="AuthStack" component={AuthNavigator} />
          </>
        )}
        
        {/* Main App Stacks (Admin vs Customer) */}
        {user && userProfile?.full_name && (userProfile.role === 'admin' || userProfile.role === 'shopkeeper') && (
          <Stack.Screen name="AdminApp" component={AdminNavigator} />
        )}
        {user && userProfile?.full_name && (userProfile.role !== 'admin' && userProfile.role !== 'shopkeeper') && (
          <Stack.Screen name="CustomerApp" component={CustomerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
