import { useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CustomerStackParamList, CustomerStackNavigationProp } from '../../../navigation/types';
import { firebaseDb } from '../../../services/firebase';
import { useRef } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

export const useOrderSuccessController = () => {
  const navigation = useNavigation<CustomerStackNavigationProp>();
  const route = useRoute<RouteProp<CustomerStackParamList, 'OrderSuccess'>>();
  const orderId = route.params?.orderId || 'UNKNOWN';

  const [isTrackModalVisible, setTrackModalVisible] = useState(false);
  const [isReceiptModalVisible, setReceiptModalVisible] = useState(false);
  const [orderStatus, setOrderStatus] = useState('incoming');
  const [orderData, setOrderData] = useState<any>(null);
  const viewRef = useRef<any>(null);

  useEffect(() => {
    if (orderId === 'UNKNOWN') return;

    const unsubscribe = firebaseDb
      .collection('orders')
      .doc(orderId)
      .onSnapshot((doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data) {
            setOrderData(data);
            if (data.status) {
              setOrderStatus(data.status);
            }
          }
        }
      });

    return () => unsubscribe();
  }, [orderId]);

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
    });
  };

  const handleTrackOrder = () => {
    setTrackModalVisible(true);
  };

  const closeTrackModal = () => {
    setTrackModalVisible(false);
  };

  const hasAndroidPermission = async () => {
    if (Platform.OS !== 'android') return true;

    if (Platform.Version >= 29) {
      return true; 
    }

    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) return true;

    const status = await PermissionsAndroid.request(permission);
    return status === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handleSaveReceipt = async () => {
    try {
      if (!viewRef.current) return;
      const hasPerm = await hasAndroidPermission();
      if (!hasPerm) {
        Alert.alert('Permission Denied', 'Storage permission is required to save the receipt.');
        return;
      }

      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });

      await CameraRoll.saveAsset(uri, { type: 'photo' });
      Alert.alert('Success', 'Receipt saved to gallery!');
    } catch (error) {
      console.log('Error saving receipt:', error);
      Alert.alert('Error', 'Failed to save receipt.');
    }
  };

  return {
    orderId,
    orderStatus,
    orderData,
    handleBackToHome,
    handleTrackOrder,
    isTrackModalVisible,
    closeTrackModal,
    isReceiptModalVisible,
    setReceiptModalVisible,
    viewRef,
    handleSaveReceipt
  };
};
