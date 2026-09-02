import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackNavigationProp } from '../../../navigation/types';

export const useOnboardingController = () => {
  const navigation = useNavigation<RootStackNavigationProp>();

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('@has_launched', 'true');
      navigation.replace('AuthStack', { screen: 'Login' });
    } catch (error) {
      console.error('Error setting item in AsyncStorage:', error);
      navigation.replace('AuthStack', { screen: 'Login' });
    }
  };

  return {
    handleGetStarted,
  };
};
